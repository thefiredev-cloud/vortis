'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchFilter {
  category?: string;
  dateRange?: 'today' | 'week' | 'month' | 'all';
  sortBy?: 'relevance' | 'date' | 'alphabetical';
}

interface AdvancedSearchProps {
  placeholder?: string;
  categories?: string[];
  onSearch?: (query: string, filters: SearchFilter) => void;
  suggestions?: string[];
}

export function AdvancedSearch({
  placeholder = 'Search...',
  categories = [],
  onSearch,
  suggestions = [],
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilter>({
    dateRange: 'all',
    sortBy: 'relevance',
  });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(() => {
    if (!query) return [];
    return suggestions.filter((s) =>
      s.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query, suggestions]);

  const handleSearch = () => {
    onSearch?.(query, filters);
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setFilters({
      dateRange: 'all',
      sortBy: 'relevance',
    });
  };

  const activeFilterCount = [
    filters.category,
    filters.dateRange !== 'all',
    filters.sortBy !== 'relevance',
  ].filter(Boolean).length;

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" aria-hidden="true" />
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="pl-12 pr-32"
            aria-label="Search"
            aria-autocomplete="list"
            aria-controls="search-suggestions"
            aria-expanded={showSuggestions && filteredSuggestions.length > 0}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              aria-label="Toggle filters"
              aria-pressed={showFilters}
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              {activeFilterCount > 0 && (
                <Badge variant="success" size="sm" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSearch}
              aria-label="Search"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div
            id="search-suggestions"
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors text-white"
                onClick={() => {
                  setQuery(suggestion);
                  setShowSuggestions(false);
                  onSearch?.(suggestion, filters);
                }}
                role="option"
                aria-selected={false}
              >
                <Search className="h-4 w-4 inline mr-2 text-slate-400" aria-hidden="true" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Filters</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
              >
                Clear
              </Button>
              <button
                onClick={() => setShowFilters(false)}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            {categories.length > 0 && (
              <div>
                <label className="text-sm text-slate-400 mb-2 block">
                  Category
                </label>
                <select
                  value={filters.category || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value || undefined })
                  }
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="">All categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Date Range Filter */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    dateRange: e.target.value as SearchFilter['dateRange'],
                  })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="all">All time</option>
                <option value="today">Today</option>
                <option value="week">This week</option>
                <option value="month">This month</option>
              </select>
            </div>

            {/* Sort By Filter */}
            <div>
              <label className="text-sm text-slate-400 mb-2 block">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as SearchFilter['sortBy'],
                  })
                }
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50"
              >
                <option value="relevance">Relevance</option>
                <option value="date">Date</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {(showSuggestions || showFilters) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSuggestions(false);
            setShowFilters(false);
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
