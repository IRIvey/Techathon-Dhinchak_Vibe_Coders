"""
Alert rules:
  1. After-hours: any device left on outside 9 AM - 5 PM (local time).
  2. Continuous-on: a room where every device has been on for more than
     CONTINUOUS_ON_THRESHOLD_MINUTES minutes without interruption.

Threshold is configurable via env var so it can be shortened for a live demo
(the spec's real-world value is 2 hours, which is impractical to demo live).
"""

import os
from datetime import datetime, timezone
from typing import List, Dict

from devices import Device, ROOM_LABELS, ROOMS

OFFICE_HOURS_START = 9   # 9 AM
OFFICE_HOURS_END = 17    # 5 PM
CONTINUOUS_ON_THRESHOLD_MINUTES = int(os.getenv("CONTINUOUS_ON_THRESHOLD_MINUTES", "120"))


def _now():
    return datetime.now(timezone.utc)


def check_alerts(devices: List[Device]) -> List[Dict]:
    alerts = []
    now = _now()
    is_after_hours = not (OFFICE_HOURS_START <= now.hour < OFFICE_HOURS_END)

    # Rule 1: after-hours devices left on
    if is_after_hours:
        on_devices = [d for d in devices if d.status]
        if on_devices:
            by_room: Dict[str, int] = {}
            for d in on_devices:
                by_room[d.room] = by_room.get(d.room, 0) + 1
            summary = ", ".join(f"{ROOM_LABELS[r]} ({c} device{'s' if c != 1 else ''})"
                                 for r, c in by_room.items())
            alerts.append({
                "type": "after_hours",
                "message": f"Devices left on after office hours: {summary}",
                "timestamp": now.isoformat(),
            })

    # Rule 2: a room fully on continuously beyond threshold
    for room in ROOMS:
        room_devices = [d for d in devices if d.room == room]
        if all(d.status and d.on_since for d in room_devices):
            oldest_on_since = min(datetime.fromisoformat(d.on_since) for d in room_devices)
            minutes_on = (now - oldest_on_since).total_seconds() / 60
            if minutes_on >= CONTINUOUS_ON_THRESHOLD_MINUTES:
                alerts.append({
                    "type": "continuous_on",
                    "message": (f"{ROOM_LABELS[room]} has had all devices on "
                                f"for {int(minutes_on)} minutes continuously."),
                    "timestamp": now.isoformat(),
                })

    return alerts
