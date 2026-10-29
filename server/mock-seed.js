// Seeds the database with sample categories, books and an admin account.
//
// Usage (from the server folder):
//   npm run seed            add anything missing, leave existing data alone
//   npm run seed -- --reset wipe users, categories and books first, then seed
//
// The connection string is read from MONGODB_URI in .env. Optionally set
// ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD to override the admin account.

import dns from 'dns';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Book from './models/Book.js';

dns.setServers(['8.8.8.8', '1.1.1.1']);
dotenv.config();

const reset = process.argv.includes('--reset');

const admin = {
  name: process.env.ADMIN_NAME || 'Admin User',
  email: process.env.ADMIN_EMAIL || 'admin@bookstore.com',
  password: process.env.ADMIN_PASSWORD || 'admin123',
  role: 'admin'
};

const categories = [
  { name: 'Fiction', description: 'Novels and short stories' },
  { name: 'Non-Fiction', description: 'Educational and informative books' },
  { name: 'Science Fiction', description: 'Science fiction and fantasy' },
  { name: 'Mystery', description: 'Mystery and thriller novels' },
  { name: 'Biography', description: 'Biographical and memoir books' }
];

// `category` is the category name; it is resolved to an _id when seeding.
const books = [
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'A classic American novel set in the Jazz Age.',
    price: 12.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/7993110-M.jpg',
    category: 'Fiction',
    stock: 15
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    description: 'A gripping tale of racial injustice and childhood innocence.',
    price: 14.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/8415671-M.jpg',
    category: 'Fiction',
    stock: 12
  },
  {
    title: '1984',
    author: 'George Orwell',
    description: 'A dystopian social science fiction novel.',
    price: 13.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/7834701-M.jpg',
    category: 'Science Fiction',
    stock: 10
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    description: 'A memoir about a young woman who leaves her survivalist family to pursue education.',
    price: 18.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/9276233-M.jpg',
    category: 'Biography',
    stock: 20
  },
  {
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    description: 'A controversial novel about teenage angst and alienation.',
    price: 11.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/7816852-M.jpg',
    category: 'Fiction',
    stock: 8
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    description: 'An epic science fiction novel about desert planets and political intrigue.',
    price: 16.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/8241446-M.jpg',
    category: 'Science Fiction',
    stock: 14
  },
  {
    title: 'Sapiens',
    author: 'Yuval Noah Harari',
    description: 'A brief history of humankind from the Stone Age to the present.',
    price: 20.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/8659849-M.jpg',
    category: 'Non-Fiction',
    stock: 18
  },
  {
    title: 'The Girl with the Dragon Tattoo',
    author: 'Stieg Larsson',
    description: 'A Nordic noir mystery novel with a compelling protagonist.',
    price: 15.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/8379849-M.jpg',
    category: 'Mystery',
    stock: 11
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'A practical guide to building good habits and breaking bad ones.',
    price: 17.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/9319371-M.jpg',
    category: 'Non-Fiction',
    stock: 25
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    description: "A fantasy adventure about a hobbit's unexpected journey.",
    price: 14.99,
    imageUrl: 'https://covers.openlibrary.org/b/id/8381230-M.jpg',
    category: 'Science Fiction',
    stock: 16
  }
];

const seed = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI is not set. Add it to your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`Connected to MongoDB (database: ${mongoose.connection.name})`);

    if (reset) {
      await Promise.all([User.deleteMany({}), Category.deleteMany({}), Book.deleteMany({})]);
      console.log('Cleared existing users, categories and books');
    }

    // Admin: created only if missing, so an existing password is never overwritten.
    // Uses save() via create() so the model's pre-save hook hashes the password.
    const existingAdmin = await User.findOne({ email: admin.email.toLowerCase() });
    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.email}`);
    } else {
      const created = await User.create(admin);
      console.log(`Admin created: ${created.email}`);
    }

    // Categories: upsert by name.
    const categoryIds = {};
    let newCategories = 0;
    for (const category of categories) {
      const result = await Category.findOneAndUpdate(
        { name: category.name },
        { $setOnInsert: category },
        { upsert: true, new: true, rawResult: true }
      );
      categoryIds[category.name] = result.value._id;
      if (!result.lastErrorObject.updatedExisting) newCategories++;
    }
    console.log(`Categories: ${newCategories} added, ${categories.length - newCategories} already existed`);

    // Books: upsert by title + author.
    let newBooks = 0;
    for (const { category, ...book } of books) {
      const result = await Book.findOneAndUpdate(
        { title: book.title, author: book.author },
        { $setOnInsert: { ...book, category: categoryIds[category] } },
        { upsert: true, new: true, rawResult: true }
      );
      if (!result.lastErrorObject.updatedExisting) newBooks++;
    }
    console.log(`Books: ${newBooks} added, ${books.length - newBooks} already existed`);

    console.log('\nDatabase seeded successfully!');
    console.log(`Admin login: ${admin.email} (password from ADMIN_PASSWORD, default "admin123")`);
    console.log('Change the admin password after your first login.');
  } catch (error) {
    console.error('Seeding error:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();