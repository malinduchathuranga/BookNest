import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink">About</h2>
          <p className="text-sm leading-relaxed text-muted">Your trusted online bookstore offering books across all genres.</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink">Shop</h2>
          <div className="space-y-2 text-sm">
            <Link className="block text-muted hover:text-brand" to="/books">Browse Books</Link>
            <Link className="block text-muted hover:text-brand" to="/cart">Shopping Cart</Link>
            <Link className="block text-muted hover:text-brand" to="/my-orders">My Orders</Link>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink">Support</h2>
          <div className="space-y-2 text-sm text-muted">
            <a className="block hover:text-brand" href="mailto:support@booknest.com">Contact Us</a>
            <span className="block">FAQ</span>
            <span className="block">Shipping Info</span>
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-ink">Account</h2>
          <div className="space-y-2 text-sm">
            <Link className="block text-muted hover:text-brand" to="/login">Login</Link>
            <Link className="block text-muted hover:text-brand" to="/register">Register</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-sm text-muted">&copy; 2026 BookStore. All rights reserved.</div>
    </footer>
  );
}
