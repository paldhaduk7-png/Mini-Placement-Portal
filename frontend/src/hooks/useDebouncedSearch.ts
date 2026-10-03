import { useState, useEffect } from 'react';

export function useDebouncedSearch(initialValue: string = '', delay: number = 500, minLength: number = 3) {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [debouncedTerm, setDebouncedTerm] = useState(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      // Send API request if cleared (0 chars) or if it meets the minimum length
      if (searchTerm.length === 0 || searchTerm.length >= minLength) {
        setDebouncedTerm(searchTerm);
      }
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, minLength]);

  return { searchTerm, setSearchTerm, debouncedTerm };
}
