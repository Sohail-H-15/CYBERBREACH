// ─── Tab Switch Warning ───────────────────────────────────────────────────────
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { useEffect, useState } from 'react';
import { sounds } from '../utils/sounds';

export default function TabWarning() {
  const { state } = useGame();
  const [visible, setVisible] = useState(false);
  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (state.tabSwitchCount > prevCount) {
      setVisible(true);
      sounds.warning();
      setPrevCount(state.tabSwitchCount);
      const t = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(t);
    }
  }, [state.tabSwitchCount]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="warning-banner fixed top-4 left-1/2 -translate-x-1/2 z-[9999] px-6 py-4 rounded max-w-md w-full"
          style={{ fontFamily: 'var(--font-mono)' }}
          role="alert"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl" style={{ color: 'var(--neon-red)' }}>⚠</span>
            <div>
              <p className="font-bold text-sm tracking-widest" style={{ color: 'var(--neon-red)', fontFamily: 'var(--font-orb)' }}>
                ANTI-CHEAT DETECTED
              </p>
              <p className="text-xs mt-1 opacity-80" style={{ color: 'var(--neon-red)' }}>
                Tab switch detected! Violation #{state.tabSwitchCount}. Activity logged.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
