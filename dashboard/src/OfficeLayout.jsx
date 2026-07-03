// Visual top-view layout of the office. Lights glow when ON, fans spin when ON.
// Positions are laid out roughly per the office floor plan in the problem statement
// (Drawing Room, Work Room 1, Work Room 2 side by side).

const ROOM_ORDER = ['drawing', 'work1', 'work2']
const ROOM_LABELS = {
  drawing: 'Drawing Room',
  work1: 'Work Room 1',
  work2: 'Work Room 2',
}

function FanIcon({ on }) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-lg ${
        on ? 'border-sky-400 bg-sky-50' : 'border-slate-300 bg-white'
      }`}
    >
      <span
        className={on ? 'inline-block animate-spin' : 'inline-block'}
        style={{ animationDuration: on ? '0.6s' : undefined }}
      >
        ✦
      </span>
    </div>
  )
}

function LightIcon({ on }) {
  return (
    <div
      className={`h-6 w-6 rounded-full border-2 transition-all duration-300 ${
        on
          ? 'border-amber-300 bg-amber-300 shadow-[0_0_16px_6px_rgba(252,211,77,0.7)]'
          : 'border-slate-300 bg-slate-100'
      }`}
    />
  )
}

function RoomBlock({ room, devices }) {
  const fans = devices.filter((d) => d.room === room && d.type === 'fan')
  const lights = devices.filter((d) => d.room === room && d.type === 'light')

  return (
    <div className="flex flex-1 flex-col rounded-lg border border-slate-300 bg-slate-50/60 p-3">
      <div className="mb-3 flex justify-center gap-6">
        {lights.map((l) => (
          <LightIcon key={l.id} on={l.status} />
        ))}
      </div>
      <div className="flex flex-1 items-center justify-center gap-6">
        {fans.map((f) => (
          <FanIcon key={f.id} on={f.status} />
        ))}
      </div>
      <div className="mt-3 text-center text-xs font-medium text-slate-500">
        {ROOM_LABELS[room]}
      </div>
    </div>
  )
}

export default function OfficeLayout({ devices }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-800">Office Layout (Top View)</h3>
      <div className="flex gap-3">
        {ROOM_ORDER.map((room) => (
          <RoomBlock key={room} room={room} devices={devices} />
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-slate-400">
        Lights glow amber when ON &middot; Fans spin when ON
      </p>
    </div>
  )
}