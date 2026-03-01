'use client';

import { useMemo } from 'react';

const BUBBLE_COUNT = 30;
// Subtle bubbles - visible, soft, more pink/red
const COLORS = [
  'rgba(251,113,133,0.12)',
  'rgba(244,63,94,0.1)',
  'rgba(253,164,175,0.12)',
  'rgba(236,72,153,0.11)',
  'rgba(254,205,211,0.1)',
];
const ANIMATIONS = ['animate-float', 'animate-float-slow', 'animate-float-rise', 'animate-float-drift'];

function seededStyle(i) {
  const s = (i * 7 + 13) % 100 / 100;
  const t = (i * 11 + 17) % 100 / 100;
  const w = 8 + (i * 2 % 14);
  const d = 8 + (i % 6);
  const del = (i % 7);
  const anim = ANIMATIONS[i % ANIMATIONS.length];
  return {
    left: `${s * 100}%`,
    top: `${t * 100}%`,
    width: w,
    height: w,
    animationDelay: `${del}s`,
    animationDuration: `${d}s`,
    background: COLORS[i % COLORS.length],
    animationClass: anim,
  };
}

function Bubble({ style }) {
  return (
    <div
      role="presentation"
      className={`absolute rounded-full ${style.animationClass}`}
      style={{
        left: style.left,
        top: style.top,
        width: style.width,
        height: style.height,
        animationDelay: style.animationDelay,
        animationDuration: style.animationDuration,
        background: style.background,
        borderRadius: '50%',
        boxShadow: '0 0 8px rgba(255,255,255,0.02)',
      }}
      aria-hidden
    />
  );
}

export default function FitnessBackground() {
  const bubbleStyles = useMemo(() => Array.from({ length: BUBBLE_COUNT }, (_, i) => seededStyle(i)), []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* Gradient mesh - Gen Z vibe with more pink/red */}
      <div
        className="absolute inset-0 opacity-90 animate-gradient-shift"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(244, 63, 94, 0.28), transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(236, 72, 153, 0.3), transparent 55%),
            radial-gradient(ellipse 50% 50% at 50% 20%, rgba(251, 113, 133, 0.42), transparent 50%),
            radial-gradient(ellipse 70% 60% at 50% 80%, rgba(244, 63, 94, 0.26), transparent 55%),
            radial-gradient(ellipse 55% 45% at 70% 30%, rgba(236, 72, 153, 0.32), transparent 50%),
            radial-gradient(ellipse 60% 50% at 10% 70%, rgba(253, 164, 175, 0.3), transparent 55%),
            radial-gradient(ellipse 50% 60% at 90% 25%, rgba(244, 63, 94, 0.28), transparent 50%),
            radial-gradient(ellipse 45% 45% at 35% 15%, rgba(251, 113, 133, 0.26), transparent 45%),
            radial-gradient(ellipse 70% 50% at 60% 90%, rgba(236, 72, 153, 0.22), transparent 55%),
            radial-gradient(ellipse 50% 70% at 5% 50%, rgba(244, 63, 94, 0.24), transparent 50%)
          `,
        }}
      />
      {/* Animated pink/red overlay - shifting accent */}
      <div
        className="absolute inset-0 animate-gradient-pulse"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 30% 50%, rgba(244, 63, 94, 0.24), transparent 55%),
            radial-gradient(ellipse 70% 80% at 70% 40%, rgba(236, 72, 153, 0.2), transparent 50%),
            radial-gradient(ellipse 80% 70% at 50% 30%, rgba(251, 113, 133, 0.18), transparent 50%)
          `,
        }}
      />
      {/* Drifting gradient - moves over time */}
      <div className="absolute inset-0 animate-gradient-drift pointer-events-none" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(28,18,32,0.86) 0%, rgba(36,20,36,0.9) 100%)' }} />
      {/* Subtle grid */}
      {/* Bubble layer - above overlay for visibility */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />
      {/* Floating bubbles - above other layers, pointer-events-none */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        {bubbleStyles.map((style, i) => (
          <Bubble key={i} style={style} />
        ))}
      </div>
    </div>
  );
}
