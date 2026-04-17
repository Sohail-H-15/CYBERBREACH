import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';

import LoginScreen   from './screens/LoginScreen';
import BootScreen    from './screens/BootScreen';
import GameScreen    from './screens/GameScreen';
import FinalScreen   from './screens/FinalScreen';
import SecuredScreen from './screens/SecuredScreen';
import FailedScreen  from './screens/FailedScreen';
import AdminScreen   from './screens/AdminScreen';

// Page-level transition variants
const pageVariants = {
  initial: { opacity: 0, filter: 'blur(8px) brightness(2)' },
  enter:   { opacity: 1, filter: 'blur(0px) brightness(1)', transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, filter: 'blur(8px) brightness(0.5)', transition: { duration: 0.3, ease: 'easeIn' } },
};

function PhaseRouter() {
  const { state } = useGame();
  const { phase } = state;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="min-h-screen"
      >
        {phase === 'login'   && <LoginScreen />}
        {phase === 'boot'    && <BootScreen />}
        {phase === 'game'    && <GameScreen />}
        {phase === 'final'   && <FinalScreen />}
        {phase === 'secured' && <SecuredScreen />}
        {phase === 'failed'  && <FailedScreen />}
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Main Game Route */}
        <Route 
          path="/" 
          element={
            <GameProvider>
              <PhaseRouter />
            </GameProvider>
          } 
        />
        
        {/* Admin Route */}
        <Route path="/admin" element={<AdminScreen />} />
      </Routes>
    </Router>
  );
}
