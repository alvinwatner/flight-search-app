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
