import { X, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { getAllTreks } from '@/lib/treks';  // ✅ FIXED: Removed extra ../../
import { getTrekImageUrl } from '@/lib/images';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onTrekSelect: (trekId: string, trekSlug?: string) => void;
}

export function SearchPopup({ isOpen, onClose, onTrekSelect }: SearchPopupProps) {
  const [query, setQuery] = useState('');
  const treks = useMemo(() => getAllTreks(), []);

  // Reset on close
  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        document.getElementById('trek-search-input')?.focus();
      }, 100);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return treks.filter((t: any) =>
      t.name?.toLowerCase().includes(q) ||
      t.country?.toLowerCase().includes(q) ||
      t.region?.toLowerCase().includes(q) ||
      t.terrain?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query, treks]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 md:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh] md:max-h-[80vh] overflow-hidden animate-in zoom-in-95 slide-in-from-top-10 duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Search Treks</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close search"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              id="trek-search-input"
              type="text"
              placeholder="Search by name, country, or region..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Empty state */}
          {!query && (
            <div className="text-center py-12 text-slate-400">
              <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Start typing to search treks...</p>
            </div>
          )}

          {/* No results */}
          {query && results.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <p className="text-sm">No treks found for "<strong>{query}</strong>"</p>
              <p className="text-xs mt-1">Try searching by country or region</p>
            </div>
          )}

          {/* Results list */}
          {results.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-3">
                {results.length} result{results.length !== 1 ? 's' : ''}
              </p>
              {results.map((trek: any) => (
                <button
                  key={trek.id}
                  onClick={() => {
                    onTrekSelect(trek.id, trek.slug);
                    onClose();
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-lg border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all text-left group"
                >
                  {/* Trek thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    <img
                      src={getTrekImageUrl(trek.imageFilename)}
                      alt={trek.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/images/placeholder-trek.jpg';
                        e.currentTarget.onerror = null;
                      }}
                    />
                  </div>

                  {/* Trek info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 truncate group-hover:text-primary transition-colors">
                      {trek.name}
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {trek.country}
                      {trek.totalDays ? ` • ${trek.totalDays}` : ''}
                      {trek.region ? ` • ${trek.region}` : ''}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
