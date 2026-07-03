const DEFAULT_HTTP = 'http://localhost:8000';
const DEFAULT_WS = 'ws://localhost:8000/ws';

export const BACKEND_HTTP = import.meta.env?.VITE_BACKEND_HTTP || DEFAULT_HTTP;
export const BACKEND_WS = import.meta.env?.VITE_BACKEND_WS || DEFAULT_WS;

export const ROOMS = ['Drawing Room', 'Work Room 1', 'Work Room 2'];

function normalizeDevice(d) {
  return {
    id: d.id,
    name: d.name,
    type: d.type,
    room: d.room_label,
    status: d.status ? 'on' : 'off',
    powerW: d.power_watts,
    lastChanged: d.last_changed,
  };
}


export function buildDeviceState(deviceArray) {
  const state = {};
  deviceArray.forEach((d) => {
    state[d.id] = normalizeDevice(d);
  });
  return state;
}

const SEVERITY_BY_TYPE = {
  after_hours: 'high',
  continuous_on: 'medium',
};

export function normalizeAlerts(alertArray) {
  return alertArray.map((a, i) => ({
    id: `${a.type}-${a.timestamp}-${i}`,
    type: a.type,
    severity: SEVERITY_BY_TYPE[a.type] || 'medium',
    message: a.message,
    timestamp: a.timestamp,
  }));
}


export class BackendConnection {
  constructor({ onDevices, onAlerts, onConnectionChange }) {
    this.onDevices = onDevices;
    this.onAlerts = onAlerts;
    this.onConnectionChange = onConnectionChange;
    this.ws = null;
  }

  start() {
   
    fetch(`${BACKEND_HTTP}/devices`)
      .then((r) => r.json())
      .then((devices) => this.onDevices(buildDeviceState(devices)))
      .catch(() => {});

    fetch(`${BACKEND_HTTP}/alerts`)
      .then((r) => r.json())
      .then((alerts) => this.onAlerts(normalizeAlerts(alerts)))
      .catch(() => {});

    const ws = new WebSocket(BACKEND_WS);
    this.ws = ws;

    ws.onopen = () => this.onConnectionChange?.(true);
    ws.onclose = () => this.onConnectionChange?.(false);
    ws.onerror = () => this.onConnectionChange?.(false);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === 'snapshot') {
        this.onDevices(buildDeviceState(msg.devices));
        this.onAlerts(normalizeAlerts(msg.alerts));
      } else if (msg.type === 'device_update') {
       
        this.onDevices((prevState) => ({
          ...prevState,
          [msg.device.id]: normalizeDevice(msg.device),
        }));
        this.onAlerts(normalizeAlerts(msg.alerts));
      }
    };
  }

  stop() {
    this.ws?.close();
    this.ws = null;
  }

  
  async toggleDevice(deviceId) {
    try {
      await fetch(`${BACKEND_HTTP}/devices/${deviceId}/toggle`, { method: 'POST' });
    } catch {
    }
  }
}
