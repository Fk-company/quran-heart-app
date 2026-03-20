import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Radio, Clock, Book, Users, Quote, Calendar, Search, Settings, X } from 'lucide-react';

const moreItems = [
  { label: 'الاذكار والتسبيح', icon: Heart, path: '/adhkar', desc: 'اذكار الصباح والمساء والتسبيح', color: 'bg-accent/10 text-accent' },
  { label: 'الراديو', icon: Radio, path: '/radio', desc: 'بث مباشر للقرآن الكريم', color: 'bg-primary/10 text-primary' },
  { label: 'قصص الأنبياء', icon: Users, path: '/prophets', desc: 'قصص الأنبياء والمرسلين', color: 'bg-accent/10 text-accent' },
  { label: 'الأحاديث النبوية', icon: Quote, path: '/hadith', desc: 'أحاديث نبوية مختارة', color: 'bg-primary/10 text-primary' },
  { label: 'البحث', icon: Search, path: '/search', desc: 'البحث في القرآن الكريم', color: 'bg-accent/10 text-accent' },
];

interface MoreSheetProps {
  open: boolean;
  onClose: () => void;
}

export const MoreSheet: React.FC<MoreSheetProps> = ({ open, onClose }) => {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <>
      <div className="sheet-overlay" onClick={onClose} />
      <div className="sheet-content" dir="rtl">
        <div className="sheet-handle" />
        <div className="px-5 pb-6 pt-2 max-h-[75vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">المزيد</h2>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="space-y-2">
            {moreItems.map((item) => (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); onClose(); }}
                className="card-surface-hover w-full flex items-center gap-3"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 text-right">
                  <div className="font-semibold text-foreground text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// Keep the full-page fallback for direct /more route
const MorePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">المزيد</h1>
        <div className="space-y-2">
          {moreItems.map((item) => (
            <button key={item.path} onClick={() => navigate(item.path)} className="card-surface-hover w-full flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 text-right">
                <div className="font-semibold text-foreground text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MorePage;
