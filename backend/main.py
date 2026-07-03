"""
Single backend serving both the web dashboard and the Discord bot.
Run with: uvicorn main:app --reload --port 8000
"""

import asyncio
import json
from datetime import datetime, timezone
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from devices import create_initial_devices, ROOMS, ROOM_LABELS, Device
from simulator import Simulator
from alerts import check_alerts

app = FastAPI(title="Office Monitor Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten this before any real deployment
    allow_methods=["*"],
    allow_headers=["*"],
)

devices: List[Device] = create_initial_devices()

# very rough running total for "today's estimated usage" -- accumulates
# watt-seconds while devices are on, converted to kWh on read.
_energy_watt_seconds = 0.0
_last_tick = datetime.now(timezone.utc)


class ConnectionManager:
    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, payload: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_text(json.dumps(payload))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


def total_power_now() -> int:
    return sum(d.power_watts for d in devices if d.status)


def per_room_power() -> dict:
    result = {room: 0 for room in ROOMS}
    for d in devices:
        if d.status:
            result[d.room] += d.power_watts
    return result


async def _on_device_change(device: Device):
    await manager.broadcast({
        "type": "device_update",
        "device": device.to_dict(),
        "total_power": total_power_now(),
        "per_room_power": per_room_power(),
        "alerts": check_alerts(devices),
    })


async def _energy_accumulator():
    """Ticks every second, adding to the running watt-seconds tally."""
    global _energy_watt_seconds, _last_tick
    while True:
        await asyncio.sleep(1)
        now = datetime.now(timezone.utc)
        elapsed = (now - _last_tick).total_seconds()
        _energy_watt_seconds += total_power_now() * elapsed
        _last_tick = now


def _sync_on_change(device: Device):
    asyncio.create_task(_on_device_change(device))


simulator = Simulator(devices, on_change=_sync_on_change, interval_seconds=5.0)


@app.on_event("startup")
async def startup():
    simulator.start()
    asyncio.create_task(_energy_accumulator())


@app.get("/devices")
def get_devices():
    return [d.to_dict() for d in devices]


@app.get("/devices/{room}")
def get_room_devices(room: str):
    if room not in ROOMS:
        return {"error": f"unknown room '{room}'. valid rooms: {ROOMS}"}
    return [d.to_dict() for d in devices if d.room == room]


@app.get("/usage")
def get_usage():
    return {
        "total_power_watts": total_power_now(),
        "per_room_watts": {ROOM_LABELS[r]: w for r, w in per_room_power().items()},
        "estimated_kwh_today": round(_energy_watt_seconds / 3_600_000, 3),
    }


@app.get("/alerts")
def get_alerts():
    return check_alerts(devices)


@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await manager.connect(ws)
    # send initial full snapshot on connect
    await ws.send_text(json.dumps({
        "type": "snapshot",
        "devices": [d.to_dict() for d in devices],
        "total_power": total_power_now(),
        "per_room_power": per_room_power(),
        "alerts": check_alerts(devices),
    }))
    try:
        while True:
            await ws.receive_text()  # keep connection open; we don't expect client messages
    except WebSocketDisconnect:
        manager.disconnect(ws)
