import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  bookId: mongoose.Schema.Types.ObjectId,
  title: String,
  author: String,
  imageUrl: String,
  unitPrice: Number,
  quantity: Number
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  deliveryDetails: {
    name: String,
    phone: String,
    address: String,
    city: String
  },
  paymentMethod: {
    type: String,
    enum: ['Cash on Delivery', 'Bank Transfer'],
    default: 'Cash on Delivery'
  },
  // Payment status — separate from order status
  paymentStatus: {
    type: String,
    enum: ['Not Required', 'Pending Upload', 'Pending Verification', 'Verified', 'Rejected'],
    default: 'Not Required'
  },
  // Payment slip — only for Bank Transfer orders
  paymentSlip: {
    filePath: String,          // relative path inside uploads/payment-slips/
    uploadedAt: Date,
    rejectionReason: String,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);
