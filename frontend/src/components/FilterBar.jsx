import React, { useMemo } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useLanguage } from '../i18n/LanguageContext';

export function FilterBar({ searchTerm, onSearchChange, selectedSpecialty, onSpecialtyChange, healers }) {
  const { t } = useLanguage();
  const specializations = useMemo(() => {
    const specs = new Set();
    healers.forEach((healer) => {
      healer.specialisation.split(',').forEach((spec) => {
        specs.add(spec.trim());
      });
    });
    return Array.from(specs).sort();
  }, [healers]);

  const handleClearFilters = () => {
    onSearchChange('');
    onSpecialtyChange('all');
  };

  const hasActiveFilters = searchTerm || selectedSpecialty !== 'all';

  return (
    <div className="bg-gradient-to-b from-card to-card/80 border-b border-purple-200/20 dark:border-purple-800/20 p-4 space-y-3" data-testid="filter-bar">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="font-semibold text-base">Filter & Search</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto text-xs text-purple-600 hover:text-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 btn-press"
            data-testid="clear-filters-button"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
        <Input
          type="text"
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-purple-200/40 dark:border-purple-800/30 focus:border-purple-400 focus:ring-purple-400/20 transition-all"
          data-testid="search-input"
        />
      </div>

      {/* Specialty Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block text-muted-foreground">{t('specialisation_label')}</label>
        <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
          <SelectTrigger className="border-purple-200/40 dark:border-purple-800/30 focus:border-purple-400" data-testid="specialty-filter">
            <SelectValue placeholder="All Specializations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('all_specialties')}</SelectItem>
            {specializations.map((spec) => (
              <SelectItem key={spec} value={spec} data-testid={`specialty-option-${spec}`}>
                {spec}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-1" data-testid="active-filters">
          {searchTerm && (
            <Badge variant="secondary" className="gap-1 bg-purple-100/60 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0">
              Search: {searchTerm}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedSpecialty !== 'all' && (
            <Badge variant="secondary" className="gap-1 bg-pink-100/60 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-0">
              {selectedSpecialty}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                onClick={() => onSpecialtyChange('all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}