export default function AlertsPanel({ alerts }) {
  const highSeverity = alerts.filter(a => a.severity === 'high');
  const mediumSeverity = alerts.filter(a => a.severity === 'medium');

  if (alerts.length === 0) {
    return (
      <section className="px-6 py-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Active Alerts
          </h2>
          <div className="bg-white rounded-xl border-2 border-green-200 p-8 animate-fade-in-scale">
            <div className="text-center">
              <div className="text-5xl mb-4">✓</div>
              <p className="text-gray-700 font-semibold text-lg">
                No alerts. Everything looks good.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                All devices are operating normally.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Active Alerts
          <span className="ml-3 text-lg font-semibold text-red-600 animate-pulse">
            ({alerts.length})
          </span>
        </h2>

        <div className="space-y-6">
          {/* Critical Alerts */}
          {highSeverity.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-red-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                Critical Issues
              </h3>
              <div className="space-y-3">
                {highSeverity.map((alert, index) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    delay={index * 100}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Warning Alerts */}
          {mediumSeverity.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse" />
                Warnings
              </h3>
              <div className="space-y-3">
                {mediumSeverity.map((alert, index) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    delay={index * 100}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AlertCard({ alert, delay = 0 }) {
  const isHighSeverity = alert.severity === 'high';

  return (
    <div
      className={`
        rounded-lg border-l-4 p-4
        transition-all duration-300
        hover:shadow-md hover:-translate-x-1
        animate-slide-in-up
        ${isHighSeverity
          ? 'bg-red-50 border-l-red-500 hover:bg-red-100'
          : 'bg-yellow-50 border-l-yellow-500 hover:bg-yellow-100'
        }
      `}
      style={{
        animationDelay: `${delay}ms`
      }}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900">
            {alert.message}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {new Date(alert.timestamp).toLocaleTimeString()}
          </p>
        </div>
        <span
          className={`
            text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap
            flex-shrink-0
            ${isHighSeverity
              ? 'bg-red-200 text-red-800'
              : 'bg-yellow-200 text-yellow-800'
            }
          `}
        >
          {isHighSeverity ? 'CRITICAL' : 'WARNING'}
        </span>
      </div>
    </div>
  );
}