import React, { useState, useEffect } from 'react';

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-sm font-mono text-white/90 shadow-xl flex items-center gap-2">
      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
      <span>{formatTime(time)}</span>
    </div>
  );
};

export default Clock;
