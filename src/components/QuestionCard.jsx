// ─── Question Card (with Framer Motion slide transitions) ─────────────────────
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import { sounds } from '../utils/sounds';
import DecryptingLoader from './DecryptingLoader';

const DIFFICULTY_COLORS = {
  EASY:   'var(--neon-green)',
  MEDIUM: '#ff9900',
  HARD:   'var(--neon-red)',
};

// Glitch-style slide variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
    filter: 'blur(4px) brightness(2)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px) brightness(1)',
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
    filter: 'blur(4px) brightness(2)',
    transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] },
  }),
};

export default function QuestionCard({ onAnswerSubmit, onNext }) {
  const { state, currentQuestion, questions } = useGame();
  const { currentQuestionIndex } = state;

  const [answer, setAnswer]       = useState('');
  const [status, setStatus]       = useState(null);    // 'correct' | 'wrong' | null
  const [points, setPoints]       = useState(0);
  const [shake, setShake]         = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [direction, setDirection] = useState(1);        // 1 = forward, -1 = back
  const [glitching, setGlitching] = useState(false);
  const [isZoomed, setIsZoomed]   = useState(false);

  const inputRef     = useRef(null);
  const prevIndexRef = useRef(currentQuestionIndex);
  const autoAdvanceRef = useRef(null);

  // Detect direction on index change
  useEffect(() => {
    setDirection(currentQuestionIndex >= prevIndexRef.current ? 1 : -1);
    prevIndexRef.current = currentQuestionIndex;
    setAnswer('');
    setStatus(null);
    setGlitching(false);
    setIsZoomed(false);
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

  if (!currentQuestion) return null;

  const difficultyColor = DIFFICULTY_COLORS[currentQuestion.difficulty] || 'var(--neon-green)';

  // ── Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'correct' || !answer.trim()) return;

    sounds.keyPress();
    const result = await onAnswerSubmit(answer);

    if (result.correct) {
      setStatus('correct');
      setPoints(result.points);
      sounds.accessGranted();
      sounds.letterReveal();
      // Screen glitch flash
      setGlitching(true);
      setTimeout(() => setGlitching(false), 600);
    } else {
      setStatus('wrong');
      sounds.accessDenied();
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // ── Next handler with decrypting loader
  const handleNext = () => {
    setShowLoader(true);
    sounds.transition();
  };

  const handleLoaderDone = () => {
    setShowLoader(false);
    onNext();
  };

  const q = currentQuestion;
  const qNum = currentQuestionIndex + 1;
  const total = questions.length;

  return (
    <>
      {/* Screen glitch flash on correct */}
      <AnimatePresence>
        {glitching && (
          <motion.div
            key="glitch-flash"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{ background: 'var(--neon-green)', mixBlendMode: 'overlay' }}
          />
        )}
      </AnimatePresence>

      {/* Decrypting loader overlay */}
      <AnimatePresence>
        {showLoader && <DecryptingLoader onDone={handleLoaderDone} />}
      </AnimatePresence>

      {/* Slide-in question */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentQuestionIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="w-full"
        >
          {/* ── Question card ── */}
          <div className="cyber-panel rounded overflow-hidden">

            {/* Card header */}
            <div
              className="flex items-center justify-between px-6 py-3"
              style={{ background: 'rgba(0,255,65,0.05)', borderBottom: '1px solid var(--border-green)' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="status-badge"
                  style={{ color: difficultyColor, borderColor: difficultyColor }}
                >
                  {q.difficulty}
                </span>
                <span
                  className="status-badge"
                  style={{ color: 'var(--neon-cyan)', borderColor: 'var(--neon-cyan)' }}
                >
                  {q.category}
                </span>
              </div>
              <span
                className="text-xs tracking-widest opacity-50"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
              >
                CHALLENGE_{String(qNum).padStart(2, '0')}.exe
              </span>
            </div>

            <div className="p-6 md:p-8">
              {/* Progress bar within card */}
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1 opacity-50" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}>
                  <span>PROGRESS</span>
                  <span>{qNum} / {total}</span>
                </div>
                <div className="h-1 rounded" style={{ background: 'rgba(0,255,65,0.1)' }}>
                  <div
                    className="progress-bar-fill rounded"
                    style={{ width: `${(qNum / total) * 100}%`, height: '4px', transition: 'width 0.6s ease' }}
                  />
                </div>
              </div>

              {/* Question text */}
              <div
                className="mb-6 p-5 rounded"
                style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid rgba(0,255,65,0.15)',
                }}
              >
                <p
                  className="text-xs tracking-widest mb-3 opacity-50"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
                >
                  ◈ CHALLENGE BRIEF
                </p>

                  {q.mediaUrl && q.mediaType === 'image' && (
                    <div className="mb-6 text-center shadow-lg">
                      <img 
                        src={q.mediaUrl} 
                        alt="Challenge clue" 
                        className="max-w-full rounded border border-green-500/30 object-contain mx-auto max-h-[50vh] cursor-zoom-in hover:scale-[1.02] transition-transform"
                        onClick={() => setIsZoomed(true)}
                      />
                      <AnimatePresence>
                        {isZoomed && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 cursor-zoom-out p-4 md:p-12" 
                            onClick={() => setIsZoomed(false)}
                          >
                            <img src={q.mediaUrl} alt="Challenge clue zoomed" className="w-full h-full object-contain pointer-events-none drop-shadow-[0_0_20px_rgba(0,255,65,0.2)]" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                {q.mediaUrl && q.mediaType === 'video' && (
                  <div className="mb-4">
                    <video src={q.mediaUrl} controls className="max-w-full rounded border border-green-500/30 object-contain max-h-64 mx-auto cursor-pointer" />
                  </div>
                )}
                {q.mediaUrl && q.mediaType === 'audio' && (
                  <div className="mb-4">
                    <audio src={q.mediaUrl} controls className="w-full my-2 outline-none" />
                  </div>
                )}

                <p
                  className="text-2xl leading-relaxed whitespace-pre-wrap font-bold"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', textShadow: '0 0 5px rgba(0,255,65,0.3)' }}
                >
                  {q.question}
                </p>
              </div>

              {/* Answer form */}
              <form onSubmit={handleSubmit} id={`question-form-${qNum}`}>
                <label
                  htmlFor={`answer-input-${qNum}`}
                  className="block text-xs tracking-widest mb-2 opacity-60"
                  style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)' }}
                >
                  ◈ ENTER RESPONSE
                </label>
                <motion.div animate={shake ? { x: [-6, 6, -6, 6, 0] } : {}} transition={{ duration: 0.4 }}>
                  <input
                    id={`answer-input-${qNum}`}
                    ref={inputRef}
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      setAnswer(e.target.value);
                      if (status === 'wrong') setStatus(null);
                    }}
                    onKeyDown={() => sounds.keyPress()}
                    placeholder="TYPE YOUR ANSWER..."
                    className={`cyber-input rounded ${status === 'wrong' ? 'shake' : ''}`}
                    style={{ borderColor: status === 'correct' ? 'var(--neon-green)' : status === 'wrong' ? 'var(--neon-red)' : undefined }}
                    disabled={status === 'correct'}
                    autoComplete="off"
                    spellCheck="false"
                    aria-label="Answer input field"
                  />
                </motion.div>

                {/* Feedback */}
                <AnimatePresence mode="wait">
                  {status === 'correct' && (
                    <motion.div
                      key="granted"
                      initial={{ scale: 0.8, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                      className="mt-4 text-center"
                    >
                      <p className="access-granted">✓ ACCESS GRANTED</p>
                      <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-green)', opacity: 0.7 }}>
                        +{points} pts — Key fragment [{q.revealedLetter}] decrypted!
                      </p>
                    </motion.div>
                  )}
                  {status === 'wrong' && (
                    <motion.div
                      key="denied"
                      initial={{ scale: 0.8, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-4 text-center"
                    >
                      <p className="access-denied">✗ ACCESS DENIED</p>
                      <p className="text-sm mt-2" style={{ fontFamily: 'var(--font-mono)', color: 'var(--neon-red)', opacity: 0.7 }}>
                        Incorrect. Try again, agent.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Buttons */}
                <div className="mt-6 flex gap-4">
                  {status !== 'correct' && (
                    <motion.button
                      id={`submit-btn-${qNum}`}
                      type="submit"
                      className="cyber-btn flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={!answer.trim()}
                    >
                      [ SUBMIT RESPONSE ]
                    </motion.button>
                  )}
                  {status === 'correct' && (
                    <motion.button
                      id={`next-btn-${qNum}`}
                      type="button"
                      onClick={handleNext}
                      className="cyber-btn flex-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      {qNum === total ? '[ ENTER FINAL PHASE ]' : '[ NEXT CHALLENGE →]'}
                    </motion.button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
