import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import api from '../services/api.js';
import { cache } from '../services/cache.js';
import BookCard from '../components/BookCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
export default function Home() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // categories — cache 10 min
        let cats = cache.get('categories');
        if (!cats) {
          const res = await api.get('/categories');
          cats = res.data;
          cache.set('categories', cats, cache.TTL.long);
        }
        setCategories(cats);

        // newest books — cache 2 min
        let bks = cache.get('home_books');
        if (!bks) {
          const res = await api.get('/books?limit=6&sortBy=newest');
          bks = res.data.books;
          cache.set('home_books', bks, cache.TTL.short);
        }
        setBooks(bks);
      } catch {
        setError('We could not load the latest books right now.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleSearch = (query) => {
    navigate(query ? `/books?search=${encodeURIComponent(query)}` : '/books');
  };

  return (
    <div className="overflow-hidden">
      <section className="relative isolate mx-auto mt-6 max-w-7xl overflow-hidden rounded-3xl bg-brand px-6 py-12 text-white shadow-xl shadow-brand/10 sm:px-10 lg:mt-8 lg:px-16 lg:py-16">
        <div className="absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full bg-emerald-300/20 blur-2xl" />
        <div className="absolute -bottom-32 left-1/3 -z-10 h-80 w-80 rounded-full bg-lime-200/10 blur-3xl" />
        <div className="absolute right-12 top-12 hidden rotate-12 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm lg:block">
          <BookOpen size={42} strokeWidth={1.5} />
        </div>
        <div className="relative max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-emerald-50 ring-1 ring-white/20">
          <BookOpen size={16} /> Books for every kind of reader
          </div>
          <h1 className="max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Stories worth getting lost in.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-emerald-50/85">
            Find your next favourite book from a carefully curated collection for every kind of reader.
          </p>
          <div className="mt-6 max-w-xl">
            <SearchBar onSearch={handleSearch} />
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link to="/books" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-brand shadow-lg transition hover:-translate-y-0.5 hover:bg-emerald-50">
              Explore the collection <ArrowRight size={18} />
            </Link>
            <span className="text-sm text-emerald-50/75">Browse by title, author, or genre</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <section className="grid gap-4 py-10 sm:grid-cols-3">
          {[
            ['01', 'Curated collection', 'Books selected for curious minds.'],
            ['02', 'Easy discovery', 'Search, filter, and find it faster.'],
            ['03', 'Made for readers', 'A simple shopping experience you will enjoy.']
          ].map(([number, title, description]) => (
            <div key={number} className="rounded-2xl border border-line bg-white p-5">
              <span className="text-sm font-bold text-brand">{number}</span>
              <h2 className="mt-3 font-semibold text-ink">{title}</h2>
              <p className="mt-1 text-sm text-muted">{description}</p>
            </div>
          ))}
        </section>

        <section className="py-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Explore your mood</p>
              <h2 className="text-3xl font-bold tracking-tight text-ink">Find your next chapter</h2>
            </div>
            <Link to="/books" className="hidden items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark sm:flex">All books <ArrowRight size={16} /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.slice(0, 4).map((category, index) => (
              <Link key={category._id} to={`/books?category=${category._id}`} className={`group min-h-36 rounded-2xl p-6 text-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${['bg-slate-800', 'bg-brand', 'bg-amber-700', 'bg-indigo-900'][index % 4]}`}>
                <span className="text-3xl font-light opacity-50">0{index + 1}</span>
                <h3 className="mt-5 text-xl font-semibold">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-white/70">{category.description || 'Discover something new.'}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="py-12">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-brand">Fresh on the shelf</p>
              <h2 className="text-3xl font-bold tracking-tight text-ink">Recently added</h2>
            </div>
            <Link to="/books" className="flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">View all <ArrowRight size={16} /></Link>
          </div>
          {loading ? <p className="py-12 text-center text-muted">Loading the latest books...</p> :
            error ? <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p> :
              books.length > 0 ?               <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{books.map((book) => <BookCard key={book._id} book={book} />)}</div> :
                <p className="rounded-xl bg-white p-12 text-center text-muted">No books available yet.</p>}
        </section>
      </div>
    </div>
  );
}
