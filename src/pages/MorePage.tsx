import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Radio, Clock } from 'lucide-react';

const moreItems = [
  { label: 'الاذكار والتسبيح', icon: Heart, path: '/adhkar', desc: 'اذكار الصباح والمساء والتسبيح' },
  { label: 'الراديو', icon: Radio, path: '/radio', desc: 'بث مباشر للقرآن الكريم' },
  { label: 'مواقيت الصلاة', icon: Clock, path: '/', desc: 'مواقيت الصلاة حسب موقعك' },
];

const MorePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="page-container" dir="rtl">
      <div className="px-4 pt-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-foreground mb-4">المزيد</h1>

        <div className="space-y-3">
          {moreItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="card-surface w-full flex items-center gap-3"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
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
