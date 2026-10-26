import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api.js';
import { cache } from '../services/cache.js';
import BookCard from '../components/BookCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
const PAGE_SIZE = 12;

export default function Books() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: Number(searchParams.get('page')) || 1
  };

  useEffect(() => {
    const cats = cache.get('categories');
    if (cats) { setCategories(cats); return; }
    api.get('/categories')
      .then((res) => { setCategories(res.data); cache.set('categories', res.data, cache.TTL.long); })
      .catch(() => setError('Failed to load categories'));
  }, []);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: filters.page,
          limit: PAGE_SIZE,
          sortBy: filters.sortBy
        });
        Object.entries(filters).forEach(([key, value]) => {
          if (value && !['page', 'sortBy'].includes(key)) params.set(key, value);
        });
        const response = await api.get(`/books?${params.toString()}`);
        setBooks(response.data.books);
        setTotal(response.data.total);
        setPages(response.data.pages);
        setError('');
      } catch {
        setError('Failed to load books');
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [searchParams]);

  const updateFilters = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!Object.prototype.hasOwnProperty.call(changes, 'page')) next.delete('page');
    setSearchParams(next);
  };

  const filterPanel = (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-ink">Category
        <select value={filters.category} onChange={(e) => { updateFilters({ category: e.target.value }); setFiltersOpen(false); }} className="mt-1 w-full rounded-lg border border-line p-2.5 text-sm">
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </label>
      <label className="block text-sm font-medium text-ink">Min price
        <input type="number" min="0" value={filters.minPrice} onChange={(e) => updateFilters({ minPrice: e.target.value })} className="mt-1 w-full rounded-lg border border-line p-2.5 text-sm" placeholder="0" />
      </label>
      <label className="block text-sm font-medium text-ink">Max price
        <input type="number" min="0" value={filters.maxPrice} onChange={(e) => updateFilters({ maxPrice: e.target.value })} className="mt-1 w-full rounded-lg border border-line p-2.5 text-sm" placeholder="No limit" />
      </label>
      <label className="block text-sm font-medium text-ink">Sort by
        <select value={filters.sortBy} onChange={(e) => updateFilters({ sortBy: e.target.value })} className="mt-1 w-full rounded-lg border border-line p-2.5 text-sm">
          <option value="newest">Newest</option>
          <option value="title">Title A-Z</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </label>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 space-y-3">
        <h1 className="text-2xl font-bold text-ink sm:text-3xl">Books Catalogue</h1>
        <SearchBar initialQuery={filters.search} onSearch={(search) => updateFilters({ search })} />
      </div>

      {/* Mobile filter toggle */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <p className="text-sm text-muted">{total} {total === 1 ? 'book' : 'books'} found</p>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-page transition"
        >
          {filtersOpen ? <X size={16} /> : <SlidersHorizontal size={16} />}
          {filtersOpen ? 'Close filters' : 'Filters'}
        </button>
      </div>

      {/* Mobile filter panel */}
      {filtersOpen && (
        <div className="mb-6 rounded-xl border border-line bg-white p-5 lg:hidden">
          {filterPanel}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden h-fit space-y-4 rounded-xl border border-line bg-white p-5 lg:block">
          <h2 className="font-semibold text-ink">Filter books</h2>
          {filterPanel}
        </aside>

        <main>
          {loading ? (
            <p className="py-12 text-center text-muted">Loading books...</p>
          ) : error ? (
            <p className="rounded-lg bg-red-50 p-4 text-red-700">{error}</p>
          ) : books.length ? (
            <>
              <p className="mb-4 hidden text-sm text-muted lg:block">{total} {total === 1 ? 'book' : 'books'} found</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4">
                {books.map((book) => <BookCard key={book._id} book={book} />)}
              </div>
              {pages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-3">
                  <button disabled={filters.page === 1} onClick={() => updateFilters({ page: filters.page - 1 })} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-white disabled:opacity-40 transition">Previous</button>
                  <span className="text-sm text-muted">Page {filters.page} of {pages}</span>
                  <button disabled={filters.page === pages} onClick={() => updateFilters({ page: filters.page + 1 })} className="rounded-lg border border-line px-4 py-2 text-sm hover:bg-white disabled:opacity-40 transition">Next</button>
                </div>
              )}
            </>
          ) : (
            <p className="rounded-xl bg-white p-12 text-center text-muted">No books found. Try a different search or filter.</p>
          )}
        </main>
      </div>
    </div>
  );
}