import React from 'react';

interface SkeletonGridProps {
  count?: number;
  variant?: 'card' | 'list' | 'tile';
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 6, variant = 'card' }) => {
  if (variant === 'list') {
    return (
      <div className="space-y-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card-surface flex items-center gap-3" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="skeleton-pulse w-11 h-11 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton-pulse h-3.5 w-2/3" />
              <div className="skeleton-pulse h-2.5 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'tile') {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-pulse aspect-square rounded-2xl" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface space-y-3">
          <div className="skeleton-pulse w-10 h-10 rounded-xl" />
          <div className="skeleton-pulse h-4 w-3/4" />
          <div className="skeleton-pulse h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
