import React from 'react';

/**
 * Ornate arabesque decorations for the classical Mushaf page.
 * Uses SVG so it stays crisp at any size and inherits theme colors via CSS vars.
 *
 * Palette hooks (read from CSS custom properties on the frame):
 *   --mo-gold   : main gilded stroke/fill
 *   --mo-ink    : deep navy / ink outline
 *   --mo-paper  : page/paper background
 *   --mo-accent : soft floral tint
 */

const Arabesque: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 40 120"
    preserveAspectRatio="none"
    className={className}
    aria-hidden="true"
  >
    <defs>
      <pattern id="mo-vine" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        {/* Central vine stem */}
        <path
          d="M20 0 C 12 10, 28 18, 20 26 C 12 34, 28 42, 20 40"
          fill="none"
          stroke="var(--mo-gold, #b8944a)"
          strokeWidth="1.1"
          opacity="0.9"
        />
        {/* Left tendril + petal */}
        <path
          d="M20 8 C 10 10, 6 16, 10 20 C 14 24, 20 22, 20 18"
          fill="var(--mo-accent, #cbb26a)"
          fillOpacity="0.28"
          stroke="var(--mo-gold, #b8944a)"
          strokeWidth="0.7"
        />
        {/* Right tendril + petal */}
        <path
          d="M20 28 C 30 30, 34 24, 30 20 C 26 16, 20 22, 20 26"
          fill="var(--mo-ink, #2b3a55)"
          fillOpacity="0.22"
          stroke="var(--mo-gold, #b8944a)"
          strokeWidth="0.7"
        />
        {/* Small floral dots */}
        <circle cx="20" cy="4" r="1.2" fill="var(--mo-gold, #b8944a)" />
        <circle cx="20" cy="36" r="1.2" fill="var(--mo-gold, #b8944a)" />
      </pattern>
    </defs>
    <rect x="0" y="0" width="40" height="120" fill="url(#mo-vine)" />
  </svg>
);

export const MushafCrown: React.FC = () => (
  <svg
    viewBox="0 0 400 90"
    className="mushaf-crown"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    {/* Baseline */}
    <line x1="10" y1="80" x2="390" y2="80" stroke="var(--mo-gold, #b8944a)" strokeWidth="1" />
    <line x1="14" y1="83" x2="386" y2="83" stroke="var(--mo-gold, #b8944a)" strokeWidth="0.5" opacity="0.6" />

    {/* Central dome */}
    <path
      d="M200 8 C 160 8, 130 40, 130 70 L 130 80 L 270 80 L 270 70 C 270 40, 240 8, 200 8 Z"
      fill="var(--mo-paper, #faf4e2)"
      stroke="var(--mo-gold, #b8944a)"
      strokeWidth="1.3"
    />
    {/* Inner dome outline */}
    <path
      d="M200 16 C 168 16, 140 44, 140 70 L 140 78 L 260 78 L 260 70 C 260 44, 232 16, 200 16 Z"
      fill="none"
      stroke="var(--mo-ink, #2b3a55)"
      strokeWidth="0.8"
      opacity="0.55"
    />
    {/* Dome floral inside */}
    <path
      d="M200 26 C 188 34, 188 46, 200 52 C 212 46, 212 34, 200 26 Z"
      fill="var(--mo-gold, #b8944a)"
      opacity="0.5"
    />
    <circle cx="200" cy="40" r="2.4" fill="var(--mo-ink, #2b3a55)" opacity="0.7" />
    <path d="M200 60 L 196 70 L 204 70 Z" fill="var(--mo-gold, #b8944a)" opacity="0.7" />

    {/* Tulip finial on top of dome */}
    <path
      d="M200 8 L 196 -2 Q 200 -6 204 -2 Z"
      fill="var(--mo-gold, #b8944a)"
    />
    <circle cx="200" cy="6" r="2" fill="var(--mo-gold, #b8944a)" />

    {/* Side arabesque wings */}
    <path
      d="M130 78 C 100 72, 80 60, 60 68 C 45 74, 40 80, 30 80"
      fill="none"
      stroke="var(--mo-gold, #b8944a)"
      strokeWidth="1.1"
    />
    <path
      d="M270 78 C 300 72, 320 60, 340 68 C 355 74, 360 80, 370 80"
      fill="none"
      stroke="var(--mo-gold, #b8944a)"
      strokeWidth="1.1"
    />

    {/* Hanging pendants */}
    {[50, 90, 310, 350].map((x) => (
      <g key={x}>
        <line x1={x} y1="80" x2={x} y2="88" stroke="var(--mo-gold, #b8944a)" strokeWidth="0.8" />
        <circle cx={x} cy="90" r="1.6" fill="var(--mo-gold, #b8944a)" />
      </g>
    ))}

    {/* Corner rosettes */}
    <circle cx="20" cy="80" r="4" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1" />
    <circle cx="20" cy="80" r="1.4" fill="var(--mo-gold, #b8944a)" />
    <circle cx="380" cy="80" r="4" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1" />
    <circle cx="380" cy="80" r="1.4" fill="var(--mo-gold, #b8944a)" />
  </svg>
);

