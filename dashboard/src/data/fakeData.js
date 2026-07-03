// src/data/fakeData.js

export const ROOMS = ['Drawing Room', 'Work Room 1', 'Work Room 2'];

export const DEVICE_CONFIG = {
  'Drawing Room': {
    fans: [
      { id: 'dr-fan-1', name: 'Fan 1', type: 'fan', powerW: 60 },
      { id: 'dr-fan-2', name: 'Fan 2', type: 'fan', powerW: 60 }
    ],
    lights: [
      { id: 'dr-light-1', name: 'Light 1', type: 'light', powerW: 15 },
      { id: 'dr-light-2', name: 'Light 2', type: 'light', powerW: 15 },
      { id: 'dr-light-3', name: 'Light 3', type: 'light', powerW: 15 }
    ]
  },
  'Work Room 1': {
    fans: [
      { id: 'wr1-fan-1', name: 'Fan 1', type: 'fan', powerW: 60 },
      { id: 'wr1-fan-2', name: 'Fan 2', type: 'fan', powerW: 60 }
    ],
    lights: [
      { id: 'wr1-light-1', name: 'Light 1', type: 'light', powerW: 15 },
      { id: 'wr1-light-2', name: 'Light 2', type: 'light', powerW: 15 },
      { id: 'wr1-light-3', name: 'Light 3', type: 'light', powerW: 15 }
    ]
  },
  'Work Room 2': {
    fans: [
      { id: 'wr2-fan-1', name: 'Fan 1', type: 'fan', powerW: 60 },
      { id: 'wr2-fan-2', name: 'Fan 2', type: 'fan', powerW: 60 }
    ],
    lights: [
      { id: 'wr2-light-1', name: 'Light 1', type: 'light', powerW: 15 },
      { id: 'wr2-light-2', name: 'Light 2', type: 'light', powerW: 15 },
      { id: 'wr2-light-3', name: 'Light 3', type: 'light', powerW: 15 }
    ]
  }
};

/**
 * Initialize device state with all devices OFF
 * This gives us a clean starting point
 */
export function initializeDeviceState() {
  const state = {};

  ROOMS.forEach(room => {
    const devices = DEVICE_CONFIG[room];
    const allDevices = [...devices.fans, ...devices.lights];

    allDevices.forEach(device => {
      state[device.id] = {
        ...device,
        room,
        status: 'off',
        lastChanged: new Date().toISOString()
      };
    });
  });

  return state;
}

/**
 * Simulate realistic device behavior
 *
 * Strategy:
 * - Lights and fans turn on/off randomly
 * - More likely to be on during "business hours" (9 AM - 5 PM)
 * - Some devices stay on longer than others
 * - Creates a living, breathing simulation
 */
export function simulateDeviceChange(deviceState) {
  const newState = { ...deviceState };
  const now = new Date();
  const hour = now.getHours();

  // Probability of a device toggling based on time of day
  // Higher during business hours
  const isBusinessHours = hour >= 9 && hour < 17;
  const toggleProbability = isBusinessHours ? 0.03 : 0.01; // 3% or 1% chance

  Object.keys(newState).forEach(deviceId => {
    const device = newState[deviceId];
    const lastChanged = new Date(device.lastChanged);
    const timeSinceChange = (now - lastChanged) / 60000; // minutes

    // Devices are less likely to toggle if they just changed
    const minTimeBetweenToggle = device.type === 'fan' ? 5 : 3; // min/max minutes

    // Decide whether to toggle
    if (timeSinceChange > minTimeBetweenToggle && Math.random() < toggleProbability) {
      newState[deviceId] = {
        ...device,
        status: device.status === 'on' ? 'off' : 'on',
        lastChanged: now.toISOString()
      };
    }
  });

  return newState;
}

/**
 * Calculate total power draw from device state
 */
export function calculateTotalPower(deviceState) {
  return Object.values(deviceState).reduce((sum, device) => {
    return sum + (device.status === 'on' ? device.powerW : 0);
  }, 0);
}

/**
 * Calculate power per room
 */
export function calculatePowerPerRoom(deviceState) {
  const perRoom = {};

  ROOMS.forEach(room => {
    perRoom[room] = Object.values(deviceState)
      .filter(device => device.room === room && device.status === 'on')
      .reduce((sum, device) => sum + device.powerW, 0);
  });

  return perRoom;
}

