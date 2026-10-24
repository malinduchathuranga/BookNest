import React, { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ onSearch, initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch(query.trim());
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-xl items-center gap-1 rounded-lg border border-line bg-white shadow-sm focus-within:border-brand">
      <Search className="ml-3 shrink-0 text-muted" size={18} aria-hidden="true" />
      <input
        type="search"
        placeholder="Search by title or author..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm text-ink outline-none focus:ring-0"
        aria-label="Search books"
      />
      {query && (
        <button type="button" onClick={clearSearch} className="p-1.5 text-muted hover:text-ink" aria-label="Clear search">
          <X size={18} />
        </button>
      )}
      <button type="submit" className="m-1 ml-2 shrink-0 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark">
        Search
      </button>
    </form>
  );
}
