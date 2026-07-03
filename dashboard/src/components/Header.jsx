import { useState, useEffect } from 'react';

export default function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="flex items-center justify-between">
          {/* Left: Title */}
          <div className="animate-fade-in-scale">
            <h1 className="text-3xl font-bold text-gray-900">
              Office Energy Monitor
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Real-time monitoring of lights and fans
            </p>
          </div>

          {/* Right: Status + Time */}
          <div className="flex items-center gap-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-700">
                Live
              </span>
            </div>

            {/* Current Time */}
            <div className="text-right font-mono">
              <p className="text-xs text-gray-500 mb-1">Current Time</p>
              <p className="text-lg font-bold text-gray-900 transition-all duration-300">
                {timeString}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}