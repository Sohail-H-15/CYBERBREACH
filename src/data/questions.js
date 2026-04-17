import imageAsset from '../assets/image.png';
import videoAsset from '../assets/video.mp4';
import audioAsset from '../assets/morse (1).wav';

// ─── Quiz Questions ───────────────────────────────────────────────────────────
// Each question reveals one or more letters of the final password: "CYBERBREACH"
// The letters have been randomized to prevent sequential guessing.
// ─────────────────────────────────────────────────────────────────────────────

export const QUESTIONS = [
  {
    id: 1,
    type: 'text',
    category: 'RIDDLE',
    difficulty: 'EASY',
    revealedLetter: 'E',
    question: '⚠ SYSTEM ALERT ⚠\n\nUnauthorized access detected...\n\nI protect your accounts,\nI can be strong or weak,\nIf you share me, you are at risk.\n\nWhat am I?',
    answer: 'password',
  },
  {
    id: 2,
    type: 'image',
    category: 'IMAGE PUZZLE',
    difficulty: 'EASY',
    revealedLetter: 'R',
    question: '⚠ VISUAL DATA DETECTED ⚠\n\nAnalyze the image carefully and decode the hidden message.',
    mediaType: 'image',
    mediaUrl: imageAsset,
    answer: 'decrypt',
  },
  {
    id: 3,
    type: 'text',
    category: 'LOGIC PATTERN',
    difficulty: 'MEDIUM',
    revealedLetter: 'Y',
    question: '⚠ SYSTEM PATTERN DETECTED ⚠\n\nAnalyze the sequence:\n\n2 → 6 → 7 → 21 → 22 → ?',
    answer: '66',
  },
  {
    id: 4,
    type: 'video',
    category: 'VIDEO PUZZLE',
    difficulty: 'MEDIUM',
    revealedLetter: 'CH',
    question: '⚠ CORRUPTED TRANSMISSION ⚠\n\nA secure code is being transmitted through a compromised channel.\n\nSystem log:\n"Applying offset..."\n\n⚠ Note:\n- Numbers are shifted forward (+1)\n- Letters are shifted backward (-1)\n\nObserve the video carefully and reconstruct the original code.',
    mediaType: 'video',
    mediaUrl: videoAsset,
    answer: 'x9k7',
  },
  {
    id: 5,
    type: 'text',
    category: 'BINARY PUZZLE',
    difficulty: 'MEDIUM',
    revealedLetter: 'C',
    question: '⚠ ENCODED DATA DETECTED ⚠\n\nThe system has stored a scrambled message in binary.\n\n01001011 01001110 01000101 01010100 01001111\n\nReconstruct the correct word.',
    answer: 'token',
  },
  {
    id: 6,
    type: 'audio',
    category: 'AUDIO PUZZLE',
    difficulty: 'MEDIUM',
    revealedLetter: 'B',
    question: '⚠ SIGNAL INTERCEPTED ⚠\n\nAn encoded transmission has been captured.\n\nUse the reference below to decode the message:\n\nA = .-     B = -...     C = -.-.     D = -..\nE = .      F = ..-.     G = --.      H = ....\nI = ..     J = .---     K = -.-      L = .-..\nM = --     N = -.       O = ---      P = .--.\nQ = --.-   R = .-.      S = ...      T = -\nU = ..-    V = ...-     W = .--      X = -..-\nY = -.--   Z = --..\n\nDecode the audio signal and identify the word.',
    mediaType: 'audio',
    mediaUrl: audioAsset,
    answer: 'secure',
  },
  {
    id: 7,
    type: 'text',
    category: 'SCRIPT PUZZLE',
    difficulty: 'HARD',
    revealedLetter: 'A',
    question: '⚠ SYSTEM SCRIPT ANALYSIS ⚠\n\nA script was recovered from the compromised system.\n\nAnalyze the logic and determine the output:\n\nword = "dffhvv"\n\nresult = ""\n\nfor c in word:\nresult += chr(ord(c) - 3)\n\nprint(result)',
    answer: 'access',
  },
  {
    id: 8,
    type: 'text',
    category: 'MULTI-STEP PUZZLE',
    difficulty: 'HARD',
    revealedLetter: 'E',
    question: '⚠ MULTI-LAYER AUTHENTICATION ⚠\n\nThe system requires multiple keys.\n\nSolve each step and combine the results:\n\n1. 5 × 5 = ?\n2. First letter of "Encryption"\n3. Last letter of "Lock"\n\nCombine all results to form a meaningful word.',
    answer: 'key',
  },
  {
    id: 9,
    type: 'text',
    category: 'SEQUENCE PUZZLE',
    difficulty: 'HARD',
    revealedLetter: 'B',
    question: '⚠ SYSTEM SEQUENCE ANALYSIS ⚠\n\nAnalyze the sequence:\n\n3 → 9 → 10 → 30 → 31 → ?',
    answer: '93',
  },
  {
    id: 10,
    type: 'text',
    category: 'FINAL BOSS',
    difficulty: 'HARD',
    revealedLetter: 'R',
    question: '⚠ FINAL SYSTEM OVERRIDE ⚠\n\nTo regain full control, answer this:\n\nWhich process converts readable data into an unreadable format for security purposes?',
    answer: 'encryption',
  },
];

export const MASTER_KEY = 'CYBERBREACH'; // final password
export const GAME_DURATION_SECONDS = 35 * 60; // 35 minutes
