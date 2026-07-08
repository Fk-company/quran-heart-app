import React from 'react';

/**
 * Premium Ottoman/Mamluk-style Mushaf ornaments.
 * Palette:
 *   --mo-gold: #C9A84C  (primary gold)
 *   --mo-gold-2: #D4AF37 (bright gold)
 *   --mo-gold-3: #F0D080 (highlight)
 *   --mo-purple: #4A3560 (deep purple)
 *   --mo-purple-2: #2A1D3A (shadow purple)
 *   --mo-paper: #FDF8EE  (cream / ivory)
 *   --mo-silver: #A8A9AD
 *   --mo-ink: #1A1A1A
 */

/* ------- Reusable defs (gradients + patterns) ------- */
const OrnamentDefs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#C9A84C" />
      <stop offset="45%" stopColor="#F0D080" />
      <stop offset="100%" stopColor="#C9A84C" />
    </linearGradient>
    <linearGradient id={`${id}-goldSoft`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#F0D080" stopOpacity="0.9" />
      <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.5" />
    </linearGradient>
    <radialGradient id={`${id}-medal`} cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#F0D080" />
      <stop offset="70%" stopColor="#C9A84C" />
      <stop offset="100%" stopColor="#8B7328" />
    </radialGradient>
    <linearGradient id={`${id}-purple`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stopColor="#4A3560" />
      <stop offset="100%" stopColor="#2A1D3A" />
    </linearGradient>
  </defs>
);

/* Corner medallion — quarter-fan of gold filigree on purple. */
export const CornerMedallion: React.FC<{ rotate?: number }> = ({ rotate = 0 }) => (
  <svg viewBox="0 0 120 120" className="mo-corner-svg" preserveAspectRatio="xMidYMid meet" aria-hidden="true"
    style={{ transform: `rotate(${rotate}deg)` }}>
    <OrnamentDefs id={`cm${rotate}`} />
    {/* purple backing fan */}
    <path d="M0 0 L120 0 A120 120 0 0 0 0 120 Z" fill={`url(#cm${rotate}-purple)`} opacity="0.92" />
    {/* concentric gold arcs */}
    {[110, 92, 74, 56].map((r, i) => (
      <path key={r} d={`M${r} 0 A ${r} ${r} 0 0 0 0 ${r}`} fill="none"
        stroke={`url(#cm${rotate}-gold)`} strokeWidth={i === 0 ? 2 : 1} opacity={0.85 - i * 0.1} />
    ))}
    {/* radiating petals */}
    {[10, 25, 40, 55, 70, 80].map((a) => {
      const rad = (a * Math.PI) / 180;
      const x1 = Math.cos(rad) * 20, y1 = Math.sin(rad) * 20;
      const x2 = Math.cos(rad) * 96, y2 = Math.sin(rad) * 96;
      const xm = Math.cos(rad) * 58, ym = Math.sin(rad) * 58;
      const perp = a + 90;
      const pr = (perp * Math.PI) / 180;
      const wx = Math.cos(pr) * 6, wy = Math.sin(pr) * 6;
      return (
        <path key={a}
          d={`M${x1} ${y1} Q ${xm + wx} ${ym + wy} ${x2} ${y2} Q ${xm - wx} ${ym - wy} ${x1} ${y1} Z`}
          fill={`url(#cm${rotate}-goldSoft)`} stroke="#C9A84C" strokeWidth="0.5" opacity="0.9" />
      );
    })}
    {/* central rosette at corner tip */}
    <g>
      <circle cx="8" cy="8" r="10" fill={`url(#cm${rotate}-medal)`} stroke="#8B7328" strokeWidth="0.8" />
      <circle cx="8" cy="8" r="4.5" fill="#4A3560" />
      <circle cx="8" cy="8" r="1.6" fill="#F0D080" />
    </g>
    {/* diamond studs on arcs */}
    {[20, 45, 70].map((a) => {
      const rad = (a * Math.PI) / 180;
      const cx = Math.cos(rad) * 110, cy = Math.sin(rad) * 110;
      return <path key={a} d={`M${cx} ${cy - 3} L${cx + 3} ${cy} L${cx} ${cy + 3} L${cx - 3} ${cy} Z`} fill="#F0D080" stroke="#8B7328" strokeWidth="0.4" />;
    })}
  </svg>
);

/* Vertical side arabesque — alternating lotus flowers and leaves on purple. */
const SideRail: React.FC = () => (
  <svg viewBox="0 0 30 400" preserveAspectRatio="none" className="mo-vine" aria-hidden="true">
    <OrnamentDefs id="sr" />
    {/* purple band background */}
    <rect x="0" y="0" width="30" height="400" fill="url(#sr-purple)" />
    {/* gold rules */}
    <line x1="2" y1="0" x2="2" y2="400" stroke="#C9A84C" strokeWidth="0.6" opacity="0.7" />
    <line x1="28" y1="0" x2="28" y2="400" stroke="#C9A84C" strokeWidth="0.6" opacity="0.7" />
    {/* central meander */}
    <path d="M15 0 Q 6 40 15 80 Q 24 120 15 160 Q 6 200 15 240 Q 24 280 15 320 Q 6 360 15 400"
      fill="none" stroke="url(#sr-gold)" strokeWidth="1.2" opacity="0.9" />
    {/* alternating flower + leaf motifs */}
    {[40, 80, 120, 160, 200, 240, 280, 320, 360].map((y, i) => (
      <g key={y}>
        {i % 2 === 0 ? (
          // lotus flower
          <g transform={`translate(15 ${y})`}>
            <circle r="5" fill="url(#sr-medal)" stroke="#8B7328" strokeWidth="0.6" />
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-5" rx="1.6" ry="3.5" fill="#F0D080" opacity="0.85"
                transform={`rotate(${r})`} />
            ))}
            <circle r="1.4" fill="#4A3560" />
          </g>
        ) : (
          // leaf pair
          <g transform={`translate(15 ${y})`}>
            <path d="M0 -6 Q -6 0 0 6 Q 6 0 0 -6 Z" fill="url(#sr-goldSoft)" stroke="#C9A84C" strokeWidth="0.6" />
            <line x1="0" y1="-5" x2="0" y2="5" stroke="#8B7328" strokeWidth="0.4" />
          </g>
        )}
      </g>
    ))}
    {/* quarter medallions every ~100 */}
    {[100, 200, 300].map((y) => (
      <g key={y} transform={`translate(15 ${y})`}>
        <circle r="9" fill="none" stroke="#F0D080" strokeWidth="0.6" opacity="0.6" />
        <circle r="12" fill="none" stroke="#C9A84C" strokeWidth="0.4" opacity="0.4" />
      </g>
    ))}
  </svg>
);

