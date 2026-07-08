import React from 'react';

/**
 * Ornate arabesque decorations for the classical Mushaf page.
 * Palette hooks (CSS variables on .mushaf-ornate):
 *   --mo-gold, --mo-gold-2, --mo-ink, --mo-paper, --mo-accent
 */

/* Elegant repeating side rail — thin gilded chain with floral nodes.
   Uses evenly spaced nodes so vertical rhythm feels engineered, not random. */
const SideRail: React.FC = () => (
  <svg
    viewBox="0 0 24 240"
    preserveAspectRatio="xMidYMid meet"
    className="mo-vine"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="mo-rail" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.35" />
        <stop offset="15%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="1" />
        <stop offset="85%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="1" />
        <stop offset="100%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.35" />
      </linearGradient>
    </defs>
    {/* Twin vertical hairlines */}
    <line x1="8"  y1="4" x2="8"  y2="236" stroke="url(#mo-rail)" strokeWidth="0.8" />
    <line x1="16" y1="4" x2="16" y2="236" stroke="url(#mo-rail)" strokeWidth="0.8" />
    {/* Evenly spaced floral nodes */}
    {[24, 68, 112, 156, 200].map((y) => (
      <g key={y}>
        <circle cx="12" cy={y} r="4.5" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1" />
        <circle cx="12" cy={y} r="1.6" fill="var(--mo-gold, #b8944a)" />
        {/* Small leaves branching outward */}
        <path d={`M4 ${y} Q 8 ${y - 4} 12 ${y}`} fill="none" stroke="var(--mo-gold, #b8944a)" strokeWidth="0.8" />
        <path d={`M20 ${y} Q 16 ${y + 4} 12 ${y}`} fill="none" stroke="var(--mo-gold, #b8944a)" strokeWidth="0.8" />
      </g>
    ))}
  </svg>
);

/* Refined crown: symmetric dome, calligraphic finial, ink+gold detailing. */
export const MushafCrown: React.FC = () => (
  <svg
    viewBox="0 0 600 120"
    className="mushaf-crown"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="mc-dome" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--mo-paper, #faf4e2)" />
        <stop offset="100%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.15" />
      </linearGradient>
      <linearGradient id="mc-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.15" />
        <stop offset="50%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="1" />
        <stop offset="100%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.15" />
      </linearGradient>
    </defs>

    {/* Baseline: double gilded rule stretched across full width */}
    <line x1="10"  y1="100" x2="590" y2="100" stroke="url(#mc-line)" strokeWidth="1.4" />
    <line x1="18"  y1="104" x2="582" y2="104" stroke="url(#mc-line)" strokeWidth="0.7" />

    {/* Central dome */}
    <path
      d="M300 20
         C 250 20, 220 55, 220 90
         L 220 100
         L 380 100
         L 380 90
         C 380 55, 350 20, 300 20 Z"
      fill="url(#mc-dome)"
      stroke="var(--mo-gold, #b8944a)"
      strokeWidth="1.5"
    />
    {/* Inner dome outline */}
    <path
      d="M300 30
         C 258 30, 232 60, 232 90
         L 232 98
         L 368 98
         L 368 90
         C 368 60, 342 30, 300 30 Z"
      fill="none"
      stroke="var(--mo-ink, #2b3a55)"
      strokeWidth="0.9"
      opacity="0.5"
    />
    {/* Central rosette */}
    <g transform="translate(300 68)">
      {[0, 45, 90, 135].map((r) => (
        <ellipse key={r} cx="0" cy="0" rx="3" ry="12"
          fill="var(--mo-gold, #b8944a)" opacity="0.55"
          transform={`rotate(${r})`} />
      ))}
      <circle r="4" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1.2" />
      <circle r="1.6" fill="var(--mo-ink, #2b3a55)" />
    </g>
    {/* Trefoil crest on dome */}
    <g transform="translate(300 20)">
      <path d="M0 0 L -4 -10 Q 0 -16 4 -10 Z" fill="var(--mo-gold, #b8944a)" />
      <circle cy="-14" r="2.2" fill="var(--mo-gold, #b8944a)" />
      <circle cy="-2" r="1.6" fill="var(--mo-ink, #2b3a55)" opacity="0.6" />
    </g>

    {/* Symmetric side wings — cypress silhouettes flanking the dome */}
    {[
      { x: 220, dir: -1 },
      { x: 380, dir: 1 },
    ].map(({ x, dir }) => (
      <g key={x}>
        <path
          d={`M${x} 100
              C ${x + dir * 30} 92, ${x + dir * 60} 82, ${x + dir * 90} 90
              C ${x + dir * 120} 96, ${x + dir * 150} 100, ${x + dir * 180} 100`}
          fill="none"
          stroke="var(--mo-gold, #b8944a)"
          strokeWidth="1.2"
        />
        {[40, 90, 140].map((d) => (
          <g key={d}>
            <circle cx={x + dir * d} cy={92 + Math.abs(d - 90) * 0.05} r="2.5"
              fill="var(--mo-paper, #faf4e2)"
              stroke="var(--mo-gold, #b8944a)" strokeWidth="0.9" />
            <circle cx={x + dir * d} cy={92 + Math.abs(d - 90) * 0.05} r="0.9"
              fill="var(--mo-gold, #b8944a)" />
          </g>
        ))}
      </g>
    ))}

    {/* End caps: large rosettes anchor the crown to the frame corners */}
    {[20, 580].map((x) => (
      <g key={x}>
        <circle cx={x} cy="100" r="7" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1.4" />
        <circle cx={x} cy="100" r="3.4" fill="var(--mo-gold, #b8944a)" opacity="0.6" />
        <circle cx={x} cy="100" r="1.4" fill="var(--mo-ink, #2b3a55)" />
      </g>
    ))}
  </svg>
);

