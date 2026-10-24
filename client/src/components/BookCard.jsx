import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Star, ShoppingCart } from 'lucide-react';
import { formatLKR } from '../utils/currency.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Toast from './Toast.jsx';

export default function BookCard({ book }) {
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const rating = Number(book.averageRating) || 0;
  const inWishlist = isInWishlist(book._id);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    try {
      await toggleWishlist(book);
      setToast({ message: inWishlist ? 'Removed from wishlist' : 'Added to wishlist!', type: 'success' });
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' });
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (book.stock === 0) return;
    addToCart(book);
    setToast({ message: 'Added to cart!', type: 'success' });
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <article className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md hover:border-brand/30">
        <div className="relative aspect-[3/4] bg-slate-100">
          <Link to={`/books/${book._id}`}>
            <img
              src={book.imageUrl || 'https://placehold.co/200x300?text=No+Image'}
              alt={book.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </Link>
          <button
            className={`absolute right-3 top-3 rounded-full p-2 shadow transition ${inWishlist ? 'bg-brand text-white' : 'bg-white/90 text-brand hover:bg-white'}`}
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
          >
            <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
          </button>
        </div>
        <div className="space-y-1.5 p-3">
          <Link to={`/books/${book._id}`} className="block">
            <h3 className="line-clamp-2 text-sm font-semibold text-ink hover:text-brand">{book.title}</h3>
          </Link>
          <p className="text-xs text-muted">{book.author}</p>
          {book.category && <p className="text-xs font-medium uppercase tracking-wide text-brand">{book.category.name}</p>}
          <div className="flex items-center gap-1 text-sm">
            {book.averageRating ? (
              <>
                <span className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill={i < Math.round(rating) ? 'currentColor' : 'none'} />)}
                </span>
                <span className="text-xs text-muted">({book.reviewCount})</span>
              </>
            ) : <span className="text-xs text-muted">No ratings</span>}
          </div>
          <div className="flex items-center justify-between gap-2 pt-1">
            <p className="text-sm font-bold text-brand">{formatLKR(book.price)}</p>
            <button
              onClick={handleAddToCart}
              disabled={book.stock === 0}
              className="flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ShoppingCart size={13} />
              {book.stock === 0 ? 'Out of stock' : 'Add'}
            </button>
          </div>
        </div>
      </article>
    </>
  );
}
