'use client';

import { useState, useCallback, useMemo } from 'react';

const BUBBLE_COUNT = 20;
const COLORS = ['rgba(139,92,246,0.3)', 'rgba(99,102,241,0.25)', 'rgba(59,130,246,0.2)'];

function seededStyle(i) {
  const s = (i * 7 + 13) % 100 / 100;
  const t = (i * 11 + 17) % 100 / 100;
  const w = 12 + (i * 3 % 24);
  const d = 4 + (i % 5);
  const del = (i % 5);
  return {
    left: `${s * 100}%`,
    top: `${t * 100}%`,
    width: w,
    height: w,
    animationDelay: `${del}s`,
    animationDuration: `${d}s`,
    background: COLORS[i % COLORS.length],
  };
}

function Bubble({ id, style, onPop }) {
  const [popping, setPopping] = useState(false);

  const handleClick = useCallback(() => {
    setPopping(true);
    onPop?.(id);
    setTimeout(() => setPopping(false), 500);
  }, [id, onPop]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`absolute rounded-full blur-sm cursor-pointer hover:scale-125 transition-transform focus:outline-none focus:ring-2 focus:ring-violet-400/50 ${
        popping ? 'animate-pop pointer-events-none' : 'animate-float'
      }`}
      style={{
        left: style.left,
        top: style.top,
        width: style.width,
        height: style.height,
        animationDelay: style.animationDelay,
        animationDuration: style.animationDuration,
        background: style.background,
        borderRadius: '50%',
      }}
      aria-hidden
    />
  );
}

export default function FitnessBackground() {
  const [, setTick] = useState(0);
  const bubbleStyles = useMemo(() => Array.from({ length: BUBBLE_COUNT }, (_, i) => seededStyle(i)), []);

  const handlePop = useCallback(() => {
    setTick((t) => t + 1);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Gradient mesh - Gen Z vibe */}
      <div
        className="absolute inset-0 opacity-90 transition-all duration-[8s]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139, 92, 246, 0.45), transparent),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(99, 102, 241, 0.35), transparent),
            radial-gradient(ellipse 50% 50% at 50% 100%, rgba(6, 182, 212, 0.3), transparent),
            radial-gradient(ellipse 100% 80% at 50% 0%, rgba(139, 92, 246, 0.2), transparent)
          `,
          animation: 'gradient-shift 15s ease infinite alternate',
        }}
      />
      <div className="absolute inset-0 bg-[#0f0a1a]" style={{ mixBlendMode: 'multiply' }} />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Floating bubbles */}
      {bubbleStyles.map((style, i) => (
        <Bubble key={i} id={i} style={style} onPop={handlePop} />
      ))}
    </div>
  );
}
