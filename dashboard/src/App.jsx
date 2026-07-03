import { useEffect, useRef, useState } from 'react'

const BACKEND_HTTP = 'http://localhost:8000'
const BACKEND_WS = 'ws://localhost:8000/ws'

const ROOM_ORDER = ['drawing', 'work1', 'work2']
const ROOM_LABELS = {
  drawing: 'Drawing Room',
  work1: 'Work Room 1',
  work2: 'Work Room 2',
}

function DeviceCard({ device }) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
        device.status
          ? 'border-amber-400 bg-amber-50'
          : 'border-slate-200 bg-slate-50'
      }`}
    >
      <span className="font-medium text-slate-700">{device.name}</span>
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          device.status ? 'bg-amber-400 shadow-[0_0_6px_2px_rgba(251,191,36,0.6)]' : 'bg-slate-300'
        }`}
      />
    </div>
  )
}

function RoomPanel({ room, devices }) {
  const roomDevices = devices.filter((d) => d.room === room)
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 font-semibold text-slate-800">{ROOM_LABELS[room]}</h3>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {roomDevices.map((d) => (
          <DeviceCard key={d.id} device={d} />
        ))}
      </div>
    </div>
  )
}

function PowerMeter({ totalPower, perRoomPower }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-semibold text-slate-800">Live Power Consumption</h3>
      <p className="text-3xl font-bold text-slate-900">{totalPower} W</p>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        {ROOM_ORDER.map((room) => (
          <div key={room} className="flex justify-between">
            <span>{ROOM_LABELS[room]}</span>
            <span>{perRoomPower[room] ?? 0} W</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertsPanel({ alerts }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 font-semibold text-slate-800">Active Alerts</h3>
      {alerts.length === 0 ? (
        <p className="text-sm text-slate-500">No active alerts.</p>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a, i) => (
            <li key={i} className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              <span className="font-medium">{a.message}</span>
              <div className="text-xs text-red-400">
                {new Date(a.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function App() {
  const [devices, setDevices] = useState([])
  const [totalPower, setTotalPower] = useState(0)
  const [perRoomPower, setPerRoomPower] = useState({})
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    // initial REST fetch so the UI has data even before the WS connects
    fetch(`${BACKEND_HTTP}/devices`)
      .then((r) => r.json())
      .then(setDevices)
      .catch(() => {})

    const ws = new WebSocket(BACKEND_WS)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data)
      if (msg.type === 'snapshot') {
        setDevices(msg.devices)
        setTotalPower(msg.total_power)
        setPerRoomPower(msg.per_room_power)
        setAlerts(msg.alerts)
      } else if (msg.type === 'device_update') {
        setDevices((prev) =>
          prev.map((d) => (d.id === msg.device.id ? msg.device : d))
        )
        setTotalPower(msg.total_power)
        setPerRoomPower(msg.per_room_power)
        setAlerts(msg.alerts)
      }
    }

    return () => ws.close()
  }, [])

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Office Monitor</h1>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {connected ? 'Live' : 'Disconnected'}
          </span>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <PowerMeter totalPower={totalPower} perRoomPower={perRoomPower} />
          <AlertsPanel alerts={alerts} />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ROOM_ORDER.map((room) => (
            <RoomPanel key={room} room={room} devices={devices} />
          ))}
        </div>
      </div>
    </div>
  )
}