/* Elaborate crown — dome, hanging pendants, arch framing. */
export const MushafCrown: React.FC = () => (
  <svg viewBox="0 0 800 180" className="mushaf-crown" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <OrnamentDefs id="cr" />
    {/* baseline double rule */}
    <line x1="30" y1="150" x2="770" y2="150" stroke="url(#cr-gold)" strokeWidth="1.8" />
    <line x1="40" y1="156" x2="760" y2="156" stroke="url(#cr-gold)" strokeWidth="0.8" opacity="0.7" />

    {/* arch that frames the Bismillah / Surah name */}
    <path d="M120 150 L120 90 Q 120 30 400 30 Q 680 30 680 90 L 680 150"
      fill="none" stroke="url(#cr-gold)" strokeWidth="1.5" />
    <path d="M140 150 L140 96 Q 140 46 400 46 Q 660 46 660 96 L 660 150"
      fill="none" stroke="#4A3560" strokeWidth="0.8" opacity="0.55" />

    {/* Central dome/lotus medallion */}
    <g transform="translate(400 30)">
      <circle r="26" fill="url(#cr-medal)" stroke="#8B7328" strokeWidth="1.2" />
      <circle r="20" fill="none" stroke="#4A3560" strokeWidth="0.9" opacity="0.7" />
      {[0, 45, 90, 135].map((a) => (
        <ellipse key={a} rx="3" ry="18" fill="#4A3560" opacity="0.5" transform={`rotate(${a})`} />
      ))}
      <circle r="8" fill="#F0D080" stroke="#8B7328" strokeWidth="0.6" />
      <circle r="3" fill="#4A3560" />
      {/* finial trefoil */}
      <path transform="translate(0 -26)" d="M0 0 L-6 -14 Q 0 -22 6 -14 Z" fill="url(#cr-gold)" stroke="#8B7328" strokeWidth="0.6" />
      <circle cy="-30" r="3" fill="url(#cr-medal)" stroke="#8B7328" strokeWidth="0.6" />
    </g>

    {/* Hanging pendants on both sides of the arch */}
    {[
      { x: 220, dir: -1 },
      { x: 580, dir: 1 },
    ].map(({ x, dir }) => (
      <g key={x}>
        {/* chain */}
        <line x1={x} y1="46" x2={x} y2="82" stroke="url(#cr-gold)" strokeWidth="1" />
        {[52, 62, 72].map((y) => (
          <circle key={y} cx={x} cy={y} r="1.6" fill="#C9A84C" />
        ))}
        {/* teardrop pendant */}
        <path d={`M${x} 82 Q ${x - 10} 96 ${x} 116 Q ${x + 10} 96 ${x} 82 Z`}
          fill="url(#cr-goldSoft)" stroke="#8B7328" strokeWidth="0.8" />
        <circle cx={x} cy="100" r="3.5" fill="#4A3560" />
        <circle cx={x} cy="100" r="1.4" fill="#F0D080" />
        {/* subtle sway curl */}
        <path d={`M${x} 116 q ${dir * 8} 6 0 12`} fill="none" stroke="#C9A84C" strokeWidth="0.7" opacity="0.8" />
      </g>
    ))}

    {/* Symmetric flanking vines under the arch */}
    {[
      { fromX: 140, toX: 210, dir: 1 },
      { fromX: 660, toX: 590, dir: -1 },
    ].map(({ fromX, toX, dir }, idx) => (
      <g key={idx}>
        <path d={`M${fromX} 130 Q ${(fromX + toX) / 2} 108 ${toX} 130`} fill="none" stroke="url(#cr-gold)" strokeWidth="1.1" />
        {[0.25, 0.5, 0.75].map((t) => {
          const cx = fromX + (toX - fromX) * t;
          const cy = 130 - 18 * Math.sin(Math.PI * t);
          return (
            <g key={t} transform={`translate(${cx} ${cy})`}>
              <circle r="2.2" fill="#F0D080" stroke="#8B7328" strokeWidth="0.4" />
              <path d={`M0 0 q ${dir * 4} -4 8 -2`} fill="none" stroke="#C9A84C" strokeWidth="0.5" />
            </g>
          );
        })}
      </g>
    ))}

    {/* End rosettes at frame corners */}
    {[30, 770].map((x) => (
      <g key={x}>
        <circle cx={x} cy="150" r="10" fill="url(#cr-medal)" stroke="#8B7328" strokeWidth="1" />
        <circle cx={x} cy="150" r="5" fill="#4A3560" />
        <circle cx={x} cy="150" r="1.8" fill="#F0D080" />
      </g>
    ))}
  </svg>
);

