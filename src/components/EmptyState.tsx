import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  variant?: 'default' | 'compact';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
}) => (
  <div className={`empty-state animate-fade-in ${variant === 'compact' ? '!py-6' : ''}`}>
    <div className="relative mx-auto mb-4 float-slow" style={{ width: variant === 'compact' ? 64 : 80 }}>
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-60"
        style={{ background: 'radial-gradient(circle, hsl(var(--accent) / 0.4), transparent 70%)' }}
      />
      <div className={`empty-state-icon-box relative ${variant === 'compact' ? '!w-16 !h-16 !rounded-2xl' : ''}`}>
        <Icon className={`empty-state-icon ${variant === 'compact' ? '!w-7 !h-7' : ''}`} />
      </div>
    </div>
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-text">{description}</p>}
    {(action || secondaryAction) && (
      <div className="mt-4 flex items-center justify-center gap-2 flex-wrap">
        {action}
        {secondaryAction}
      </div>
    )}
  </div>
);

export default EmptyState;
