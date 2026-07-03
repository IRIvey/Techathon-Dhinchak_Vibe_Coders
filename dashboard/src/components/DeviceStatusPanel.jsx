
import RoomCard from './RoomCard';
import { ROOMS } from '../data/backendApi';

export default function DeviceStatusPanel({ deviceState, onDeviceClick }) {
  
  const totalDevices = Object.keys(deviceState).length;
  const activeDevices = Object.values(deviceState).filter(
    d => d.status === 'on'
  ).length;

  return (
    <section className="bg-gray-50 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Device Status
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {activeDevices} of {totalDevices} devices currently active
          </p>
        </div>

        {/* Room Grid */}
        {totalDevices === 0 ? (
          
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-600">Loading devices...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ROOMS.map(room => {
              const roomDevices = Object.values(deviceState).filter(
                d => d.room === room
              );

              return (
                <RoomCard
                  key={room}
                  roomName={room}
                  devices={roomDevices}
                  onDeviceClick={onDeviceClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}