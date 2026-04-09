import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface PageHeaderProps {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  gradient?: 'primary' | 'gold' | 'destructive';
  actions?: React.ReactNode;
  onBack?: () => void;
  showBack?: boolean;
}

const gradientClasses: Record<string, string> = {
  primary: 'gradient-primary',
  gold: 'gradient-gold',
  destructive: 'bg-destructive/10',
};

const iconColors: Record<string, string> = {
  primary: 'text-primary-foreground',
  gold: 'text-primary-foreground',
  destructive: 'text-destructive',
};

const PageHeader: React.FC<PageHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  gradient = 'primary',
  actions,
  onBack,
  showBack = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="page-header-wrapper">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={onBack || (() => navigate(-1))}
            className="page-header-back"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        <div className={`page-header-icon-box ${gradientClasses[gradient]}`}>
          <Icon className={`w-5 h-5 ${iconColors[gradient]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-1.5">{actions}</div>}
      </div>
      <div className="page-header-line" />
    </div>
  );
};

export default PageHeader;
