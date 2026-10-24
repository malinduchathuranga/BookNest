import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Book from '../models/Book.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-bookstore';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Book.deleteMany({});
    console.log('Cleared existing data');

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created:', adminUser.email);

    const categories = await Category.insertMany([
      { name: 'Fiction', description: 'Novels and short stories' },
      { name: 'Non-Fiction', description: 'Educational and informative books' },
      { name: 'Science Fiction', description: 'Science fiction and fantasy' },
      { name: 'Mystery', description: 'Mystery and thriller novels' },
      { name: 'Biography', description: 'Biographical and memoir books' }
    ]);
    console.log('Categories created:', categories.length);

    const books = await Book.insertMany([
      {
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        description: 'A classic American novel set in the Jazz Age.',
        price: 12.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/7993110-M.jpg',
        category: categories[0]._id,
        stock: 15
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        description: 'A gripping tale of racial injustice and childhood innocence.',
        price: 14.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/8415671-M.jpg',
        category: categories[0]._id,
        stock: 12
      },
      {
        title: '1984',
        author: 'George Orwell',
        description: 'A dystopian social science fiction novel.',
        price: 13.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/7834701-M.jpg',
        category: categories[2]._id,
        stock: 10
      },
      {
        title: 'Educated',
        author: 'Tara Westover',
        description: 'A memoir about a young woman who leaves her survivalist family to pursue education.',
        price: 18.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/9276233-M.jpg',
        category: categories[4]._id,
        stock: 20
      },
      {
        title: 'The Catcher in the Rye',
        author: 'J.D. Salinger',
        description: 'A controversial novel about teenage angst and alienation.',
        price: 11.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/7816852-M.jpg',
        category: categories[0]._id,
        stock: 8
      },
      {
        title: 'Dune',
        author: 'Frank Herbert',
        description: 'An epic science fiction novel about desert planets and political intrigue.',
        price: 16.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/8241446-M.jpg',
        category: categories[2]._id,
        stock: 14
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        description: 'A brief history of humankind from the Stone Age to the present.',
        price: 20.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/8659849-M.jpg',
        category: categories[1]._id,
        stock: 18
      },
      {
        title: 'The Girl with the Dragon Tattoo',
        author: 'Stieg Larsson',
        description: 'A Nordic noir mystery novel with a compelling protagonist.',
        price: 15.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/8379849-M.jpg',
        category: categories[3]._id,
        stock: 11
      },
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        description: 'A practical guide to building good habits and breaking bad ones.',
        price: 17.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/9319371-M.jpg',
        category: categories[1]._id,
        stock: 25
      },
      {
        title: 'The Hobbit',
        author: 'J.R.R. Tolkien',
        description: 'A fantasy adventure about a hobbit\'s unexpected journey.',
        price: 14.99,
        imageUrl: 'https://covers.openlibrary.org/b/id/8381230-M.jpg',
        category: categories[2]._id,
        stock: 16
      }
    ]);
    console.log('Books created:', books.length);

    console.log('Database seeded successfully!');
    console.log('\nAdmin credentials:');
    console.log('Email: admin@bookstore.com');
    console.log('Password: admin123');
    console.log('\nChange these credentials after your first login!');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDatabase();
