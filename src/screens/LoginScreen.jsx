// ─── Login Screen ─────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import MatrixRain from '../components/MatrixRain';
import TypingText from '../components/TypingText';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/sounds';

export default function LoginScreen() {
  const { login } = useGame();
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setError('TEAM IDENTIFIER REQUIRED');
      sounds.accessDenied();
      return;
    }
    setLoading(true);
    sounds.accessGranted();

    // Request fullscreen
    try {
      await document.documentElement.requestFullscreen();
    } catch (_) {}

    await login(teamName.trim());
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: 'var(--bg-dark)' }}>
      <MatrixRain />
      <div className="scanlines" />

      {/* Top alert bar */}
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="fixed top-0 inset-x-0 z-20 py-2 px-4 text-center text-xs tracking-widest warning-banner"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)' }}
      >
        ⚠ CRITICAL ALERT — SYSTEM BREACH DETECTED — UNAUTHORIZED ACCESS IN PROGRESS ⚠
      </motion.div>

      {/* Center panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h1
              className="glitch text-5xl font-black mb-2 leading-none"
              data-text="CYBERBREACH"
              style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}
            >
              CYBERBREACH
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-sm tracking-[0.3em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}
          >
            // HACKATHON SECURITY CHALLENGE v2.0
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="h-px mt-4"
            style={{ background: 'linear-gradient(90deg, transparent, var(--neon-green), transparent)' }}
          />
        </div>

        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="cyber-panel rounded p-8"
        >
          {/* Status */}
          <div className="flex items-center justify-between mb-6">
            <span className="status-badge" style={{ color: 'var(--neon-red)', borderColor: 'var(--neon-red)' }}>
              SYSTEM COMPROMISED
            </span>
            <span className="status-badge" style={{ color: 'var(--neon-green)', borderColor: 'var(--neon-green)' }}>
              AWAITING AGENT
            </span>
          </div>

          {/* Terminal prompt */}
          <div
            className="mb-6 p-4 rounded text-sm leading-relaxed"
            style={{
              background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(0,255,65,0.1)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--neon-green)',
            }}
          >
            <TypingText
              text={`> INTRUSION DETECTED AT 04:17:32 UTC\n> ALL SYSTEMS COMPROMISED\n> INITIATING COUNTERMEASURE PROTOCOL...\n> AGENT AUTHENTICATION REQUIRED`}
              speed={25}
              className="whitespace-pre-line"
            />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} id="login-form">
            <label
              htmlFor="team-name-input"
              className="block text-xs tracking-widest mb-2 opacity-70"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
            >
              ◈ ENTER TEAM IDENTIFIER
            </label>
            <input
              id="team-name-input"
              ref={inputRef}
              type="text"
              value={teamName}
              onChange={(e) => {
                setTeamName(e.target.value);
                setError('');
                sounds.keyPress();
              }}
              placeholder="TEAM_ALPHA_01"
              className="cyber-input rounded mb-2"
              autoComplete="off"
              spellCheck="false"
              maxLength={32}
              aria-label="Team identifier input"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-xs mb-4 tracking-widest"
                style={{ color: 'var(--neon-red)', fontFamily: 'var(--font-mono)' }}
              >
                ✗ {error}
              </motion.p>
            )}

            <div className="mt-6 flex gap-4">
              <motion.button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="cyber-btn flex-1"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <span className="animate-pulse">AUTHENTICATING...</span>
                ) : (
                  '[ INITIATE PROTOCOL ]'
                )}
              </motion.button>
            </div>
          </form>

          {/* Bottom info */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'CHALLENGES', val: '10' },
              { label: 'TIME LIMIT', val: '35 MIN' },
              { label: 'MAX SCORE', val: '∞' },
            ].map(({ label, val }) => (
              <div key={label}>
                <p className="opacity-40 text-xs tracking-wider" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>{label}</p>
                <p
                  className="font-bold text-lg"
                  style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 1.5 }}
          className="text-center text-xs mt-4 relative"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
        >
          ▸ All activity is monitored and recorded ◂
          
          <button 
            type="button"
            onClick={() => window.location.href = '/admin'}
            className="absolute right-0 top-0 opacity-20 hover:opacity-100 transition-opacity"
            title="Access Admin Panel"
          >
            [A]
          </button>
        </motion.p>
      </motion.div>
    </div>
  );
}