/**
 * Generate alert conditions
 *
 * Alert Types:
 * 1. "After Hours" - Device on after 5 PM (high severity)
 * 2. "Continuous On" - Device on for 2+ hours (medium severity)
 * 3. "All Devices On" - Room has all devices on (medium severity)
 */
export function generateAlerts(deviceState) {
  const alerts = [];
  const now = new Date();
  const hour = now.getHours();
  const OFFICE_START = 9;
  const OFFICE_END = 17; // 5 PM

  Object.values(deviceState).forEach(device => {
    // Alert 1: Device on after office hours
    if (device.status === 'on' && (hour < OFFICE_START || hour >= OFFICE_END)) {
      alerts.push({
        id: `alert-after-hours-${device.id}`,
        type: 'after-hours',
        severity: 'high',
        message: `${device.name} in ${device.room} left ON after hours`,
        device: device.id,
        timestamp: now.toISOString()
      });
    }

    // Alert 2: Device on for 2+ hours continuously
    const lastChanged = new Date(device.lastChanged);
    const hoursOn = (now - lastChanged) / (1000 * 60 * 60);
    if (device.status === 'on' && hoursOn >= 2) {
      alerts.push({
        id: `alert-continuous-${device.id}`,
        type: 'continuous-on',
        severity: 'medium',
        message: `${device.name} in ${device.room} has been ON for ${Math.round(hoursOn)} hours`,
        device: device.id,
        timestamp: now.toISOString()
      });
    }
  });

  // Alert 3: Room with all devices on
  ROOMS.forEach(room => {
    const roomDevices = Object.values(deviceState).filter(d => d.room === room);
    const allDevicesOn = roomDevices.every(d => d.status === 'on');

    if (allDevicesOn && roomDevices.length > 0) {
      alerts.push({
        id: `alert-room-full-${room}`,
        type: 'room-full',
        severity: 'medium',
        message: `All devices in ${room} are ON simultaneously`,
        device: null,
        timestamp: now.toISOString()
      });
    }
  });

  return alerts;
}

/**
 * Device Simulator Class
 *
 * This manages the simulation lifecycle:
 * - Start/stop simulation
 * - Control update intervals
 * - Optional: preset scenarios
 *
 * Usage:
 *   const simulator = new DeviceSimulator(1000); // 1 second interval
 *   simulator.start(initialState, (newState) => {
 *     console.log('Updated!', newState);
 *   });
 */
export class DeviceSimulator {
  constructor(updateIntervalMs = 2000) {
    this.updateIntervalMs = updateIntervalMs;
    this.intervalId = null;
    this.isRunning = false;
    this.currentState = null;
  }

  /**
   * Start the simulator
   * @param {Object} initialState - Starting device state
   * @param {Function} onUpdate - Callback when state changes
   */
  start(initialState, onUpdate) {
    if (this.isRunning) {
      console.warn('Simulator already running');
      return;
    }

    this.currentState = initialState;
    this.isRunning = true;

    // Trigger immediate update so UI shows something
    onUpdate(this.currentState);

    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.currentState = simulateDeviceChange(this.currentState);
      onUpdate(this.currentState);
    }, this.updateIntervalMs);
  }

  /**
   * Stop the simulator
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
  }

  /**
   * Get current state without triggering an update
   */
  getState() {
    return this.currentState;
  }

  /**
   * Manually toggle a device (user interaction)
   * This triggers an update immediately
   */
  toggleDevice(deviceId, onUpdate) {
    if (!this.currentState || !this.currentState[deviceId]) {
      console.error(`Device ${deviceId} not found`);
      return;
    }

    this.currentState = {
      ...this.currentState,
      [deviceId]: {
        ...this.currentState[deviceId],
        status: this.currentState[deviceId].status === 'on' ? 'off' : 'on',
        lastChanged: new Date().toISOString()
      }
    };

    onUpdate(this.currentState);
  }

  /**
   * Change the update interval
   * Useful for testing different speeds
   */
  setUpdateInterval(intervalMs) {
    this.updateIntervalMs = intervalMs;
    if (this.isRunning) {
      this.stop();
      this.start(this.currentState, () => {});
    }
  }
}