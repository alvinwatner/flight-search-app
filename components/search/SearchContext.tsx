// components/search/SearchContext.tsx
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SearchParams } from '@/types/flight';

interface SearchContextType {
  searchParams: SearchParams | null;
  setSearchParams: (params: SearchParams) => void;
  isSearching: boolean;
  setIsSearching: (loading: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

/**
 * Search Context Provider
 *
 * Why Context API?
 * - Share search state across components without prop drilling
 * - Centralize search logic
 * - Easy to extend (add filters, sort, etc.)
 *
 * Interview talking point: "Context is perfect for global UI state.
 * For server state (API data), I'd use React Query or SWR in production"
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParamsState] = useState<SearchParams | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // useCallback prevents unnecessary re-renders of consumers
  const setSearchParams = useCallback((params: SearchParams) => {
    setSearchParamsState(params);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchParams,
        setSearchParams,
        isSearching,
        setIsSearching
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}
