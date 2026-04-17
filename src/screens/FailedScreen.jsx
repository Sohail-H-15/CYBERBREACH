// ─── System Failure Screen ────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/sounds';
import MatrixRain from '../components/MatrixRain';

export default function FailedScreen() {
  const { state } = useGame();
  const { score, teamName, answeredQuestions, tabSwitchCount } = state;
  const played = useRef(false);

  const correctCount = answeredQuestions.filter((q) => q.correct).length;

  useEffect(() => {
    if (!played.current) {
      played.current = true;
      sounds.systemFailure();
    }
  }, []);

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#080000' }}
    >
      <MatrixRain />
      <div className="scanlines" />

      {/* Red background pulse */}
      <motion.div
        animate={{ opacity: [0.03, 0.08, 0.03] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(255,0,51,0.15), transparent 70%)' }}
      />

      <div className="relative z-10 text-center max-w-xl mx-4 w-full">
        {/* X icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="text-8xl mb-6"
          style={{ color: 'var(--neon-red)', textShadow: '0 0 60px var(--neon-red)' }}
        >
          ✗
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h1
            className="glitch text-5xl md:text-6xl font-black mb-2 system-failure"
            data-text="SYSTEM FAILURE"
            style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-red)' }}
          >
            SYSTEM FAILURE
          </h1>
          <p
            className="text-sm tracking-[0.25em] mb-8 opacity-70"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}
          >
            // TIME EXPIRED — SYSTEM COMPROMISED
          </p>
        </motion.div>

        {/* Stats box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="cyber-panel-red rounded p-6 text-left mb-6"
        >
          <p
            className="text-sm mb-4 opacity-60"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}
          >
            &gt; MISSION STATUS: <span style={{ color: 'var(--neon-red)' }}>FAILED</span>
          </p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {[
              { label: 'AGENT', val: teamName.toUpperCase() },
              { label: 'FINAL SCORE', val: `${score} PTS` },
              { label: 'CHALLENGES SOLVED', val: `${correctCount} / 10` },
              { label: 'VIOLATIONS', val: tabSwitchCount },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xs opacity-40 tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}>{label}</p>
                <p className="font-bold" style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-red)' }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Progress */}
          <div className="mt-2">
            <p className="text-xs opacity-40 mb-1" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}>COMPLETION</p>
            <div className="h-2 rounded" style={{ background: 'rgba(255,0,51,0.1)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(correctCount / 10) * 100}%` }}
                transition={{ delay: 1, duration: 1.2, ease: 'easeOut' }}
                className="h-full rounded"
                style={{ background: 'var(--neon-red)', boxShadow: '0 0 8px var(--neon-red)' }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex gap-4 justify-center"
        >
          <motion.button
            id="retry-btn"
            onClick={() => window.location.reload()}
            className="cyber-btn-red cyber-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            [ RETRY MISSION ]
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
