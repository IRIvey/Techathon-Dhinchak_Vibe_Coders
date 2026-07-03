


const MAX_ROOM_POWER = 2 * 60 + 3 * 15; 
const MAX_TOTAL_POWER = MAX_ROOM_POWER * 3; 


function getLevel(watts, max) {
  const pct = (watts / max) * 100;
  if (pct >= 80) return 'high';
  if (pct >= 50) return 'medium';
  return 'low';
}

const LEVEL_TEXT_COLOR = {
  low: 'text-green-600',
  medium: 'text-yellow-600',
  high: 'text-red-600',
};

const LEVEL_BG_COLOR = {
  low: 'bg-green-50 border-green-100',
  medium: 'bg-yellow-50 border-yellow-100',
  high: 'bg-red-50 border-red-200',
};

const LEVEL_CARD_COLOR = {
  low: 'bg-blue-50 border-blue-200',
  medium: 'bg-yellow-50 border-yellow-300',
  high: 'bg-red-50 border-red-400',
};

const LEVEL_BAR_COLOR = {
  low: 'bg-gradient-to-r from-blue-400 to-blue-600',
  medium: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
  high: 'bg-gradient-to-r from-red-400 to-red-600 animate-pulse',
};

const LEVEL_DOT_COLOR = {
  low: 'bg-green-500 shadow-lg shadow-green-500/50',
  medium: 'bg-yellow-500 shadow-lg shadow-yellow-500/50',
  high: 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse',
};

const LEVEL_LABEL = {
  low: 'Low Usage',
  medium: 'Normal Usage',
  high: 'High Usage — Almost Full',
};

export default function PowerMeter({ totalPower, powerPerRoom }) {
  const totalLevel = totalPower === 0 ? 'low' : getLevel(totalPower, MAX_TOTAL_POWER);

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Total Power Card */}
        <div
          className={`
            rounded-xl border-2 p-8 mb-8
            transition-all duration-500
            ${LEVEL_BG_COLOR[totalLevel]}
            animate-fade-in-scale
          `}
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Power Draw
              </p>
              <div className="mt-4 flex items-baseline gap-2">
                <span
                  className={`
                    text-6xl font-bold transition-all duration-500
                    ${LEVEL_TEXT_COLOR[totalLevel]}
                  `}
                >
                  {totalPower}
                </span>
                <span className="text-2xl font-semibold text-gray-500">
                  W
                </span>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-2">
                {totalPower === 0 ? 'All Off' : LEVEL_LABEL[totalLevel]}
              </p>
              <div
                className={`
                  inline-block w-4 h-4 rounded-full transition-all duration-300
                  ${totalPower === 0 ? 'bg-gray-400' : LEVEL_DOT_COLOR[totalLevel]}
                `}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Real-time monitoring • Last update: now
          </p>
        </div>

        {/* Per-Room Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
            Power by Room
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(powerPerRoom).map(([room, power], index) => {
              const level = power === 0 ? 'low' : getLevel(power, MAX_ROOM_POWER);
              const roomColor = power === 0 ? 'bg-gray-50 border-gray-200' : LEVEL_CARD_COLOR[level];
              const textColor = power === 0 ? 'text-gray-600' : LEVEL_TEXT_COLOR[level];
              const barColor = power === 0 ? 'w-0 bg-gray-300' : LEVEL_BAR_COLOR[level];
              const pct = Math.min((power / MAX_ROOM_POWER) * 100, 100);

              return (
                <div
                  key={room}
                  className={`
                    rounded-lg border-2 p-5
                    ${roomColor}
                    hover:shadow-md transition-all duration-300
                    hover:-translate-y-1
                    animate-fade-in-scale
                  `}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      {room}
                    </p>
                    {level === 'high' && power > 0 && (
                      <span className="text-[10px] font-bold text-red-600 uppercase tracking-wide animate-pulse">
                        Almost Full
                      </span>
                    )}
                  </div>
                  <p className={`text-3xl font-bold mt-3 transition-all duration-500 ${textColor}`}>
                    {power}
                    <span className="text-sm font-normal text-gray-500 ml-2">W</span>
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
