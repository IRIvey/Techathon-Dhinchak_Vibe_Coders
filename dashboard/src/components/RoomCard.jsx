import DeviceCard from './DeviceCard';

export default function RoomCard({ roomName, devices, onDeviceClick }) {
  const fans = devices.filter(d => d.type === 'fan');
  const lights = devices.filter(d => d.type === 'light');

  
  const fansOn = fans.filter(f => f.status === 'on').length;
  const lightsOn = lights.filter(l => l.status === 'on').length;

  
  const totalPower = devices
    .filter(d => d.status === 'on')
    .reduce((sum, d) => sum + d.powerW, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
      {/* Room Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          {roomName}
        </h3>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Power
            </span>
            <span className="text-lg font-bold text-gray-900">
              {totalPower}W
            </span>
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              Active
            </span>
            <span className="text-lg font-bold text-gray-900">
              {fansOn + lightsOn}/{fans.length + lights.length}
            </span>
          </div>
        </div>
      </div>

      {/* Fans Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Fans
          </p>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
            {fansOn}/{fans.length} on
          </span>
        </div>
        <div className="space-y-2">
          {fans.map(fan => (
            <DeviceCard
              key={fan.id}
              device={fan}
              onClick={() => onDeviceClick?.(fan.id)}
            />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mb-6" />

      {/* Lights Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Lights
          </p>
          <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
            {lightsOn}/{lights.length} on
          </span>
        </div>
        <div className="space-y-2">
          {lights.map(light => (
            <DeviceCard
              key={light.id}
              device={light}
              onClick={() => onDeviceClick?.(light.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}