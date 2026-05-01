import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, description, action }) => (
  <div className="empty-state animate-fade-in">
    <div className="empty-state-icon-box float-slow">
      <Icon className="empty-state-icon" />
    </div>
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-text">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
