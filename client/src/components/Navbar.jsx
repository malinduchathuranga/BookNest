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

  return (
    <nav className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white"><BookOpen size={20} /></span>
          Book<span className="text-brand">Nest</span>
        </Link>
        <button className="rounded-lg p-2 text-ink md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-[65px] z-10 flex-col gap-1 border-b border-line bg-white p-5 md:static md:flex md:flex-row md:items-center md:gap-1 md:border-0 md:p-0`}>
          {user?.role === 'admin' ? (
            <>
              {[
                ['/admin/dashboard', 'Dashboard'],
                ['/admin/books',     'Books'],
                ['/admin/categories','Categories'],
                ['/admin/orders',    'Orders'],
                ['/admin/payments',  'Payments'],
              ].map(([to, label]) => (
                <NavLink key={to} to={to} onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`
                  }
                >{label}</NavLink>
              ))}
              <span className="ml-2 text-sm text-muted">{user.name}</span>
              <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-left text-sm font-medium text-ink hover:bg-page hover:text-brand"><LogOut size={17} /> Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/books" onClick={closeMenu}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`
                }
              >Browse Books</NavLink>
              {user ? <>
                <NavLink to="/wishlist" onClick={closeMenu}
                  className={({ isActive }) =>
                    `flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`
                  }
                ><Heart size={16} /> Wishlist</NavLink>
                <NavLink to="/my-orders" onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`
                  }
                >My Orders</NavLink>
                <NavLink to="/profile" onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`
                  }
                >{user.name}</NavLink>
                <button onClick={handleLogout} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-left text-sm font-medium text-ink hover:bg-page hover:text-brand"><LogOut size={17} /> Logout</button>
              </> : <>
                <NavLink to="/login" onClick={closeMenu}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${isActive ? 'bg-brand/10 text-brand font-semibold' : 'text-ink hover:bg-page hover:text-brand'}`
                  }
                >Login</NavLink>
                <Link to="/register" onClick={closeMenu} className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Register</Link>
              </>}
            </>
          )}
        </div>
        {user?.role !== 'admin' && (
          <Link to="/cart" className="relative rounded-lg p-2 text-brand hover:bg-page" aria-label="Shopping cart">
            <ShoppingCart size={23} />
            {cart.length > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs text-white">{cart.length}</span>}
          </Link>
        )}
      </div>
    </nav>
  );
}