/* Bottom ornament: mirror-image of the crown baseline for symmetry. */
export const MushafFooter: React.FC = () => (
  <svg viewBox="0 0 600 40" className="mushaf-footer-orn" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <defs>
      <linearGradient id="mf-line" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%"  stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.15" />
        <stop offset="50%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="1" />
        <stop offset="100%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.15" />
      </linearGradient>
    </defs>
    <line x1="10"  y1="12" x2="590" y2="12" stroke="url(#mf-line)" strokeWidth="1.4" />
    <line x1="18"  y1="16" x2="582" y2="16" stroke="url(#mf-line)" strokeWidth="0.7" />
    {/* Central lotus */}
    <g transform="translate(300 12)">
      <path d="M-20 0 Q -10 16, 0 6 Q 10 16, 20 0" fill="var(--mo-paper, #faf4e2)"
        stroke="var(--mo-gold, #b8944a)" strokeWidth="1.1" />
      <circle cy="6" r="2" fill="var(--mo-gold, #b8944a)" />
    </g>
    {/* End rosettes match the crown */}
    {[20, 580].map((x) => (
      <g key={x}>
        <circle cx={x} cy="12" r="6" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1.3" />
        <circle cx={x} cy="12" r="2.6" fill="var(--mo-gold, #b8944a)" opacity="0.6" />
        <circle cx={x} cy="12" r="1.1" fill="var(--mo-ink, #2b3a55)" />
      </g>
    ))}
  </svg>
);

export const MushafOrnateBorder: React.FC<{ children: React.ReactNode; nightMode?: boolean }> = ({ children, nightMode }) => {
  return (
    <div className={`mushaf-ornate ${nightMode ? 'mushaf-ornate-night' : ''}`}>
      <div className="mo-outer-border" />
      <div className="mo-side mo-side-left" aria-hidden="true"><SideRail /></div>
      <div className="mo-side mo-side-right" aria-hidden="true"><SideRail /></div>
      <div className="mo-crown-wrap" aria-hidden="true"><MushafCrown /></div>
      <div className="mo-footer-wrap" aria-hidden="true"><MushafFooter /></div>
      <div className="mo-inner">{children}</div>
    </div>
  );
};

/* Refined cartouche — engineered, symmetric, no doubled labels. */
export const SurahCartouche: React.FC<{ name: string; number: number; english?: string }> = ({ name, number, english }) => (
  <div className="mushaf-cartouche" role="heading" aria-level={2}>
    <svg viewBox="0 0 360 78" preserveAspectRatio="xMidYMid meet" className="mc-svg" aria-hidden="true">
      <defs>
        <linearGradient id="mc-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.20" />
          <stop offset="100%" stopColor="var(--mo-gold, #b8944a)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* Outer cartouche */}
      <path
        d="M28 39 Q 28 10, 70 10 L 290 10 Q 332 10, 332 39 Q 332 68, 290 68 L 70 68 Q 28 68, 28 39 Z"
        fill="url(#mc-fill)"
        stroke="var(--mo-gold, #b8944a)"
        strokeWidth="1.5"
      />
      {/* Inner outline */}
      <path
        d="M36 39 Q 36 16, 72 16 L 288 16 Q 324 16, 324 39 Q 324 62, 288 62 L 72 62 Q 36 62, 36 39 Z"
        fill="none"
        stroke="var(--mo-ink, #2b3a55)"
        strokeWidth="0.7"
        opacity="0.55"
      />
      {/* Side rosettes */}
      {[28, 332].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="39" r="7" fill="var(--mo-paper, #faf4e2)" stroke="var(--mo-gold, #b8944a)" strokeWidth="1.3" />
          <circle cx={cx} cy="39" r="3" fill="var(--mo-gold, #b8944a)" opacity="0.55" />
          <circle cx={cx} cy="39" r="1.2" fill="var(--mo-ink, #2b3a55)" />
        </g>
      ))}
      {/* Twin decorative rules under the name */}
      <line x1="90" y1="52" x2="270" y2="52" stroke="var(--mo-gold, #b8944a)" strokeWidth="0.6" opacity="0.5" />
    </svg>
    <div className="mc-text">
      <span className="mc-name">سُورَةُ {name}</span>
      {english && <span className="mc-meta">{english} · {number}</span>}
    </div>
  </div>
);

export default MushafOrnateBorder;
