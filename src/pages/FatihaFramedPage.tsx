import React from 'react';
import SEO from '@/components/SEO';

/**
 * Al-Fatiha displayed inside a real ornamental SVG frame.
 * The frame is a full-page inline SVG positioned as an overlay behind the text.
 */

const FRAME_GOLD = '#C9A84C';
const FRAME_GOLD_DARK = '#8B6914';
const FRAME_GOLD_LIGHT = '#F0D080';
const PARCHMENT = '#FDF3E3';

const OrnamentalFrame: React.FC = () => (
  <svg
    viewBox="0 0 800 1100"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
    className="qff-frame-svg"
    aria-hidden="true"
  >
    <defs>
      <linearGradient id="qff-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={FRAME_GOLD} />
        <stop offset="50%" stopColor={FRAME_GOLD_LIGHT} />
        <stop offset="100%" stopColor={FRAME_GOLD_DARK} />
      </linearGradient>
      <linearGradient id="qff-gold-h" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={FRAME_GOLD_DARK} />
        <stop offset="50%" stopColor={FRAME_GOLD_LIGHT} />
        <stop offset="100%" stopColor={FRAME_GOLD_DARK} />
      </linearGradient>
      <radialGradient id="qff-medal" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor={FRAME_GOLD_LIGHT} />
        <stop offset="70%" stopColor={FRAME_GOLD} />
        <stop offset="100%" stopColor={FRAME_GOLD_DARK} />
      </radialGradient>

      {/* Corner ornament used 4x via <use> with rotation */}
      <g id="qff-corner">
        {/* outer L shape */}
        <path
          d="M10 10 L 160 10 L 160 22 L 22 22 L 22 160 L 10 160 Z"
          fill="url(#qff-gold)"
          stroke={FRAME_GOLD_DARK}
          strokeWidth="0.8"
        />
        {/* inner filigree fan */}
        <path
          d="M28 28 L 150 28 Q 150 40 138 40 L 40 40 Q 28 40 28 52 Z"
          fill={FRAME_GOLD}
          opacity="0.6"
        />
        {/* radiating petals */}
        {[15, 30, 45, 60, 75].map((a) => {
          const rad = (a * Math.PI) / 180;
          const x1 = 32 + Math.cos(rad) * 12;
          const y1 = 32 + Math.sin(rad) * 12;
          const x2 = 32 + Math.cos(rad) * 96;
          const y2 = 32 + Math.sin(rad) * 96;
          const xm = 32 + Math.cos(rad) * 54;
          const ym = 32 + Math.sin(rad) * 54;
          const perp = a + 90;
          const pr = (perp * Math.PI) / 180;
          const wx = Math.cos(pr) * 5;
          const wy = Math.sin(pr) * 5;
          return (
            <path
              key={a}
              d={`M${x1} ${y1} Q ${xm + wx} ${ym + wy} ${x2} ${y2} Q ${xm - wx} ${ym - wy} ${x1} ${y1} Z`}
              fill={FRAME_GOLD_LIGHT}
              stroke={FRAME_GOLD_DARK}
              strokeWidth="0.5"
              opacity="0.85"
            />
          );
        })}
        {/* concentric arcs */}
        {[70, 90, 110].map((r, i) => (
          <path
            key={r}
            d={`M${32 + r} 32 A ${r} ${r} 0 0 1 32 ${32 + r}`}
            fill="none"
            stroke={FRAME_GOLD_DARK}
            strokeWidth={i === 1 ? 1.2 : 0.6}
            opacity="0.7"
          />
        ))}
        {/* corner rosette */}
        <g transform="translate(32 32)">
          <circle r="12" fill="url(#qff-medal)" stroke={FRAME_GOLD_DARK} strokeWidth="1" />
          {[0, 45, 90, 135].map((a) => (
            <ellipse key={a} rx="1.6" ry="9" fill={FRAME_GOLD_DARK} opacity="0.6" transform={`rotate(${a})`} />
          ))}
          <circle r="4" fill={FRAME_GOLD_LIGHT} stroke={FRAME_GOLD_DARK} strokeWidth="0.5" />
          <circle r="1.5" fill={FRAME_GOLD_DARK} />
        </g>
      </g>

      {/* Repeatable horizontal ornament segment (100 wide) */}
      <g id="qff-hband">
        <path
          d="M0 0 Q 25 -8 50 0 Q 75 8 100 0"
          fill="none"
          stroke={FRAME_GOLD_DARK}
          strokeWidth="1"
        />
        <circle cx="50" cy="0" r="3" fill="url(#qff-medal)" stroke={FRAME_GOLD_DARK} strokeWidth="0.5" />
        <circle cx="0" cy="0" r="1.6" fill={FRAME_GOLD} />
        <circle cx="100" cy="0" r="1.6" fill={FRAME_GOLD} />
      </g>

      {/* Repeatable vertical ornament segment (100 tall) */}
      <g id="qff-vband">
        <path
          d="M0 0 Q -8 25 0 50 Q 8 75 0 100"
          fill="none"
          stroke={FRAME_GOLD_DARK}
          strokeWidth="1"
        />
        <circle cx="0" cy="50" r="3" fill="url(#qff-medal)" stroke={FRAME_GOLD_DARK} strokeWidth="0.5" />
        <circle cx="0" cy="0" r="1.6" fill={FRAME_GOLD} />
        <circle cx="0" cy="100" r="1.6" fill={FRAME_GOLD} />
      </g>
    </defs>

    {/* Outer double gold border */}
    <rect x="14" y="14" width="772" height="1072" fill="none" stroke={FRAME_GOLD_DARK} strokeWidth="2" />
    <rect x="22" y="22" width="756" height="1056" fill="none" stroke={FRAME_GOLD} strokeWidth="4" />
    <rect x="30" y="30" width="740" height="1040" fill="none" stroke={FRAME_GOLD_DARK} strokeWidth="1" />
    {/* Innermost hairline */}
    <rect x="52" y="52" width="696" height="996" fill="none" stroke={FRAME_GOLD_DARK} strokeWidth="0.8" opacity="0.7" />

    {/* Top horizontal ornament band */}
    <g transform="translate(180 40)">
      {Array.from({ length: 4 }).map((_, i) => (
        <use key={i} href="#qff-hband" x={i * 110} />
      ))}
    </g>
    {/* Bottom horizontal ornament band */}
    <g transform="translate(180 1060)">
      {Array.from({ length: 4 }).map((_, i) => (
        <use key={i} href="#qff-hband" x={i * 110} />
      ))}
    </g>
    {/* Left vertical ornament */}
    <g transform="translate(40 180)">
      {Array.from({ length: 7 }).map((_, i) => (
        <use key={i} href="#qff-vband" y={i * 110} />
      ))}
    </g>
    {/* Right vertical ornament */}
    <g transform="translate(760 180)">
      {Array.from({ length: 7 }).map((_, i) => (
        <use key={i} href="#qff-vband" y={i * 110} />
      ))}
    </g>

    {/* 4 corner ornaments */}
    <use href="#qff-corner" x="0" y="0" />
    <use href="#qff-corner" x="800" y="0" transform="scale(-1 1) translate(-800 0)" />
    <use href="#qff-corner" x="0" y="1100" transform="scale(1 -1) translate(0 -1100)" />
    <use href="#qff-corner" x="800" y="1100" transform="scale(-1 -1) translate(-800 -1100)" />

    {/* Center top medallion arch */}
    <g transform="translate(400 78)">
      <path
        d="M-90 0 Q -90 -40 -50 -50 L 50 -50 Q 90 -40 90 0"
        fill="none"
        stroke={FRAME_GOLD_DARK}
        strokeWidth="1.2"
      />
      <circle r="14" fill="url(#qff-medal)" stroke={FRAME_GOLD_DARK} strokeWidth="1.2" />
      {[0, 45, 90, 135].map((a) => (
        <ellipse key={a} rx="2" ry="10" fill={FRAME_GOLD_DARK} opacity="0.55" transform={`rotate(${a})`} />
      ))}
      <circle r="5" fill={FRAME_GOLD_LIGHT} stroke={FRAME_GOLD_DARK} strokeWidth="0.6" />
      <circle r="1.8" fill={FRAME_GOLD_DARK} />
    </g>
    {/* Center bottom medallion */}
    <g transform="translate(400 1022)">
      <circle r="12" fill="url(#qff-medal)" stroke={FRAME_GOLD_DARK} strokeWidth="1.1" />
      <circle r="4" fill={FRAME_GOLD_LIGHT} stroke={FRAME_GOLD_DARK} strokeWidth="0.5" />
      <circle r="1.5" fill={FRAME_GOLD_DARK} />
    </g>
  </svg>
);

