import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { uploadSlip, getSlip, verifyPayment, rejectPayment, getPendingPayments, updatePaymentStatus } from '../controllers/paymentController.js';
import { authenticateToken, authorizeAdmin } from '../middleware/authMiddleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLIP_DIR = path.join(__dirname, '..', 'uploads', 'payment-slips');

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, SLIP_DIR),
  filename: (req, file, cb) => {
    // Generate unique filename — do not trust client filename
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = crypto.randomBytes(16).toString('hex');
    cb(null, `slip-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and PDF files are allowed'));
    }
  }
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5 MB.' });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

const router = express.Router();

// Customer routes
router.post('/:orderId/slip', authenticateToken, upload.single('slip'), handleUploadError, uploadSlip);
router.get('/:orderId/slip', authenticateToken, getSlip);

// Admin routes
router.get('/admin/pending', authenticateToken, authorizeAdmin, getPendingPayments);
router.put('/:orderId/verify', authenticateToken, authorizeAdmin, verifyPayment);
router.put('/:orderId/reject', authenticateToken, authorizeAdmin, rejectPayment);
router.put('/:orderId/status', authenticateToken, authorizeAdmin, updatePaymentStatus);

export default router;
