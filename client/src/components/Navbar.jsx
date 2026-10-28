import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Menu, X, ShoppingCart, Heart, LogOut, BookOpen } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    closeMenu();
  };

  const navLink = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`;

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
            <BookOpen size={20} />
          </span>
          Book<span className="text-brand">Nest</span>
        </Link>

        {/* Right side: cart + hamburger on mobile */}
        <div className="flex items-center gap-1 md:hidden">
          {user?.role !== 'admin' && (
            <Link to="/cart" onClick={closeMenu} className="relative rounded-lg p-2 text-brand hover:bg-page" aria-label="Shopping cart">
              <ShoppingCart size={22} />
              {cart.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs text-white">
                  {cart.length}
                </span>
              )}
            </Link>
          )}
          <button
            className="rounded-lg p-2 text-ink hover:bg-page"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {user?.role === 'admin' ? (
            <>
              {[
                ['/admin/dashboard', 'Dashboard'],
                ['/admin/books', 'Books'],
                ['/admin/categories', 'Categories'],
                ['/admin/orders', 'Orders'],
                ['/admin/payments', 'Payments'],
                ['/admin/users', 'Users'],
              ].map(([to, label]) => (
                <NavLink key={to} to={to} className={navLink}>{label}</NavLink>
              ))}
              <span className="ml-2 text-sm text-muted">{user.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-page hover:text-brand">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/books" className={navLink}>Browse Books</NavLink>
              {user ? (
                <>
                  <NavLink to="/wishlist" className={({ isActive }) => `flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`}>
                    <Heart size={15} /> Wishlist
                  </NavLink>
                  <NavLink to="/my-orders" className={navLink}>My Orders</NavLink>
                  <NavLink to="/profile" className={navLink}>{user.name}</NavLink>
                  <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-page hover:text-brand">
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLink}>Login</NavLink>
                  <Link to="/register" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition">Register</Link>
                </>
              )}
            </>
          )}
        </div>

        {/* Desktop cart icon */}
        {user?.role !== 'admin' && (
          <Link to="/cart" className="relative hidden rounded-lg p-2 text-brand hover:bg-page md:block" aria-label="Shopping cart">
            <ShoppingCart size={23} />
            {cart.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs text-white">
                {cart.length}
              </span>
            )}
          </Link>
        )}
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="border-t border-line bg-white px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-1">
            {user?.role === 'admin' ? (
              <>
                {[
                  ['/admin/dashboard', 'Dashboard'],
                  ['/admin/books', 'Books'],
                  ['/admin/categories', 'Categories'],
                  ['/admin/orders', 'Orders'],
                  ['/admin/payments', 'Payments'],
                  ['/admin/users', 'Users'],
                ].map(([to, label]) => (
                  <NavLink key={to} to={to} onClick={closeMenu} className={navLink}>{label}</NavLink>
                ))}
                <div className="mt-2 border-t border-line pt-2">
                  <p className="px-3 py-1 text-sm text-muted">{user.name}</p>
                  <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-page hover:text-brand">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/books" onClick={closeMenu} className={navLink}>Browse Books</NavLink>
                {user ? (
                  <>
                    <NavLink to="/wishlist" onClick={closeMenu} className={({ isActive }) => `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`}>
                      <Heart size={15} /> Wishlist
                    </NavLink>
                    <NavLink to="/my-orders" onClick={closeMenu} className={navLink}>My Orders</NavLink>
                    <NavLink to="/profile" onClick={closeMenu} className={navLink}>{user.name}</NavLink>
                    <div className="mt-2 border-t border-line pt-2">
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-page hover:text-brand">
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 flex flex-col gap-2 border-t border-line pt-2">
                    <NavLink to="/login" onClick={closeMenu} className={navLink}>Login</NavLink>
                    <Link to="/register" onClick={closeMenu} className="rounded-lg bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark transition">
                      Register
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}