/* Bottom ornament — mirrored crown with page-number cartouche placeholder. */
export const MushafFooter: React.FC = () => (
  <svg viewBox="0 0 800 90" className="mushaf-footer-orn" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
    <OrnamentDefs id="fo" />
    <line x1="30" y1="30" x2="770" y2="30" stroke="url(#fo-gold)" strokeWidth="1.6" />
    <line x1="40" y1="36" x2="760" y2="36" stroke="url(#fo-gold)" strokeWidth="0.8" opacity="0.7" />

    {/* central page-number oval */}
    <g transform="translate(400 55)">
      <ellipse rx="46" ry="20" fill="url(#fo-goldSoft)" stroke="#8B7328" strokeWidth="1.2" />
      <ellipse rx="40" ry="15" fill="none" stroke="#4A3560" strokeWidth="0.7" opacity="0.65" />
      {[-46, 46].map((x) => (
        <g key={x}>
          <circle cx={x} r="5" fill="url(#fo-medal)" stroke="#8B7328" strokeWidth="0.6" />
          <circle cx={x} r="2" fill="#4A3560" />
        </g>
      ))}
    </g>

    {/* hanging teardrops */}
    {[280, 520].map((x) => (
      <g key={x}>
        <line x1={x} y1="30" x2={x} y2="46" stroke="#C9A84C" strokeWidth="0.9" />
        <path d={`M${x} 46 Q ${x - 6} 56 ${x} 68 Q ${x + 6} 56 ${x} 46 Z`}
          fill="url(#fo-goldSoft)" stroke="#8B7328" strokeWidth="0.7" />
        <circle cx={x} cy="56" r="1.8" fill="#4A3560" />
      </g>
    ))}

    {/* end rosettes */}
    {[30, 770].map((x) => (
      <g key={x}>
        <circle cx={x} cy="30" r="8" fill="url(#fo-medal)" stroke="#8B7328" strokeWidth="0.9" />
        <circle cx={x} cy="30" r="3.6" fill="#4A3560" />
        <circle cx={x} cy="30" r="1.4" fill="#F0D080" />
      </g>
    ))}
  </svg>
);