export const MushafFooter: React.FC = () => (
  <svg viewBox="0 0 400 40" className="mushaf-footer-orn" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <line x1="14" y1="10" x2="386" y2="10" stroke="var(--mo-gold, #b8944a)" strokeWidth="1" />
    <line x1="20" y1="14" x2="380" y2="14" stroke="var(--mo-gold, #b8944a)" strokeWidth="0.5" opacity="0.6" />
    <path
      d="M180 10 C 190 22, 210 22, 220 10"
      fill="var(--mo-paper, #faf4e2)"
      stroke="var(--mo-gold, #b8944a)"
      strokeWidth="1"
    />
    <circle cx="200" cy="18" r="2" fill="var(--mo-gold, #b8944a)" />
    <circle cx="20" cy="10" r="3" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1" />
    <circle cx="380" cy="10" r="3" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1" />
  </svg>
);

/**
 * Wraps the mushaf page in a decorated arabesque frame.
 * Children are rendered inside the inner paper area.
 */
export const MushafOrnateBorder: React.FC<{ children: React.ReactNode; nightMode?: boolean }> = ({ children, nightMode }) => {
  return (
    <div className={`mushaf-ornate ${nightMode ? 'mushaf-ornate-night' : ''}`}>
      {/* Outer thin border */}
      <div className="mo-outer-border" />
      {/* Arabesque side rails */}
      <div className="mo-side mo-side-left" aria-hidden="true"><Arabesque className="mo-vine" /></div>
      <div className="mo-side mo-side-right" aria-hidden="true"><Arabesque className="mo-vine" /></div>
      {/* Top crown */}
      <div className="mo-crown-wrap" aria-hidden="true"><MushafCrown /></div>
      {/* Bottom ornament */}
      <div className="mo-footer-wrap" aria-hidden="true"><MushafFooter /></div>
      {/* Inner paper card */}
      <div className="mo-inner">{children}</div>
    </div>
  );
};

/** Cartouche-style Surah banner used inside the ornate page. */
export const SurahCartouche: React.FC<{ name: string; number: number; english?: string }> = ({ name, number, english }) => (
  <div className="mushaf-cartouche" role="heading" aria-level={2}>
    <svg viewBox="0 0 320 70" preserveAspectRatio="xMidYMid meet" className="mc-svg" aria-hidden="true">
      <defs>
        <linearGradient id="mc-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      {/* Outer arched cartouche */}
      <path
        d="M20 35 Q 20 8, 60 8 L 260 8 Q 300 8, 300 35 Q 300 62, 260 62 L 60 62 Q 20 62, 20 35 Z"
        fill="url(#mc-fill)"
        stroke="var(--mo-gold, #b8944a)"
        strokeWidth="1.4"
      />
      {/* Inner outline */}
      <path
        d="M28 35 Q 28 14, 62 14 L 258 14 Q 292 14, 292 35 Q 292 56, 258 56 L 62 56 Q 28 56, 28 35 Z"
        fill="none"
        stroke="var(--mo-ink, #2b3a55)"
        strokeWidth="0.7"
        opacity="0.5"
      />
      {/* Side rosettes */}
      <circle cx="20" cy="35" r="6" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1.2" />
      <circle cx="20" cy="35" r="2" fill="var(--mo-gold, #b8944a)" />
      <circle cx="300" cy="35" r="6" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1.2" />
      <circle cx="300" cy="35" r="2" fill="var(--mo-gold, #b8944a)" />
    </svg>
    <div className="mc-text">
      <span className="mc-name">سُورَةُ {name}</span>
      {english && <span className="mc-meta">{english} · رقم {number}</span>}
    </div>
  </div>
);

export default MushafOrnateBorder;
