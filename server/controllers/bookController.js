import Book from '../models/Book.js';
import Review from '../models/Review.js';

export const getBooks = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 12));

    let query = {};

    if (search?.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escapedSearch, 'i');
      query.$or = [{ title: searchRegex }, { author: searchRegex }];
    }

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    let sortOption = {};
    if (sortBy === 'price-low') {
      sortOption = { price: 1 };
    } else if (sortBy === 'price-high') {
      sortOption = { price: -1 };
    } else if (sortBy === 'title') {
      sortOption = { title: 1 };
    } else if (sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      sortOption = { createdAt: -1 };
    }

    const skip = (pageNum - 1) * limitNum;
    const books = await Book.find(query)
      .populate('category', 'name')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Book.countDocuments(query);

    const booksWithRatings = await Promise.all(
      books.map(async (book) => {
        const reviews = await Review.find({ book: book._id });
        const avgRating = reviews.length > 0
          ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : null;

        return {
          ...book.toObject(),
          averageRating: avgRating,
          reviewCount: reviews.length
        };
      })
    );

    res.json({
      books: booksWithRatings,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('category', 'name');
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const reviews = await Review.find({ book: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

    res.json({
      ...book.toObject(),
      reviews,
      averageRating: avgRating,
      reviewCount: reviews.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createBook = async (req, res) => {
  try {
    const { title, author, description, price, imageUrl, category, stock } = req.body;

    if (!title || !author || !price || !category || stock === undefined) {
      return res.status(400).json({ error: 'Required fields: title, author, price, category, stock' });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({ error: 'Price and stock must be non-negative' });
    }

    const book = new Book({
      title,
      author,
      description,
      price,
      imageUrl,
      category,
      stock
    });

    await book.save();
    await book.populate('category', 'name');

    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBook = async (req, res) => {
  try {
    const { title, author, description, price, imageUrl, category, stock } = req.body;

    if (price !== undefined && price < 0) {
      return res.status(400).json({ error: 'Price must be non-negative' });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ error: 'Stock must be non-negative' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { title, author, description, price, imageUrl, category, stock },
      { new: true, runValidators: true }
    ).populate('category', 'name');

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    res.json({ message: 'Book deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
