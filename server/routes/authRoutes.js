import express from 'express';
import { register, login, getProfile, updateProfile, getWishlist, addToWishlist, removeFromWishlist } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist', authenticateToken, addToWishlist);
router.delete('/wishlist/:bookId', authenticateToken, removeFromWishlist);

export default router;