/* Main frame wrapper */
export const MushafOrnateBorder: React.FC<{ children: React.ReactNode; nightMode?: boolean }> = ({ children, nightMode }) => {
  return (
    <div className={`mushaf-ornate ${nightMode ? 'mushaf-ornate-night' : ''}`}>
      {/* Triple border layers */}
      <div className="mo-border-outer" aria-hidden="true" />
      <div className="mo-border-middle" aria-hidden="true" />
      <div className="mo-border-inner" aria-hidden="true" />

      {/* Corner ornaments */}
      <div className="mo-corner mo-corner-tl"><CornerMedallion rotate={0} /></div>
      <div className="mo-corner mo-corner-tr"><CornerMedallion rotate={90} /></div>
      <div className="mo-corner mo-corner-br"><CornerMedallion rotate={180} /></div>
      <div className="mo-corner mo-corner-bl"><CornerMedallion rotate={270} /></div>

      {/* Side rails */}
      <div className="mo-side mo-side-left" aria-hidden="true"><SideRail /></div>
      <div className="mo-side mo-side-right" aria-hidden="true"><SideRail /></div>

      {/* Top crown */}
      <div className="mo-crown-wrap" aria-hidden="true"><MushafCrown /></div>

      {/* Bottom footer */}
      <div className="mo-footer-wrap" aria-hidden="true"><MushafFooter /></div>

      {/* Content */}
      <div className="mo-inner">{children}</div>
    </div>
  );
};

/* Ornate surah cartouche */
export const SurahCartouche: React.FC<{ name: string; number: number; english?: string }> = ({ name, number, english }) => (
  <div className="mushaf-cartouche" role="heading" aria-level={2}>
    <svg viewBox="0 0 420 96" preserveAspectRatio="xMidYMid meet" className="mc-svg" aria-hidden="true">
      <OrnamentDefs id="ct" />
      {/* purple backing */}
      <path
        d="M40 48 Q 40 12, 90 12 L 330 12 Q 380 12, 380 48 Q 380 84, 330 84 L 90 84 Q 40 84, 40 48 Z"
        fill="url(#ct-purple)"
      />
      {/* gold outer band */}
      <path
        d="M40 48 Q 40 12, 90 12 L 330 12 Q 380 12, 380 48 Q 380 84, 330 84 L 90 84 Q 40 84, 40 48 Z"
        fill="none" stroke="url(#ct-gold)" strokeWidth="2"
      />
      {/* gold inner rule */}
      <path
        d="M48 48 Q 48 20, 92 20 L 328 20 Q 372 20, 372 48 Q 372 76, 328 76 L 92 76 Q 48 76, 48 48 Z"
        fill="none" stroke="#F0D080" strokeWidth="0.7" opacity="0.75"
      />
      {/* side rosettes */}
      {[40, 380].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="48" r="12" fill="url(#ct-medal)" stroke="#8B7328" strokeWidth="1" />
          <circle cx={cx} cy="48" r="6" fill="#4A3560" />
          <circle cx={cx} cy="48" r="2" fill="#F0D080" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx={cx} cy="48" rx="1.2" ry="9" fill="#F0D080" opacity="0.55"
              transform={`rotate(${a} ${cx} 48)`} />
          ))}
        </g>
      ))}
      {/* diamond studs above/below */}
      {[130, 210, 290].map((x) => (
        <g key={x}>
          <path d={`M${x} 8 L${x + 3} 12 L${x} 16 L${x - 3} 12 Z`} fill="#F0D080" stroke="#8B7328" strokeWidth="0.3" />
          <path d={`M${x} 80 L${x + 3} 84 L${x} 88 L${x - 3} 84 Z`} fill="#F0D080" stroke="#8B7328" strokeWidth="0.3" />
        </g>
      ))}
    </svg>
    <div className="mc-text">
      <span className="mc-name">سُورَةُ {name}</span>
      {english && <span className="mc-meta">{english} · {number}</span>}
    </div>
  </div>
);

export default MushafOrnateBorder;
