import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatLKR } from '../utils/currency.js';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice } = useCart();
  const { user } = useAuth();

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <ShoppingCart size={48} className="mx-auto mb-4 text-muted opacity-30" />
        <h1 className="mb-2 text-2xl font-bold text-ink">Your cart is empty</h1>
        <p className="mb-6 text-muted">Add some books to get started</p>
        <Link to="/books" className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark transition">
          Browse Books
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold text-ink">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Items */}
        <div className="space-y-4">
          {cart.map(item => (
            <div key={item.bookId} className="flex gap-4 rounded-xl border border-line bg-white p-4">
              <img
                src={item.imageUrl || 'https://placehold.co/80x110?text=Book'}
                alt={item.title}
                className="h-24 w-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{item.title}</h3>
                  <p className="text-sm text-muted">{item.author}</p>
                  <p className="mt-1 text-sm font-bold text-brand">{formatLKR(item.price)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-lg border border-line">
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                      className="rounded-l-lg p-2 hover:bg-page transition"
                    >
                      <Minus size={15} />
                    </button>
                    <span className="min-w-[2rem] text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="rounded-r-lg p-2 hover:bg-page disabled:opacity-40 transition"
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-ink">{formatLKR(item.price * item.quantity)}</span>
                    <button
                      onClick={() => removeFromCart(item.bookId)}
                      className="text-red-500 hover:text-red-700 transition"
                      aria-label="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-xl border border-line bg-white p-6 space-y-4">
          <h2 className="text-lg font-bold text-ink">Order Summary</h2>
          <div className="space-y-2 border-b border-line pb-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>{formatLKR(getTotalPrice())}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="text-green-700 font-medium">Free</span>
            </div>
          </div>
          <div className="flex justify-between font-bold text-ink text-lg">
            <span>Total</span>
            <span>{formatLKR(getTotalPrice())}</span>
          </div>
          {user ? (
            <Link to="/checkout" className="block w-full rounded-xl bg-brand py-3 text-center font-semibold text-white hover:bg-brand-dark transition">
              Proceed to Checkout
            </Link>
          ) : (
            <Link to="/login" className="block w-full rounded-xl bg-brand py-3 text-center font-semibold text-white hover:bg-brand-dark transition">
              Login to Checkout
            </Link>
          )}
          <Link to="/books" className="block text-center text-sm text-muted hover:text-brand transition">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
