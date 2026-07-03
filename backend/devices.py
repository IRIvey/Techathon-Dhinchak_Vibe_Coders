"""
Device model + initial device set for the office.

NOTE on device count: the problem statement contains an internal inconsistency
-- it states "2 fans + 3 lights = 5 devices per room, 15 devices total" in one
place, but refers to "18 devices" elsewhere (its own summary graphic even lists
6 fans + 9 lights = 15, while labeling the total as 18). This implementation
uses the literal per-room breakdown (2 fans + 3 lights x 3 rooms = 15 devices).
Confirm with organizers if the discrepancy matters for scoring.
"""

from dataclasses import dataclass, asdict, field
from datetime import datetime, timezone
from typing import List, Optional

ROOMS = ["drawing", "work1", "work2"]

ROOM_LABELS = {
    "drawing": "Drawing Room",
    "work1": "Work Room 1",
    "work2": "Work Room 2",
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class Device:
    id: str
    name: str
    type: str          # "fan" or "light"
    room: str           # one of ROOMS
    status: bool         # True = on
    power_watts: int      # rated draw when on
    last_changed: str      # ISO timestamp of last status flip
    on_since: Optional[str] = None  # set when turned on, cleared when turned off

    def to_dict(self):
        d = asdict(self)
        d["room_label"] = ROOM_LABELS[self.room]
        return d


def create_initial_devices() -> List[Device]:
    """Builds the 15 devices (2 fans @ 60W + 3 lights @ 15W per room), all off."""
    devices: List[Device] = []
    ts = now_iso()
    for room in ROOMS:
        for i in range(1, 3):
            devices.append(Device(
                id=f"{room}-fan{i}",
                name=f"Fan {i}",
                type="fan",
                room=room,
                status=False,
                power_watts=60,
                last_changed=ts,
                on_since=None,
            ))
        for i in range(1, 4):
            devices.append(Device(
                id=f"{room}-light{i}",
                name=f"Light {i}",
                type="light",
                room=room,
                status=False,
                power_watts=15,
                last_changed=ts,
                on_since=None,
            ))
    return devices
