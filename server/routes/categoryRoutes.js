import express from 'express';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/', authenticateToken, authorizeAdmin, createCategory);
router.put('/:id', authenticateToken, authorizeAdmin, updateCategory);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteCategory);

export default router;
