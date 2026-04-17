// ─── Boot Sequence Screen ─────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/sounds';

const BOOT_LINES = [
  { delay: 0,    text: '> CYBERBREACH OS v2.0.1 BOOTING...',                color: 'var(--neon-green)' },
  { delay: 300,  text: '> Initializing kernel modules... [OK]',             color: 'var(--neon-green)' },
  { delay: 600,  text: '> Loading firewall subsystems... [COMPROMISED]',    color: 'var(--neon-red)' },
  { delay: 900,  text: '> Checking system integrity... [CRITICAL FAILURE]', color: 'var(--neon-red)' },
  { delay: 1200, text: '> Hostile entity detected in network core',         color: 'var(--neon-red)' },
  { delay: 1500, text: '> Attacker IP: 192.168.0.∞ — UNTRACEABLE',        color: 'var(--neon-red)' },
  { delay: 1800, text: '> Countermeasure protocol: INITIATED',              color: '#ff9900' },
  { delay: 2100, text: `> Agent authenticated: ACCESS GRANTED`,             color: 'var(--neon-cyan)' },
  { delay: 2400, text: '> Loading challenge modules... [10/10 LOADED]',    color: 'var(--neon-green)' },
  { delay: 2700, text: '> Timer armed: 35:00 MINUTES',                     color: '#ff9900' },
  { delay: 3000, text: '> SYSTEM STATUS: AWAITING AGENT INTERVENTION',     color: 'var(--neon-green)' },
  { delay: 3300, text: '> ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',  color: 'var(--text-dim)' },
  { delay: 3600, text: '> LAUNCHING SECURE TERMINAL...',                    color: 'var(--neon-cyan)', bold: true },
];

export default function BootScreen() {
  const { state, startGame } = useGame();
  const [visibleLines, setVisibleLines] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    sounds.glitch();
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, line]);
        setProgress(Math.round(((i + 1) / BOOT_LINES.length) * 100));
        sounds.keyPress();
      }, line.delay);
    });

    // Auto-launch game
    const launchTimeout = setTimeout(() => {
      sounds.accessGranted();
      startGame();
    }, 4200);

    return () => clearTimeout(launchTimeout);
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      <MatrixRain />
      <div className="scanlines" />

      <div className="relative z-10 w-full max-w-2xl mx-4">
        {/* Agent badge */}
        <div className="mb-6 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm tracking-widest"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}
          >
            ◈ AGENT: <span style={{ color: 'var(--neon-green)' }}>{state.teamName.toUpperCase()}</span>
          </motion.p>
        </div>

        {/* Terminal window */}
        <div
          className="cyber-panel rounded overflow-hidden"
          style={{ minHeight: '380px' }}
        >
          {/* Title bar */}
          <div
            className="flex items-center gap-2 px-4 py-2"
            style={{ background: 'rgba(0,255,65,0.05)', borderBottom: '1px solid var(--border-green)' }}
          >
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--neon-red)' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#ff9900' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: 'var(--neon-green)' }} />
            <span
              className="ml-4 text-xs tracking-widest opacity-50"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
            >
              CYBERBREACH://boot_sequence.sh
            </span>
          </div>

          {/* Console */}
          <div className="p-6 space-y-2" style={{ minHeight: '300px' }}>
            {visibleLines.map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm boot-line"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: line.color,
                  fontWeight: line.bold ? 700 : 400,
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                {line.text}
              </motion.p>
            ))}
            {visibleLines.length < BOOT_LINES.length && (
              <span className="cursor-blink text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }} />
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs mb-1 opacity-60" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
            <span>INITIALIZING</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 rounded" style={{ background: 'rgba(0,255,65,0.1)' }}>
            <motion.div
              className="progress-bar-fill rounded"
              style={{ height: '100%' }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: 'easeOut', duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
