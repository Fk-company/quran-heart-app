import React from 'react';
import { Search, X, Grid3x3, List } from 'lucide-react';

interface FilterChip {
  key: string;
  label: string;
  count?: number;
}

interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  filters?: FilterChip[];
  activeFilter?: string;
  onFilterChange?: (key: string) => void;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (m: 'grid' | 'list') => void;
  showViewToggle?: boolean;
  rightActions?: React.ReactNode;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'ابحث...',
  filters,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  showViewToggle = false,
  rightActions,
}) => {
  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="search-input"
          />
          {searchValue && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
              aria-label="مسح"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
        </div>
        {showViewToggle && onViewModeChange && (
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-2xl">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              aria-label="شبكة"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              aria-label="قائمة"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        )}
        {rightActions}
      </div>
      {filters && filters.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange?.(f.key)}
              className={`filter-chip flex-shrink-0 ${activeFilter === f.key ? 'active' : ''}`}
            >
              {f.label}
              {typeof f.count === 'number' && (
                <span className="mr-1.5 opacity-70 text-[10px]">({f.count})</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
