// Top-view office floor plan.
// Pure SVG (no image assets) so it scales cleanly and every fan/light
// icon can be recolored/animated based on live device state.

const ROOM_LAYOUT = [
  { room: 'Drawing Room', x0: 40, x1: 413.33, fanIds: ['dr-fan-1', 'dr-fan-2'], lightIds: ['dr-light-1', 'dr-light-2', 'dr-light-3'] },
  { room: 'Work Room 1', x0: 413.33, x1: 786.67, fanIds: ['wr1-fan-1', 'wr1-fan-2'], lightIds: ['wr1-light-1', 'wr1-light-2', 'wr1-light-3'] },
  { room: 'Work Room 2', x0: 786.67, x1: 1160, fanIds: ['wr2-fan-1', 'wr2-fan-2'], lightIds: ['wr2-light-1', 'wr2-light-2', 'wr2-light-3'] },
];

const TOP_Y = 40;
const ROOM_BOTTOM_Y = 480;
const CORRIDOR_BOTTOM_Y = 560;

function FanIcon({ id, cx, cy, isOn, onClick }) {
  return (
    <g
      onClick={() => onClick?.(id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <circle cx={cx} cy={cy} r={22} fill={isOn ? '#eff6ff' : '#f9fafb'} stroke={isOn ? '#60a5fa' : '#d1d5db'} strokeWidth="2" />
      <g
        style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: isOn ? 'spin 0.9s linear infinite' : 'none',
        }}
      >
        {[0, 90, 180, 270].map((angle) => (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy - 10}
            rx={5}
            ry={11}
            fill={isOn ? '#3b82f6' : '#9ca3af'}
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        ))}
        <circle cx={cx} cy={cy} r={4} fill={isOn ? '#1d4ed8' : '#6b7280'} />
      </g>
    </g>
  );
}

function LightIcon({ id, cx, cy, isOn, onClick }) {
  return (
    <g
      onClick={() => onClick?.(id)}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      {isOn && <circle cx={cx} cy={cy} r={26} fill="#fde047" opacity="0.25" />}
      <circle
        cx={cx}
        cy={cy}
        r={13}
        fill={isOn ? '#facc15' : '#e5e7eb'}
        stroke={isOn ? '#eab308' : '#9ca3af'}
        strokeWidth="2"
        style={{
          filter: isOn ? 'drop-shadow(0 0 6px rgba(250,204,21,0.85))' : 'none',
          transition: 'all 0.3s ease',
        }}
      />
    </g>
  );
}

function DrawingRoomFurniture({ x0, x1 }) {
  const cx = (x0 + x1) / 2;
  return (
    <g opacity="0.9">
      {/* Sofa */}
      <rect x={x0 + 30} y={200} width={70} height={160} rx={10} fill="#d6c3a8" stroke="#b89b74" />
      {/* Coffee table */}
      <rect x={cx - 35} y={250} width={70} height={45} rx={6} fill="#c9a876" stroke="#a9884f" />
      {/* Armchair */}
      <rect x={x0 + 30} y={370} width={55} height={55} rx={10} fill="#d6c3a8" stroke="#b89b74" />
      {/* Plants */}
      <circle cx={x0 + 25} cy={60} r={12} fill="#86a873" />
      <circle cx={x0 + 25} cy={455} r={12} fill="#86a873" />
    </g>
  );
}

function DeskCluster({ x, y }) {
  return (
    <g opacity="0.9">
      <rect x={x - 45} y={y - 22} width={90} height={44} rx={4} fill="#e7d9c3" stroke="#c9b18d" />
      <rect x={x - 15} y={y - 14} width={30} height={20} rx={2} fill="#94a3b8" />
      <circle cx={x} cy={y + 40} r={16} fill="#9ca3af" />
    </g>
  );
}

function WorkRoomFurniture({ x0, x1 }) {
  const cx = (x0 + x1) / 2;
  return (
    <g>
      <DeskCluster x={cx - 60} y={250} />
      <DeskCluster x={cx + 60} y={250} />
      <circle cx={x1 - 20} cy={60} r={10} fill="#86a873" />
    </g>
  );
}

export default function OfficeFloorPlan({ deviceState, onDeviceClick }) {
  const statusOf = (id) => deviceState?.[id]?.status === 'on';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
      <svg viewBox="0 0 1200 600" className="w-full h-auto">
        {/* Outer building shell */}
        <rect x={40} y={TOP_Y} width={1120} height={CORRIDOR_BOTTOM_Y - TOP_Y} rx={6} fill="#f8f7f4" stroke="#374151" strokeWidth="3" />

        {/* Corridor divider */}
        <line x1={40} y1={ROOM_BOTTOM_Y} x2={1160} y2={ROOM_BOTTOM_Y} stroke="#9ca3af" strokeWidth="2" strokeDasharray="6 6" />

        {/* Entry door (bottom center) */}
        <rect x={565} y={CORRIDOR_BOTTOM_Y - 6} width={70} height={12} fill="#fff" />
        <text x={600} y={CORRIDOR_BOTTOM_Y + 26} textAnchor="middle" fontSize="13" fill="#6b7280" fontWeight="600">
          ENTRY
        </text>
        <path d={`M 565 ${CORRIDOR_BOTTOM_Y} L 565 ${CORRIDOR_BOTTOM_Y - 15}`} stroke="#6b7280" strokeWidth="2" />

        {/* Room dividers + per-room content */}
        {ROOM_LAYOUT.map(({ room, x0, x1, fanIds, lightIds }, idx) => {
          const cx = (x0 + x1) / 2;
          return (
            <g key={room}>
              {idx > 0 && (
                <line x1={x0} y1={TOP_Y} x2={x0} y2={ROOM_BOTTOM_Y} stroke="#374151" strokeWidth="2.5" />
              )}

              {/* Window on top wall */}
              <rect x={cx - 70} y={TOP_Y - 4} width={140} height={8} fill="#93c5fd" />

              {/* Furniture */}
              {room === 'Drawing Room' ? (
                <DrawingRoomFurniture x0={x0} x1={x1} />
              ) : (
                <WorkRoomFurniture x0={x0} x1={x1} />
              )}

              {/* Room label */}
              <text x={cx} y={TOP_Y + 24} textAnchor="middle" fontSize="15" fontWeight="700" fill="#1f2937">
                {room}
              </text>

              {/* Lights: left, right (top row) + one lower */}
              <LightIcon id={lightIds[0]} cx={x0 + 60} cy={110} isOn={statusOf(lightIds[0])} onClick={onDeviceClick} />
              <LightIcon id={lightIds[1]} cx={x1 - 60} cy={110} isOn={statusOf(lightIds[1])} onClick={onDeviceClick} />
              <LightIcon id={lightIds[2]} cx={cx} cy={445} isOn={statusOf(lightIds[2])} onClick={onDeviceClick} />

              {/* Fans: top-center + lower-center */}
              <FanIcon id={fanIds[0]} cx={cx} cy={110} isOn={statusOf(fanIds[0])} onClick={onDeviceClick} />
              <FanIcon id={fanIds[1]} cx={cx} cy={330} isOn={statusOf(fanIds[1])} onClick={onDeviceClick} />

              {/* Internal door to corridor */}
              <rect x={cx - 30} y={ROOM_BOTTOM_Y - 4} width={60} height={8} fill="#fff" />
            </g>
          );
        })}

        {/* Water cooler, corridor */}
        <circle cx={1120} cy={520} r={14} fill="#bfdbfe" stroke="#60a5fa" />
      </svg>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Click any fan or light icon to toggle it
      </p>
    </div>
  );
}
