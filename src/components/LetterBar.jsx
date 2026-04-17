// ─── Letter Collection Bar ───────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function LetterBar() {
  const { state, questions } = useGame();
  const { revealedLetters } = state;

  return (
    <div className="cyber-panel rounded p-4">
      <p
        className="text-xs tracking-widest mb-3 opacity-60"
        style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
      >
        ◈ DECRYPTION KEY FRAGMENTS
      </p>
      <div className="flex gap-2 flex-wrap justify-center">
        {questions.map((q, i) => {
          const letter = revealedLetters[i];
          const revealed = letter !== null && letter !== undefined;
          return (
            <div key={i} className="text-center">
              <AnimatePresence mode="wait">
                {revealed ? (
                  <motion.div
                    key="letter"
                    initial={{ scale: 0, rotateY: 180, opacity: 0 }}
                    animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    className="letter-box revealed"
                    style={{ fontFamily: 'var(--font-orb)', color: 'var(--neon-green)' }}
                  >
                    {letter}
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="letter-box"
                    style={{ color: 'rgba(0,255,65,0.2)' }}
                  >
                    _
                  </motion.div>
                )}
              </AnimatePresence>
              <p
                className="text-xs mt-1 opacity-40"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', fontSize: '0.6rem' }}
              >
                {String(i + 1).padStart(2, '0')}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
