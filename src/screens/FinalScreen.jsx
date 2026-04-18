// ─── Final Phase Screen — Master Key Entry ────────────────────────────────────
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import LetterBar from '../components/LetterBar';
import Timer from '../components/Timer';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/sounds';
import TypingText from '../components/TypingText';

export default function FinalScreen() {
  const { state, submitMasterKey } = useGame();
  const { revealedLetters, score, teamName } = state;

  const [key, setKey]         = useState('');
  const [status, setStatus]   = useState(null);  // 'wrong' | null
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);
  const [attempts, setAttempts] = useState(0);

  const collectedLetters = revealedLetters.filter(Boolean).join('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim() || loading) return;

    setLoading(true);
    sounds.keyPress();

    const correct = await submitMasterKey(key);

    if (correct) {
      sounds.systemSecured();
      // Phase change handled in context → triggers SecuredScreen via App
    } else {
      setStatus('wrong');
      setAttempts((a) => a + 1);
      sounds.accessDenied();
      setShake(true);
      setTimeout(() => { setShake(false); setStatus(null); }, 600);
    }
    setLoading(false);
  };

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'var(--bg-dark)' }}
    >
      <MatrixRain />
      <div className="scanlines" />

      {/* Header strip */}
      <div
        className="relative z-10 py-3 px-6 flex items-center justify-between"
        style={{ borderBottom: '1px solid var(--border-red)', background: 'rgba(255,0,51,0.04)' }}
      >
        <span className="text-xl font-black" style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}>
          CYBER<span style={{ color: 'var(--neon-red)' }}>BREACH</span>
        </span>
        <Timer />
        <div className="text-right">
          <p className="text-xs opacity-50" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>AGENT</p>
          <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-cyan)' }}>{teamName.toUpperCase()}</p>
          <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}>{score} PTS</p>
        </div>
      </div>

      {/* Center content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 max-w-7xl mx-auto w-full">

        {/* Glitch title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          className="text-center mb-8"
        >
          <div
            className="glitch text-4xl md:text-5xl font-black mb-2"
            data-text="FINAL PHASE"
            style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-red)' }}
          >
            FINAL PHASE
          </div>
          <p className="text-sm tracking-[0.3em] opacity-60" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
            // ALL CHALLENGES COMPLETE — MASTER KEY REQUIRED
          </p>
        </motion.div>

        {/* Collected letters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full mb-6"
        >
          <LetterBar />
        </motion.div>

        {/* Terminal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="cyber-panel rounded p-6 w-full"
        >
          {/* Status message */}
          <div
            className="mb-6 p-4 rounded text-sm"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,255,65,0.1)', fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
          >
            <TypingText
              text={`> All ${revealedLetters.filter(Boolean).length} key fragments collected\n> Assemble the MASTER KEY from the fragments above\n> Enter it below to SECURE THE SYSTEM`}
              speed={20}
              className="whitespace-pre-line"
            />
          </div>

          {/* Hint if needed */}
          {collectedLetters.length > 0 && (
            <div className="mb-4 text-xs opacity-50 text-center" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-cyan)' }}>
              Collected: [ {collectedLetters.split('').join(' ')} ] — arrange them in challenge order
            </div>
          )}

          {/* Master key form */}
          <form onSubmit={handleSubmit} id="master-key-form">
            <label
              htmlFor="master-key-input"
              className="block text-xs tracking-widest mb-2 opacity-60"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}
            >
              ◈ ENTER MASTER KEY
            </label>
            <motion.div animate={shake ? { x: [-8, 8, -8, 8, -4, 4, 0] } : {}} transition={{ duration: 0.5 }}>
              <input
                id="master-key-input"
                type="text"
                value={key}
                onChange={(e) => { setKey(e.target.value.toUpperCase()); sounds.keyPress(); }}
                placeholder="XXXXXXXXXX"
                className="cyber-input rounded text-center text-2xl tracking-[0.5em] font-bold"
                style={{
                  fontFamily: 'var(--font-orb)',
                  borderColor: status === 'wrong' ? 'var(--neon-red)' : 'var(--border-green)',
                  color: status === 'wrong' ? 'var(--neon-red)' : 'var(--neon-green)',
                }}
                autoComplete="off"
                spellCheck="false"
                maxLength={20}
                aria-label="Master key input"
              />
            </motion.div>

            {/* Feedback */}
            <AnimatePresence mode="wait">
              {status === 'wrong' && (
                <motion.div
                  key="invalid"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3 text-center"
                >
                  <p className="access-denied text-2xl">✗ INVALID KEY</p>
                  <p className="text-xs mt-1 opacity-60" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}>
                    Attempt #{attempts} failed. Check fragment order.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              id="master-key-submit-btn"
              type="submit"
              disabled={!key.trim() || loading}
              className="cyber-btn-red cyber-btn w-full mt-6 text-base"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              {loading ? '[ VERIFYING... ]' : '[ TRANSMIT MASTER KEY ]'}
            </motion.button>
          </form>

          {/* Score summary */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center border-t pt-4" style={{ borderColor: 'var(--border-green)' }}>
            {[
              { label: 'SCORE', val: score },
              { label: 'SOLVED', val: `${state.answeredQuestions.filter(q => q.correct).length}/10` },
              { label: 'VIOLATIONS', val: state.tabSwitchCount },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="text-xs opacity-40 tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>{label}</p>
                <p className="font-bold text-xl" style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}>{val}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
