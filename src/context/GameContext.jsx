// ─── Game State Context ───────────────────────────────────────────────────────
import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { QUESTIONS, GAME_DURATION_SECONDS, MASTER_KEY } from '../data/questions';
import axios from 'axios';

// ── Context
const GameContext = createContext(null);
export const useGame = () => useContext(GameContext);

// ── Initial state
const INITIAL = {
  phase: 'login',        // login | boot | game | final | secured | failed
  teamName: '',
  score: 0,
  currentQuestionIndex: 0,
  answeredQuestions: [],  // {id, correct, timeTaken}
  revealedLetters: [],    // array of revealed chars (null = not yet revealed)
  timeRemaining: GAME_DURATION_SECONDS,
  timerActive: false,
  tabSwitchCount: 0,
};

// ── Reducer
function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, teamName: action.teamName, phase: action.hasStarted ? 'game' : 'boot', score: action.score || 0 };
    case 'SYNC_STATE': {
      // Sync remaining time, score, and letters
      const answeredList = action.solvedQuestions.map(qId => ({ id: qId, correct: true }));
      // We will skip forward to the first unanswered question
      let nextIndex = 0;
      while (nextIndex < QUESTIONS.length && action.solvedQuestions.includes(QUESTIONS[nextIndex].id)) {
        nextIndex++;
      }
      
      const newLetters = new Array(QUESTIONS.length).fill(null);
      action.solvedQuestions.forEach((qId, i) => {
        const qIndex = QUESTIONS.findIndex(q => q.id === qId);
        if (qIndex !== -1 && i < action.lettersCollected.length) {
          newLetters[qIndex] = action.lettersCollected[i];
        }
      });

      return {
        ...state,
        score: action.score,
        answeredQuestions: answeredList,
        revealedLetters: newLetters,
        currentQuestionIndex: action.isInitialSync ? (nextIndex >= QUESTIONS.length ? QUESTIONS.length - 1 : nextIndex) : state.currentQuestionIndex,
        tabSwitchCount: action.tabSwitchCount,
        timeRemaining: action.remainingTime > 0 ? Math.floor(action.remainingTime / 1000) : 0,
        phase: action.isFinished ? 'final' : (state.phase === 'login' || state.phase === 'boot' ? 'game' : state.phase),
        timerActive: !action.isFinished,
      };
    }
    case 'START_GAME':
      return {
        ...state,
        phase: 'game',
        timerActive: true,
        revealedLetters: state.revealedLetters.length ? state.revealedLetters : new Array(QUESTIONS.length).fill(null),
      };
    case 'TICK':
      if (state.timeRemaining <= 0) return { ...state, timeRemaining: 0, timerActive: false, phase: 'failed' };
      return { ...state, timeRemaining: state.timeRemaining - 1 };
    case 'CORRECT_ANSWER': {
      const newLetters = [...state.revealedLetters];
      newLetters[state.currentQuestionIndex] = action.letter;
      return {
        ...state,
        score: action.totalScore,
        answeredQuestions: [...state.answeredQuestions, { id: action.questionId, correct: true, timeTaken: action.timeTaken }],
        revealedLetters: newLetters,
        phase: action.isFinished ? 'final' : state.phase,
        timerActive: !action.isFinished
      };
    }
    case 'WRONG_ANSWER':
      return {
        ...state,
        answeredQuestions: [...state.answeredQuestions, { id: action.questionId, correct: false, timeTaken: action.timeTaken }],
      };
    case 'NEXT_QUESTION': {
      let nextIndex = state.currentQuestionIndex + 1;
      while (nextIndex < QUESTIONS.length && state.answeredQuestions.some(q => q.id === QUESTIONS[nextIndex].id && q.correct)) {
        nextIndex++;
      }
      if (nextIndex >= QUESTIONS.length) {
        return { ...state, currentQuestionIndex: QUESTIONS.length - 1, phase: 'final' };
      }
      return { ...state, currentQuestionIndex: nextIndex };
    }
    case 'GOTO_FINAL':
      return { ...state, phase: 'final', timerActive: false };
    case 'SYSTEM_SECURED':
      return { ...state, phase: 'secured', timerActive: false };
    case 'SYSTEM_FAILED':
      return { ...state, phase: 'failed', timerActive: false };
    case 'TAB_SWITCH':
      return { ...state, tabSwitchCount: action.tabSwitchCount || state.tabSwitchCount, score: action.score !== undefined ? action.score : state.score };
    default:
      return state;
  }
}

