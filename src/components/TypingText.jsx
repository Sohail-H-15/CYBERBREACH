// ─── Typing Effect ────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';

export default function TypingText({
  text,
  speed = 35,
  className = '',
  onDone,
  cursor = true,
  startDelay = 0,
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    let timeout;

    const type = () => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
        timeout = setTimeout(type, speed);
      } else {
        setDone(true);
        onDone?.();
      }
    };

    const startTimeout = setTimeout(type, startDelay);
    return () => {
      clearTimeout(timeout);
      clearTimeout(startTimeout);
    };
  }, [text, speed, startDelay]);

  return (
    <span className={className}>
      {displayed}
      {cursor && !done && <span className="animate-pulse">█</span>}
    </span>
  );
}
