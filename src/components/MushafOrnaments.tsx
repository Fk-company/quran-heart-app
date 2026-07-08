import React from 'react';

export const MushafOrnateBorder: React.FC<{ children: React.ReactNode; nightMode?: boolean }> = ({ children, nightMode }) => (
  <div className={`mushaf-ornate ${nightMode ? 'mushaf-ornate-night' : ''}`}>
    {children}
  </div>
);

export const SurahCartouche: React.FC<{ name: string; number: number; english?: string }> = ({ name, number, english }) => (
  <div className="mushaf-cartouche" role="heading" aria-level={2}>
    <span className="mc-name">سُورَةُ {name}</span>
    {english && <span className="mc-meta">{english} · {number}</span>}
  </div>
);

export default MushafOrnateBorder;