// ── Provider
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const timerRef = useRef(null);
  const questionStartRef = useRef(Date.now());

  // Timer
  useEffect(() => {
    if (state.timerActive && state.phase === 'game') {
      timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [state.timerActive, state.phase]);

  // Anti-cheat: tab switch detection
  useEffect(() => {
    const handleVisibility = async () => {
      if (document.hidden && state.phase === 'game' && state.teamName) {
        try {
          const res = await axios.post('/api/tab-switch', { teamName: state.teamName });
          if (res.data && res.data.ok) {
            dispatch({ type: 'TAB_SWITCH', tabSwitchCount: res.data.tabSwitchCount, score: res.data.score });
          }
        } catch (e) {
          console.error("Tab switch reporting failed", e);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.phase, state.teamName]);

  // Sync state continuously loosely
  useEffect(() => {
    if (state.teamName && state.phase === 'game') {
      let interval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/team/${state.teamName}`);
          if (res.data) {
             dispatch({
              type: 'SYNC_STATE',
              solvedQuestions: res.data.solvedQuestions,
              lettersCollected: res.data.lettersCollected,
              score: res.data.score,
              tabSwitchCount: res.data.tabSwitchCount,
              remainingTime: res.data.remainingTime,
              isFinished: res.data.isFinished
             });
          }
        } catch(e) {}
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [state.teamName, state.phase]);

  // API helpers
  const login = async (teamName) => {
    try {
      await axios.post('/api/login', { teamName });
      
      // Pull initial state
      const res = await axios.get(`/api/team/${teamName}`);
      dispatch({ type: 'LOGIN', teamName, score: res.data.score, hasStarted: res.data.startTime ? true : false });
      
      if (res.data.startTime) {
        dispatch({
          type: 'SYNC_STATE',
          solvedQuestions: res.data.solvedQuestions,
          lettersCollected: res.data.lettersCollected,
          score: res.data.score,
          tabSwitchCount: res.data.tabSwitchCount,
          remainingTime: res.data.remainingTime,
          isFinished: res.data.isFinished,
          isInitialSync: true
         });
      }
    } catch {
      // offline fallback
      dispatch({ type: 'LOGIN', teamName, hasStarted: false });
    }
  };

  const startGame = () => {
    questionStartRef.current = Date.now();
    dispatch({ type: 'START_GAME' });
  };

  const submitAnswer = async (answer) => {
    const q = QUESTIONS[state.currentQuestionIndex];
    if (!q) return { correct: false, points: 0 };
    
    const timeTaken = Math.floor((Date.now() - questionStartRef.current) / 1000);

    try {
      const res = await axios.post('/api/submit', {
        teamName: state.teamName,
        questionId: q.id,
        answer,
      });

      if (res.data && res.data.ok) {
        const correct = res.data.correct;
        const totalScore = res.data.totalScore;
        const letter = res.data.letter;
        
        if (correct) {
          dispatch({ type: 'CORRECT_ANSWER', totalScore, questionId: q.id, timeTaken, letter, isFinished: res.data.isFinished });
        } else {
          dispatch({ type: 'WRONG_ANSWER', questionId: q.id, timeTaken });
        }

        questionStartRef.current = Date.now();
        return { correct, points: res.data.addedScore };
      }
    } catch (_) {}
    
    // Offline / Error fallback
    dispatch({ type: 'WRONG_ANSWER', questionId: q.id, timeTaken });
    questionStartRef.current = Date.now();
    return { correct: false, points: 0 };
  };

  const nextQuestion = () => dispatch({ type: 'NEXT_QUESTION' });

  const submitMasterKey = async (key) => {
    const correct = key.trim().toUpperCase() === MASTER_KEY;
    try {
      await axios.post('/api/finish', {
        teamName: state.teamName,
      });
    } catch (_) {}
    if (correct) {
      dispatch({ type: 'SYSTEM_SECURED' });
    } else {
      // Wrong master key? Deduct points or just return false
    }
    return correct;
  };

  const value = {
    state,
    dispatch,
    login,
    startGame,
    submitAnswer,
    nextQuestion,
    submitMasterKey,
    questions: QUESTIONS,
    currentQuestion: QUESTIONS[state.currentQuestionIndex] || null,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
