import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  variant?: 'primary' | 'gold' | 'emerald' | 'muted';
  trend?: string;
  onClick?: () => void;
}

const variantStyles: Record<string, { bg: string; iconColor: string }> = {
  primary: { bg: 'bg-primary/10', iconColor: 'text-primary' },
  gold: { bg: 'bg-gold-light', iconColor: 'text-gold-deep' },
  emerald: { bg: 'bg-emerald-light', iconColor: 'text-primary' },
  muted: { bg: 'bg-secondary', iconColor: 'text-muted-foreground' },
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, value, label, variant = 'primary', trend, onClick }) => {
  const style = variantStyles[variant];
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`stat-card text-right ${onClick ? 'cursor-pointer' : 'cursor-default'} w-full`}
    >
      <div className={`stat-card-icon ${style.bg}`}>
        <Icon className={`w-4.5 h-4.5 ${style.iconColor}`} style={{ width: 18, height: 18 }} />
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
      {trend && <div className="text-[10px] text-primary font-semibold mt-1">{trend}</div>}
    </button>
  );
};

export default StatCard;