/* Al-Fatiha verses in Uthmani script */
const FATIHA_VERSES = [
  { num: '١', text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ' },
  { num: '٢', text: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' },
  { num: '٣', text: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ' },
  { num: '٤', text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
  { num: '٥', text: 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ' },
  { num: '٦', text: 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ' },
  { num: '٧', text: 'غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ' },
];

const FatihaFramedPage: React.FC = () => {
  return (
    <>
      <SEO
        title="سورة الفاتحة — إطار مزخرف | قلب القرآن"
        description="عرض سورة الفاتحة داخل إطار زخرفي إسلامي ذهبي كلاسيكي، بخط شهرزاد."
      />
      <div className="qff-page-wrap" dir="rtl">
        <div className="qff-page">
          {/* Frame image layer */}
          <div className="qff-frame">
            <OrnamentalFrame />
          </div>

          {/* Text content layer */}
          <div className="qff-content">
            <div className="qff-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>

            <div className="qff-title-wrap">
              <div className="qff-title-line" />
              <h1 className="qff-title">سُورَةُ ٱلْفَاتِحَةِ</h1>
              <div className="qff-title-line" />
            </div>

            <div className="qff-verses">
              {FATIHA_VERSES.map((v) => (
                <p key={v.num} className="qff-verse">
                  <span className="qff-verse-text">{v.text}</span>
                  <span className="qff-verse-num" aria-label={`آية ${v.num}`}>
                    <svg viewBox="0 0 40 40" aria-hidden="true">
                      <defs>
                        <radialGradient id={`vn-${v.num}`} cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#F0D080" />
                          <stop offset="70%" stopColor="#C9A84C" />
                          <stop offset="100%" stopColor="#8B6914" />
                        </radialGradient>
                      </defs>
                      <circle cx="20" cy="20" r="18" fill={`url(#vn-${v.num})`} stroke="#8B6914" strokeWidth="1" />
                      <circle cx="20" cy="20" r="14" fill="none" stroke="#FDF3E3" strokeWidth="0.7" opacity="0.8" />
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                        <circle
                          key={a}
                          cx={20 + Math.cos((a * Math.PI) / 180) * 16}
                          cy={20 + Math.sin((a * Math.PI) / 180) * 16}
                          r="1"
                          fill="#8B6914"
                        />
                      ))}
                    </svg>
                    <span className="qff-verse-num-text">{v.num}</span>
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap');

        .qff-page-wrap {
          min-height: 100vh;
          background: linear-gradient(180deg, #2a1d10 0%, #1a1208 100%);
          padding: 24px 12px 96px;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }
        .qff-page {
          position: relative;
          width: 100%;
          max-width: 720px;
          aspect-ratio: 800 / 1100;
          background: ${PARCHMENT};
          background-image:
            radial-gradient(rgba(139, 105, 20, 0.06) 1px, transparent 1px),
            radial-gradient(rgba(139, 105, 20, 0.04) 1px, transparent 1px);
          background-size: 6px 6px, 11px 11px;
          background-position: 0 0, 3px 4px;
          border-radius: 6px;
          box-shadow:
            0 30px 80px -20px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(139, 105, 20, 0.4);
          overflow: hidden;
        }
        .qff-frame {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }
        .qff-frame-svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .qff-content {
          position: absolute;
          top: 9%;
          bottom: 9%;
          left: 10%;
          right: 10%;
          z-index: 2;
          display: flex;
          flex-direction: column;
          font-family: 'Scheherazade New', serif;
          color: #1A1A1A;
          overflow: hidden;
        }
        .qff-bismillah {
          text-align: center;
          font-family: 'Scheherazade New', serif;
          font-weight: 700;
          font-size: clamp(20px, 3.4vw, 30px);
          color: #8B6914;
          padding: 8px 0 14px;
          border-bottom: 1px solid rgba(139, 105, 20, 0.35);
          margin-bottom: 14px;
          letter-spacing: 0.5px;
        }
        .qff-title-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .qff-title-line {
          flex: 1;
          height: 2px;
          background: linear-gradient(90deg,
            transparent 0%,
            #8B6914 20%,
            #C9A84C 50%,
            #8B6914 80%,
            transparent 100%);
        }
        .qff-title {
          font-family: 'Scheherazade New', serif;
          font-weight: 700;
          font-size: clamp(24px, 4.2vw, 36px);
          color: #8B6914;
          margin: 0;
          padding: 4px 16px;
          background: linear-gradient(180deg,
            rgba(201, 168, 76, 0.12),
            rgba(201, 168, 76, 0.02));
          border: 1px solid rgba(139, 105, 20, 0.6);
          border-radius: 4px;
          white-space: nowrap;
        }
        .qff-verses {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-evenly;
          gap: 4px;
          overflow: hidden;
        }
        .qff-verse {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          margin: 0;
          font-family: 'Scheherazade New', serif;
          font-size: clamp(20px, 3.2vw, 28px);
          line-height: 2.5;
          color: #1A1A1A;
          text-align: right;
        }
        .qff-verse-text {
          flex: 1;
          font-weight: 400;
        }
        .qff-verse-num {
          position: relative;
          flex-shrink: 0;
          width: clamp(28px, 4.2vw, 40px);
          height: clamp(28px, 4.2vw, 40px);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .qff-verse-num svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .qff-verse-num-text {
          position: relative;
          font-family: 'Scheherazade New', serif;
          font-weight: 700;
          font-size: clamp(13px, 1.9vw, 16px);
          color: #FDF3E3;
          text-shadow: 0 1px 0 #8B6914;
          z-index: 1;
        }

        @media (max-width: 560px) {
          .qff-page-wrap { padding: 12px 8px 80px; }
          .qff-content { top: 8%; bottom: 8%; left: 9%; right: 9%; }
          .qff-verse { gap: 6px; line-height: 2.3; }
        }
      `}</style>
    </>
  );
};

export default FatihaFramedPage;
