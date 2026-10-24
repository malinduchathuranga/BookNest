import express from 'express';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';
import Book from '../models/Book.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

// This route is called by ManageOrders.jsx as /admin/orders/all
router.get('/orders/all', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const orders = await Order.find(query).populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/dashboard', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();
    const totalSales = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalBooks,
      totalCustomers,
      totalOrders,
      totalSales: totalSales[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public: bank details for checkout page
router.get('/bank-details', (req, res) => {
  res.json({
    bankName: process.env.BANK_NAME || 'Commercial Bank of Ceylon',
    accountName: process.env.BANK_ACCOUNT_NAME || 'BookStore Online',
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '1234567890',
    branch: process.env.BANK_BRANCH || 'Colombo Main Branch'
  });
});

export default router;
