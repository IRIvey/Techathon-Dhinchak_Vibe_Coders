import fanIcon from '../assets/icons/fan.png';
import lightIcon from '../assets/icons/light.png';

function getTimeAgo(timestamp) {
  const now = new Date();
  const changed = new Date(timestamp);
  const diff = Math.floor((now - changed) / 60000);

  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

export default function DeviceCard({ device, onClick }) {
  const isOn = device.status === 'on';
  const isFan = device.type === 'fan';
  const isLight = device.type === 'light';

  
  const iconUrl = isFan ? fanIcon : lightIcon;

  
  const justChanged = device.lastChanged && 
    (new Date() - new Date(device.lastChanged)) < 2000;

  
  const iconStyle = isLight && isOn
    ? {
        filter:
          'invert(82%) sepia(46%) saturate(1200%) hue-rotate(1deg) brightness(103%) contrast(103%) drop-shadow(0 0 6px rgba(250,204,21,0.75))',
      }
    : undefined;

  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left rounded-lg border-2 p-4 
        transition-all duration-300 cursor-pointer
        hover:shadow-md hover:-translate-y-0.5
        active:scale-95
        ${isOn
          ? 'bg-blue-50 border-blue-300 hover:border-blue-400'
          : 'bg-gray-50 border-gray-200 hover:border-gray-300'
        }
        ${justChanged ? 'ring-2 ring-yellow-400 animate-fade-in-scale' : ''}
      `}
    >
      <div className="flex items-start justify-between">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-3 flex-1">
          <img
            src={iconUrl}
            alt={device.type}
            className={`
              w-8 h-8 flex-shrink-0
              transition-all duration-300
              ${isOn 
                ? 'scale-110 opacity-100' 
                : 'scale-100 opacity-50'
              }
              ${isFan && isOn ? 'animate-spin' : ''}
            `}
            style={{
              ...iconStyle,
              ...(isFan && isOn ? { animationDuration: '0.9s' } : {}),
            }}
          />

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {device.name}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {device.type === 'fan' ? 'Fan' : 'Light'}
              {isOn && (
                <span className="ml-2 font-semibold text-blue-600">
                  {device.powerW}W
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {isOn 
                ? `On ${getTimeAgo(device.lastChanged)}` 
                : `Off ${getTimeAgo(device.lastChanged)}`
              }
            </p>
          </div>
        </div>

        {/* Right: Status Indicator */}
        <div className="flex items-center gap-2 ml-3 flex-shrink-0">
          <div
            className={`
              w-3 h-3 rounded-full transition-all duration-300
              ${isOn
                ? 'bg-green-500 shadow-lg shadow-green-500/50 animate-pulse'
                : 'bg-gray-400 shadow-none'
              }
            `}
          />
          <span className="text-xs font-bold text-gray-600 w-8 text-center">
            {isOn ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>
    </button>
  );
}