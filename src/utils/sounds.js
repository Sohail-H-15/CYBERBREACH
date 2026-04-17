// ─── Web Audio API sound synthesizer ─────────────────────────────────────────
// No external files needed; all sounds are generated procedurally.
// ─────────────────────────────────────────────────────────────────────────────

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function beep({ frequency = 440, duration = 0.1, type = 'square', gain = 0.3 } = {}) {
  try {
    const ac = getCtx();
    const osc = ac.createOscillator();
    const gainNode = ac.createGain();
    osc.connect(gainNode);
    gainNode.connect(ac.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ac.currentTime);
    gainNode.gain.setValueAtTime(gain, ac.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch (_) {}
}

export const sounds = {
  keyPress() {
    beep({ frequency: 800, duration: 0.04, type: 'square', gain: 0.08 });
  },

  accessGranted() {
    [523, 659, 784].forEach((f, i) => {
      setTimeout(() => beep({ frequency: f, duration: 0.15, type: 'sine', gain: 0.25 }), i * 100);
    });
  },

  accessDenied() {
    [220, 180, 160].forEach((f, i) => {
      setTimeout(() => beep({ frequency: f, duration: 0.12, type: 'sawtooth', gain: 0.3 }), i * 80);
    });
  },

  glitch() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        beep({
          frequency: 100 + Math.random() * 1000,
          duration: 0.03,
          type: 'sawtooth',
          gain: 0.15,
        });
      }, i * 30);
    }
  },

  timerWarning() {
    beep({ frequency: 440, duration: 0.08, type: 'square', gain: 0.2 });
    setTimeout(() => beep({ frequency: 440, duration: 0.08, type: 'square', gain: 0.2 }), 200);
  },

  systemSecured() {
    const notes = [262, 330, 392, 523, 659, 784, 1047];
    notes.forEach((f, i) => {
      setTimeout(() => beep({ frequency: f, duration: 0.2, type: 'sine', gain: 0.3 }), i * 80);
    });
  },

  systemFailure() {
    [440, 415, 392, 370, 349].forEach((f, i) => {
      setTimeout(() => beep({ frequency: f, duration: 0.25, type: 'sawtooth', gain: 0.35 }), i * 150);
    });
  },

  letterReveal() {
    beep({ frequency: 1047, duration: 0.15, type: 'sine', gain: 0.3 });
    setTimeout(() => beep({ frequency: 1319, duration: 0.1, type: 'sine', gain: 0.2 }), 100);
  },

  transition() {
    beep({ frequency: 600, duration: 0.05, type: 'square', gain: 0.1 });
    setTimeout(() => beep({ frequency: 400, duration: 0.05, type: 'square', gain: 0.1 }), 60);
  },

  warning() {
    beep({ frequency: 880, duration: 0.3, type: 'square', gain: 0.35 });
  },
};
