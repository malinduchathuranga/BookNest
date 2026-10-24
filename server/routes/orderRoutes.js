import express from 'express';
import { createOrder, getMyOrders, getOrderById, cancelOrder, getOrdersByStatus, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticateToken, createOrder);
router.get('/my-orders', authenticateToken, getMyOrders);
router.get('/:id', authenticateToken, getOrderById);
router.put('/:id/cancel', authenticateToken, cancelOrder);
router.get('/admin/all', authenticateToken, authorizeAdmin, getOrdersByStatus);
router.put('/:id/status', authenticateToken, authorizeAdmin, updateOrderStatus);

export default router;
