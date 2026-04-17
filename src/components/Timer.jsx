// ─── Countdown Timer ──────────────────────────────────────────────────────────
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/sounds';
import { useEffect, useRef } from 'react';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function Timer() {
  const { state } = useGame();
  const { timeRemaining } = state;
  const prevRef = useRef(timeRemaining);

  const hours = Math.floor(timeRemaining / 3600);
  const minutes = Math.floor((timeRemaining % 3600) / 60);
  const seconds = timeRemaining % 60;

  const isCritical = timeRemaining <= 300; // last 5 min
  const isWarning = timeRemaining <= 600;  // last 10 min

  // Play warning sound every minute in last 5 min
  useEffect(() => {
    if (isCritical && prevRef.current !== timeRemaining && timeRemaining % 60 === 0 && timeRemaining > 0) {
      sounds.timerWarning();
    }
    prevRef.current = timeRemaining;
  }, [timeRemaining, isCritical]);

  const color = isCritical ? 'var(--neon-red)' : isWarning ? '#ff9900' : 'var(--neon-green)';

  return (
    <div className="text-center">
      <p
        className="text-xs tracking-widest mb-1 opacity-60"
        style={{ fontFamily: 'var(--font-mono)', color }}
      >
        ◈ TIME REMAINING
      </p>
      <div
        className={`font-bold tabular-nums ${isCritical ? 'timer-critical' : ''}`}
        style={{
          fontFamily: 'var(--font-orb)',
          fontSize: '1.8rem',
          color,
          letterSpacing: '0.1em',
        }}
      >
        {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
      </div>
      {isCritical && (
        <p className="text-xs mt-1 animate-pulse" style={{ color: 'var(--neon-red)', fontFamily: 'var(--font-mono)' }}>
          ⚠ CRITICAL — ACT NOW
        </p>
      )}
    </div>
  );
}
