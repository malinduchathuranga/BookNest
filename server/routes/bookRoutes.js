import express from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/:id', getBookById);
router.post('/', authenticateToken, authorizeAdmin, createBook);
router.put('/:id', authenticateToken, authorizeAdmin, updateBook);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteBook);

export default router;
