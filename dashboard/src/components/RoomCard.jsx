import fanIcon from '../assets/icons/fan.png';
import lightIcon from '../assets/icons/light.png';
import doorIcon from '../assets/icons/door.png';
import sofaIcon from '../assets/icons/sofa.png';
import deskIcon from '../assets/icons/desk.png';
import plantIcon from '../assets/icons/plant.png';


const FLOOR_TINT = {
  'Drawing Room': 'bg-amber-50',
  'Work Room 1': 'bg-slate-100',
  'Work Room 2': 'bg-stone-100',
};


const SLOTS = [
  { top: '15%', left: '18%' },  // light 1
  { top: '15%', left: '50%' },  // fan 1
  { top: '15%', left: '82%' },  // light 2
  { top: '62%', left: '50%' },  // fan 2
  { top: '86%', left: '50%' },
];

function DeviceIcon({ device, position, onClick }) {
  const isOn = device.status === 'on';
  const isFan = device.type === 'fan';
  const iconUrl = isFan ? fanIcon : lightIcon;

  const iconStyle = !isFan && isOn
    ? {
        filter:
          'invert(82%) sepia(46%) saturate(1200%) hue-rotate(1deg) brightness(103%) contrast(103%) drop-shadow(0 0 6px rgba(250,204,21,0.75))',
      }
    : undefined;

  return (
    <button
      onClick={onClick}
      title={`${device.name} — ${isOn ? 'ON' : 'OFF'}`}
      className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 group z-10"
      style={position}
    >
      <img
        src={iconUrl}
        alt={device.type}
        className={`
          w-9 h-9 transition-all duration-300
          ${isOn ? 'scale-110 opacity-100' : 'scale-100 opacity-45'}
          ${isFan && isOn ? 'animate-spin' : ''}
          group-hover:scale-125
        `}
        style={{ ...iconStyle, ...(isFan && isOn ? { animationDuration: '0.9s' } : {}) }}
      />
      <span
        className={`
          mt-1 w-2 h-2 rounded-full
          ${isOn ? 'bg-green-500 shadow shadow-green-500/50' : 'bg-gray-400'}
        `}
      />
    </button>
  );
}

// NOTE: `rotate` (e.g. '90deg') is now actually applied below —
// previously it was accepted as a prop but never used.
function Prop({ src, top, left, width, rotate, alt = '' }) {
  return (
    <img
      src={src}
      alt={alt}
      className="absolute opacity-80 pointer-events-none"
      style={{
        top,
        left,
        width,
        transform: `translate(-50%, -50%) rotate(${rotate || '0deg'})`,
      }}
    />
  );
}

const FURNITURE = {
  'Drawing Room': [
    { src: sofaIcon, top: '50%', left: '18%', width: '20%', rotate: '270deg' },
  ],
  'Work Room 1': [
    { src: deskIcon, top: '36%', left: '18%', width: '16%' },
    { src: deskIcon, top: '36%', left: '82%', width: '16%' },
    { src: deskIcon, top: '58%', left: '18%', width: '16%' },
    { src: deskIcon, top: '58%', left: '82%', width: '16%' },
  ],
  'Work Room 2': [
    { src: deskIcon, top: '36%', left: '18%', width: '16%' },
    { src: deskIcon, top: '36%', left: '82%', width: '16%' },
    { src: deskIcon, top: '58%', left: '18%', width: '16%' },
    { src: deskIcon, top: '58%', left: '82%', width: '16%' },
  ],
};


const PLANTS = {
  'Drawing Room': { top: '8%', left: '6%' },
  'Work Room 1': { top: '8%', left: '94%' },
  'Work Room 2': { top: '8%', left: '94%' },
};

export default function RoomCard({ roomName, devices, onDeviceClick }) {
  const fans = devices.filter(d => d.type === 'fan');
  const lights = devices.filter(d => d.type === 'light');
  const activeCount = devices.filter(d => d.status === 'on').length;

  const ordered = [lights[0], fans[0], lights[1], fans[1], lights[2]].filter(Boolean);

  const tint = FLOOR_TINT[roomName] || FLOOR_TINT['Work Room 1'];
  const furniture = FURNITURE[roomName] || [];
  const plant = PLANTS[roomName];

  return (
    <div className="flex-1 flex flex-col p-5">
      {/* Room Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{roomName}</h3>
        <span className="text-xs font-semibold text-gray-600 uppercase">
          Active <span className="text-gray-900">{activeCount}/{devices.length}</span>
        </span>
      </div>

      {/* Top-view floor with furniture + devices placed spatially */}
      <div className={`relative flex-1 min-h-[340px] overflow-visible ${tint}`}>
        {furniture.map((item, i) => <Prop key={i} {...item} />)}
        {plant && <Prop src={plantIcon} {...plant} width="10%" alt="plant" />}
        <Prop src={doorIcon} top="94%" left="10%" width="9%" alt="door" />

        {ordered.map((device, i) => (
          <DeviceIcon
            key={device.id}
            device={device}
            position={SLOTS[i]}
            onClick={() => onDeviceClick?.(device.id)}
          />
        ))}
      </div>
    </div>
  );
}