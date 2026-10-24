import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLIP_DIR = path.join(__dirname, '..', 'uploads', 'payment-slips');

// Ensure upload directory exists
if (!fs.existsSync(SLIP_DIR)) {
  fs.mkdirSync(SLIP_DIR, { recursive: true });
}

// POST /api/payments/:orderId/slip — customer uploads a payment slip
export const uploadSlip = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.user.toString() !== req.user.id) return res.status(403).json({ error: 'Not authorized' });
    if (order.paymentMethod !== 'Bank Transfer') return res.status(400).json({ error: 'Only Bank Transfer orders need a payment slip' });
    if (order.paymentStatus === 'Verified') return res.status(400).json({ error: 'Payment already verified' });

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    // Delete old slip file if replacing
    if (order.paymentSlip?.filePath) {
      const oldFile = path.join(SLIP_DIR, path.basename(order.paymentSlip.filePath));
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    order.paymentSlip = {
      filePath: req.file.filename,
      uploadedAt: new Date(),
      rejectionReason: null,
      verifiedBy: null,
      verifiedAt: null
    };
    order.paymentStatus = 'Pending Verification';
    await order.save();

    res.json({ message: 'Payment slip uploaded successfully', paymentStatus: order.paymentStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/payments/:orderId/slip — serve slip file securely (owner or admin)
export const getSlip = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const isOwner = order.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized' });

    if (!order.paymentSlip?.filePath) return res.status(404).json({ error: 'No payment slip found' });

    // Safe: use only the basename to prevent path traversal
    const filename = path.basename(order.paymentSlip.filePath);
    const filePath = path.join(SLIP_DIR, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on server' });

    // Set safe headers
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    res.sendFile(filePath);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/payments/:orderId/verify — admin approves payment
export const verifyPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.paymentMethod !== 'Bank Transfer') return res.status(400).json({ error: 'Not a bank transfer order' });
    if (order.paymentStatus !== 'Pending Verification') return res.status(400).json({ error: 'No slip pending verification' });

    order.paymentStatus = 'Verified';
    order.paymentSlip.verifiedBy = req.user.id;
    order.paymentSlip.verifiedAt = new Date();
    order.paymentSlip.rejectionReason = null;
    await order.save();

    res.json({ message: 'Payment verified', paymentStatus: order.paymentStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/payments/:orderId/reject — admin rejects payment
export const rejectPayment = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.paymentMethod !== 'Bank Transfer') return res.status(400).json({ error: 'Not a bank transfer order' });
    if (order.paymentStatus !== 'Pending Verification') return res.status(400).json({ error: 'No slip pending verification' });

    order.paymentStatus = 'Rejected';
    order.paymentSlip.rejectionReason = reason || 'Payment slip rejected';
    order.paymentSlip.verifiedBy = null;
    order.paymentSlip.verifiedAt = null;
    await order.save();

    res.json({ message: 'Payment rejected', paymentStatus: order.paymentStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/payments/:orderId/status — admin: set any payment status
export const updatePaymentStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const allowed = ['Pending Verification', 'Verified', 'Rejected'];
    if (!allowed.includes(status)) return res.status(400).json({ error: 'Invalid status' });

    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.paymentMethod !== 'Bank Transfer') return res.status(400).json({ error: 'Not a bank transfer order' });

    order.paymentStatus = status;
    if (status === 'Verified') {
      order.paymentSlip = order.paymentSlip || {};
      order.paymentSlip.verifiedBy = req.user.id;
      order.paymentSlip.verifiedAt = new Date();
      order.paymentSlip.rejectionReason = null;
    } else if (status === 'Rejected') {
      order.paymentSlip = order.paymentSlip || {};
      order.paymentSlip.rejectionReason = reason || 'Rejected by admin';
      order.paymentSlip.verifiedBy = null;
      order.paymentSlip.verifiedAt = null;
    }
    await order.save();
    res.json({ message: 'Payment status updated', paymentStatus: order.paymentStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/payments/pending — admin: orders awaiting verification or rejected
export const getPendingPayments = async (req, res) => {
  try {
    const orders = await Order.find({
      paymentMethod: 'Bank Transfer',
      paymentStatus: { $in: ['Pending Verification', 'Rejected', 'Verified'] }
    })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
