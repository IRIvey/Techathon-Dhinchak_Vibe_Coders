"""
Background simulator: periodically flips a random device's on/off state so the
dashboard/bot always have something live to show. This stands in for real
sensor data until actual hardware is wired up.
"""

import asyncio
import random
from typing import Callable, List

from devices import Device, now_iso


class Simulator:
    def __init__(self, devices: List[Device], on_change: Callable[[Device], None],
                 interval_seconds: float = 5.0):
        self.devices = devices
        self.on_change = on_change
        self.interval_seconds = interval_seconds
        self._task: asyncio.Task | None = None

    def start(self):
        self._task = asyncio.create_task(self._run())

    async def _run(self):
        while True:
            await asyncio.sleep(self.interval_seconds)
            device = random.choice(self.devices)
            self._toggle(device)
            self.on_change(device)

    def _toggle(self, device: Device):
        device.status = not device.status
        ts = now_iso()
        device.last_changed = ts
        device.on_since = ts if device.status else None
