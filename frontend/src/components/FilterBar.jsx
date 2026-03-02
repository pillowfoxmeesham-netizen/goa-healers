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
    <div className="bg-gradient-to-b from-card to-card/80 border-b border-emerald-200/20 dark:border-emerald-800/20 p-4 space-y-3" data-testid="filter-bar">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="font-semibold text-base">Filter & Search</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="ml-auto text-xs text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 btn-press"
            data-testid="clear-filters-button"
          >
            <X className="w-3.5 h-3.5 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emerald-500 transition-colors" />
        <Input
          type="text"
          placeholder={t('search_placeholder')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-emerald-200/40 dark:border-emerald-800/30 focus:border-emerald-400 focus:ring-emerald-400/20 transition-all"
          data-testid="search-input"
        />
      </div>

      {/* Specialty Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block text-muted-foreground">{t('specialisation_label')}</label>
        <Select value={selectedSpecialty} onValueChange={onSpecialtyChange}>
          <SelectTrigger className="border-emerald-200/40 dark:border-emerald-800/30 focus:border-emerald-400" data-testid="specialty-filter">
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
            <Badge variant="secondary" className="gap-1 bg-emerald-100/60 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0">
              Search: {searchTerm}
              <X
                className="w-3 h-3 cursor-pointer hover:text-destructive transition-colors"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {selectedSpecialty !== 'all' && (
            <Badge variant="secondary" className="gap-1 bg-teal-100/60 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-0">
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