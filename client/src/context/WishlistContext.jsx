import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    if (user && token) {
      api.get('/auth/wishlist').then(res => setWishlist(res.data)).catch(() => setWishlist([]));
    } else {
      setWishlist([]);
    }
  }, [user, token]);

  const isInWishlist = (bookId) => wishlist.some(b => b._id === bookId);

  const toggleWishlist = async (book) => {
    if (isInWishlist(book._id)) {
      const res = await api.delete(`/auth/wishlist/${book._id}`);
      setWishlist(res.data);
    } else {
      const res = await api.post('/auth/wishlist', { bookId: book._id });
      setWishlist(res.data);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, isInWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
