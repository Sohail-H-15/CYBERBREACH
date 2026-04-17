// ─── Decrypting Loader ────────────────────────────────────────────────────────
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { sounds } from '../utils/sounds';

const CHARS = '!@#$%^&*0123456789ABCDEFGH><|/\\?';

function scramble(text) {
  return text
    .split('')
    .map((c) => (c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]))
    .join('');
}

export default function DecryptingLoader({ onDone }) {
  const [display, setDisplay] = useState('DECRYPTING...');
  const[showReal, setShowReal] = useState(false);

  useEffect(() => {
    sounds.glitch();
    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count < 18) {
        setDisplay(scramble('DECRYPTING...'));
      } else {
        setDisplay('DECRYPTING... DONE');
        setShowReal(true);
        clearInterval(interval);
        setTimeout(() => onDone?.(), 400);
      }
    }, 60);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(0,10,5,0.97)' }}
      role="status"
      aria-label="Loading next challenge"
    >
      <div className="scanlines" />

      {/* Glitch box */}
      <div className="cyber-panel rounded p-12 text-center max-w-sm w-full mx-4">
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
          className="mb-4"
        >
          <div
            className="text-4xl font-black glitch"
            data-text="█ █ █"
            style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}
          >
            █ █ █
          </div>
        </motion.div>

        <p
          className="text-xl tracking-widest mb-6"
          style={{ fontFamily: 'var(--font-mono)', color: showReal ? 'var(--neon-cyan)' : 'var(--neon-green)' }}
        >
          {display}
        </p>

        {/* Bar */}
        <div className="h-1 rounded overflow-hidden" style={{ background: 'rgba(0,255,65,0.1)' }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: showReal ? '100%' : '80%' }}
            transition={{ duration: 1.2, ease: 'easeInOut' }}
            className="progress-bar-fill rounded h-full"
          />
        </div>
        <p className="text-xs mt-3 opacity-40" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
          LOADING NEXT CHALLENGE...
        </p>
      </div>

      {/* Corner scan lines */}
      <motion.div
        animate={{ opacity: [0, 1, 0] }}
        transition={{ repeat: Infinity, duration: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'rgba(0,255,65,0.02)' }}
      />
    </motion.div>
  );
}
