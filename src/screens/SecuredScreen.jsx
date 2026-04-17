// ─── System Secured Screen ────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/sounds';
import TypingText from '../components/TypingText';

function pad(n) { return String(n).padStart(2, '0'); }

export default function SecuredScreen() {
  const { state } = useGame();
  const { score, teamName, answeredQuestions, tabSwitchCount } = state;
  const played = useRef(false);

  const elapsed = 35 * 60 - state.timeRemaining;
  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;
  const correctCount = answeredQuestions.filter((q) => q.correct).length;

  useEffect(() => {
    if (!played.current) {
      played.current = true;
      sounds.systemSecured();
    }
  }, []);

  // Particle burst (CSS keyframe based)
  const particles = Array.from({ length: 24 }, (_, i) => ({
    angle: (i / 24) * 360,
    delay: Math.random() * 0.5,
    distance: 80 + Math.random() * 120,
  }));

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#000a05' }}
    >
      {/* Animated green radial pulse */}
      <motion.div
        initial={{ scale: 0, opacity: 0.8 }}
        animate={{ scale: 6, opacity: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        className="absolute rounded-full"
        style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,255,65,0.3), transparent 70%)' }}
      />
      <motion.div
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 8, opacity: 0 }}
        transition={{ duration: 2.5, delay: 0.3, ease: 'easeOut' }}
        className="absolute rounded-full"
        style={{ width: 200, height: 200, background: 'radial-gradient(circle, rgba(0,255,65,0.15), transparent 70%)' }}
      />

      {/* Scanlines */}
      <div className="scanlines" />

      <div className="relative z-10 text-center max-w-xl mx-4 w-full">
        {/* Giant check */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
          className="text-8xl mb-6"
          style={{ color: 'var(--neon-green)', textShadow: '0 0 80px var(--neon-green)' }}
        >
          ✓
        </motion.div>

        {/* Main title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h1
            className="glitch text-5xl md:text-6xl font-black mb-2"
            data-text="SYSTEM SECURED"
            style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}
          >
            SYSTEM SECURED
          </h1>
          <p
            className="text-sm tracking-[0.3em] mb-8 opacity-70"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
          >
            // THREAT NEUTRALIZED — WELL DONE, AGENT
          </p>
        </motion.div>

        {/* Terminal result box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="cyber-panel rounded p-6 text-left mb-6"
        >
          <p
            className="text-sm mb-4 opacity-60"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
          >
            <TypingText
              text={`> MISSION DEBRIEF — ${new Date().toUTCString()}`}
              speed={20}
              startDelay={1200}
            />
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: 'AGENT', val: teamName.toUpperCase() },
              { label: 'FINAL SCORE', val: `${score} PTS` },
              { label: 'CHALLENGES SOLVED', val: `${correctCount} / 10` },
              { label: 'TIME TAKEN', val: `${pad(mm)}:${pad(ss)}` },
              { label: 'VIOLATIONS', val: tabSwitchCount },
              { label: 'STATUS', val: 'SECURED ✓' },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xs opacity-40 tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>{label}</p>
                <p
                  className="font-bold"
                  style={{
                    fontFamily: 'var(--font-orb)',
                    color: label === 'STATUS' ? 'var(--neon-green)' : label === 'VIOLATIONS' && tabSwitchCount > 0 ? 'var(--neon-red)' : 'var(--neon-cyan)',
                  }}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Score bar */}
          <div className="mt-4">
            <p className="text-xs opacity-40 mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>PERFORMANCE</p>
            <div className="h-2 rounded" style={{ background: 'rgba(0,255,65,0.1)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (correctCount / 10) * 100)}%` }}
                transition={{ delay: 1.5, duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded progress-bar-fill"
              />
            </div>
          </div>
        </motion.div>

        {/* Reload button */}
        <motion.button
          id="play-again-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          onClick={() => window.location.reload()}
          className="cyber-btn"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{ fontSize: '0.8rem' }}
        >
          [ RESTART PROTOCOL ]
        </motion.button>
      </div>
    </div>
  );
}
