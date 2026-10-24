import Order from '../models/Order.js';
import Book from '../models/Book.js';

export const createOrder = async (req, res) => {
  try {
    const { items, deliveryDetails, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain items' });
    }

    if (!deliveryDetails || !deliveryDetails.name || !deliveryDetails.phone || !deliveryDetails.address || !deliveryDetails.city) {
      return res.status(400).json({ error: 'Complete delivery details required' });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const book = await Book.findById(item.bookId);
      if (!book) {
        return res.status(400).json({ error: `Book not found: ${item.bookId}` });
      }

      if (book.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${book.title}` });
      }

      const itemTotal = book.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        bookId: book._id,
        title: book.title,
        author: book.author,
        imageUrl: book.imageUrl,
        unitPrice: book.price,
        quantity: item.quantity
      });

      book.stock -= item.quantity;
      await book.save();
    }

    const method = paymentMethod === 'Bank Transfer' ? 'Bank Transfer' : 'Cash on Delivery';
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      totalAmount,
      deliveryDetails,
      paymentMethod: method,
      paymentStatus: method === 'Bank Transfer' ? 'Pending Upload' : 'Not Required',
      status: 'Processing'
    });

    await order.save();
    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this order' });
    }

    if (order.status !== 'Processing') {
      return res.status(400).json({ error: 'Only Processing orders can be cancelled' });
    }

    for (const item of order.items) {
      const book = await Book.findById(item.bookId);
      if (book) {
        book.stock += item.quantity;
        await book.save();
      }
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'Cancelled' && order.status !== 'Processing') {
      return res.status(400).json({ error: 'Only Processing orders can be cancelled' });
    }

    if (status === 'Cancelled' && order.status === 'Cancelled') {
      return res.status(400).json({ error: 'Order is already cancelled' });
    }

    if (status === 'Cancelled') {
      for (const item of order.items) {
        const book = await Book.findById(item.bookId);
        if (book) {
          book.stock += item.quantity;
          await book.save();
        }
      }
    }

    order.status = status;
    await order.save();

    res.json({ message: 'Order status updated', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
