import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import PowerMeter from './components/PowerMeter';
import DeviceStatusPanel from './components/DeviceStatusPanel';
import AlertsPanel from './components/AlertsPanel';
import { calculateTotalPower, calculatePowerPerRoom } from './data/fakeData';
import { BackendConnection } from './data/backendApi';

export default function App() {
  const [deviceState, setDeviceState] = useState({});
  const [totalPower, setTotalPower] = useState(0);
  const [powerPerRoom, setPowerPerRoom] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  const connectionRef = useRef(null);

  useEffect(() => {
    connectionRef.current = new BackendConnection({
      onDevices: setDeviceState,
      onAlerts: setAlerts,
      onConnectionChange: setConnected,
    });
    connectionRef.current.start();

    return () => connectionRef.current?.stop();
  }, []);

  useEffect(() => {
    setTotalPower(calculateTotalPower(deviceState));
    setPowerPerRoom(calculatePowerPerRoom(deviceState));
  }, [deviceState]);

  
  const handleDeviceClick = (deviceId) => {
    connectionRef.current?.toggleDevice(deviceId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="bg-blue-50 border-b-2 border-blue-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-sm">
            <p className="font-semibold text-gray-900">
              Backend Connection:{' '}
              <span
                className={`transition-all duration-300 ${
                  connected ? 'text-green-600 animate-pulse' : 'text-red-600'
                }`}
              >
                {connected ? 'Live' : 'Disconnected'}
              </span>
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Streaming real device data over WebSocket from the office monitor backend.
            </p>
          </div>
        </div>
      </div>

      <PowerMeter totalPower={totalPower} powerPerRoom={powerPerRoom} />
      <DeviceStatusPanel deviceState={deviceState} onDeviceClick={handleDeviceClick} />
      <AlertsPanel alerts={alerts} />
    </div>
  );
}
