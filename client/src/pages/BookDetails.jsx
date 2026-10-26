import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';
import { cache } from '../services/cache.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { formatLKR } from '../utils/currency.js';
import Toast from '../components/Toast.jsx';

export default function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => { fetchBook(); }, [id]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const cached = cache.get(`book_${id}`);
      if (cached) { setBook(cached); setLoading(false); return; }
      const res = await api.get(`/books/${id}`);
      cache.set(`book_${id}`, res.data, cache.TTL.short);
      setBook(res.data);
    } catch {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (book.stock === 0) return;
    addToCart(book);
    setToast({ message: 'Added to cart!', type: 'success' });
  };

  const handleWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      await toggleWishlist(book);
      setToast({ message: isInWishlist(book._id) ? 'Removed from wishlist' : 'Added to wishlist!', type: 'success' });
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    try {
      setReviewLoading(true);
      await api.post('/reviews', { bookId: id, rating: reviewRating, comment: reviewComment });
      setReviewComment('');
      setReviewRating(5);
      setToast({ message: 'Review submitted!', type: 'success' });
      cache.clear(`book_${id}`); // invalidate so fresh data loads
      fetchBook();
    } catch (err) {
      setReviewError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center text-muted">Loading...</div>;
  if (error) return <div className="mx-auto max-w-7xl px-4 py-10 text-red-600">{error}</div>;
  if (!book) return <div className="mx-auto max-w-7xl px-4 py-10 text-muted">Book not found</div>;

  const inWishlist = isInWishlist(book._id);
  const rating = Number(book.averageRating) || 0;

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link to="/books" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brand">
          <ArrowLeft size={16} /> Back to Books
        </Link>

        <div className="grid gap-6 sm:gap-10 lg:grid-cols-[280px_1fr]">
          {/* Image */}
          <div className="mx-auto max-w-xs sm:max-w-sm lg:max-w-none">
            <img
              src={book.imageUrl || 'https://placehold.co/300x450?text=No+Image'}
              alt={book.title}
              className="w-full rounded-2xl shadow-md"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            {book.category && <p className="text-sm font-semibold uppercase tracking-widest text-brand">{book.category.name}</p>}
            <h1 className="text-2xl font-bold text-ink sm:text-3xl">{book.title}</h1>
            <p className="text-lg text-muted">by {book.author}</p>

            {book.averageRating ? (
              <div className="flex items-center gap-2">
                <span className="flex text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={18} fill={i < Math.round(rating) ? 'currentColor' : 'none'} />)}
                </span>
                <span className="text-sm text-muted">{book.averageRating} ({book.reviewCount} reviews)</span>
              </div>
            ) : <p className="text-sm text-muted">No reviews yet</p>}

            <p className="text-3xl font-bold text-brand">{formatLKR(book.price)}</p>
            <p className={`text-sm font-medium ${book.stock > 0 ? 'text-green-700' : 'text-red-600'}`}>
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </p>

            {book.description && <p className="leading-7 text-muted">{book.description}</p>}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={book.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ShoppingCart size={20} /> {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleWishlist}
                className={`rounded-xl border px-4 py-3 transition ${inWishlist ? 'border-brand bg-brand text-white' : 'border-line bg-white text-brand hover:border-brand'}`}
                aria-label="Toggle wishlist"
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-ink">Customer Reviews</h2>

          {book.reviews && book.reviews.length > 0 ? (
            <div className="space-y-4 mb-8">
              {book.reviews.map(review => (
                <div key={review._id} className="rounded-xl border border-line bg-white p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-semibold text-ink">{review.user?.name}</p>
                    <span className="flex text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} fill={i < review.rating ? 'currentColor' : 'none'} />)}
                    </span>
                  </div>
                  <p className="text-sm text-muted">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : <p className="mb-8 text-muted">No reviews yet. Be the first to review!</p>}

          {/* Review form - only for logged in users */}
          {user ? (
            <div className="rounded-xl border border-line bg-white p-6">
              <h3 className="mb-4 font-semibold text-ink">Write a Review</h3>
              <p className="mb-4 text-xs text-muted">Note: You can only review books from delivered orders.</p>
              {reviewError && <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{reviewError}</p>}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <button key={n} type="button" onClick={() => setReviewRating(n)}>
                        <Star size={24} className={n <= reviewRating ? 'text-amber-500' : 'text-muted'} fill={n <= reviewRating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Comment</label>
                  <textarea
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-line p-3 text-sm focus:outline-none focus:border-brand"
                    placeholder="Share your thoughts about this book..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-50 transition"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <p className="text-sm text-muted">
              <Link to="/login" className="font-semibold text-brand hover:underline">Log in</Link> to write a review.
            </p>
          )}
        </div>
      </div>
    </>
  );
}