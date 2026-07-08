import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  variant?: 'primary' | 'gold' | 'emerald' | 'muted';
  trend?: string;
  trendDirection?: 'up' | 'down' | 'flat';
  onClick?: () => void;
  hint?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'icon-tile',
  gold: 'icon-tile icon-tile-gold',
  emerald: 'icon-tile icon-tile-emerald',
  muted: 'icon-tile',
};

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  variant = 'primary',
  trend,
  trendDirection,
  onClick,
  hint,
}) => {
  const TrendIcon = trendDirection === 'down' ? TrendingDown : TrendingUp;
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      title={hint}
      className={`stat-card text-right ${onClick ? 'cursor-pointer' : 'cursor-default'} w-full relative overflow-hidden`}
    >
      <div className={`${variantStyles[variant]} !w-9 !h-9 !rounded-xl mb-2`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && (
        <div
          className={`inline-flex items-center gap-1 text-[10px] font-bold mt-1.5 ${
            trendDirection === 'down' ? 'text-destructive' : 'text-primary'
          }`}
        >
          {trendDirection && trendDirection !== 'flat' && <TrendIcon className="w-3 h-3" />}
          {trend}
        </div>
      )}
    </button>
  );
};

export default StatCard;
