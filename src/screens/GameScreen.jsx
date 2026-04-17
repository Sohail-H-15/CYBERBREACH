// ─── Main Game Screen ─────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import Timer from '../components/Timer';
import LetterBar from '../components/LetterBar';
import QuestionCard from '../components/QuestionCard';
import TabWarning from '../components/TabWarning';
import { useGame } from '../context/GameContext';

export default function GameScreen() {
  const { state, submitAnswer, nextQuestion } = useGame();

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      <MatrixRain />
      <div className="scanlines" />
      <TabWarning />

      {/* ── Top HUD ── */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 cyber-panel"
        style={{ borderBottom: '1px solid var(--border-green)', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0 }}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          {/* Left: branding */}
          <div className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: 'var(--neon-red)', boxShadow: '0 0 8px var(--neon-red)' }}
            />
            <span
              className="text-xl font-black tracking-wider"
              style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}
            >
              CYBER<span style={{ color: 'var(--neon-red)' }}>BREACH</span>
            </span>
            <span className="status-badge hidden sm:inline" style={{ color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}>
              SYSTEM BREACH
            </span>
          </div>

          {/* Center: timer */}
          <Timer />

          {/* Right: team + score */}
          <div className="text-right">
            <p className="text-xs opacity-50 tracking-widest" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
              AGENT
            </p>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-cyan)' }}
            >
              {state.teamName.toUpperCase()}
            </p>
            <p
              className="text-sm font-bold"
              style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}
            >
              {state.score} <span className="text-xs opacity-50">PTS</span>
            </p>
          </div>
        </div>
      </motion.header>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 w-full mx-auto px-4 py-8 flex flex-col justify-center items-center gap-6">

        {/* Letter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-7xl mx-auto"
        >
          <LetterBar />
        </motion.div>

        {/* Question card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="flex-1 w-full max-w-7xl mx-auto flex flex-col justify-center"
        >
          <QuestionCard
            onAnswerSubmit={submitAnswer}
            onNext={nextQuestion}
          />
        </motion.div>
      </main>

      {/* ── Side scanner line ── */}
      <motion.div
        animate={{ top: ['0%', '100%', '0%'] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        className="fixed left-0 right-0 h-px pointer-events-none z-20"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.4), transparent)' }}
      />
    </div>
  );
}
