import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import BookCard from '../components/BookCard.jsx';

export default function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Heart size={24} className="text-brand" fill="currentColor" />
        <h1 className="text-3xl font-bold text-ink">My Wishlist</h1>
        {wishlist.length > 0 && <span className="rounded-full bg-brand px-2.5 py-0.5 text-sm font-semibold text-white">{wishlist.length}</span>}
      </div>

      {wishlist.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-16 text-center">
          <Heart size={48} className="mx-auto mb-4 text-muted opacity-30" />
          <p className="mb-4 text-muted">Your wishlist is empty</p>
          <Link to="/books" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark transition">
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlist.map(book => <BookCard key={book._id} book={book} />)}
        </div>
      )}
    </div>
  );
}
