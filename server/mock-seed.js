// Mock seed script for development/testing without real MongoDB
// This creates sample data in memory to demonstrate the app

import fs from 'fs';
import path from 'path';

const mockDataFile = './mock-data.json';

const mockData = {
  categories: [
    { _id: '1', name: 'Fiction', description: 'Novels and short stories' },
    { _id: '2', name: 'Non-Fiction', description: 'Educational and informative books' },
    { _id: '3', name: 'Science Fiction', description: 'Science fiction and fantasy' },
    { _id: '4', name: 'Mystery', description: 'Mystery and thriller novels' },
    { _id: '5', name: 'Biography', description: 'Biographical and memoir books' }
  ],
  books: [
    {
      _id: '101',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel set in the Jazz Age.',
      price: 12.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/7993110-M.jpg',
      category: '1',
      stock: 15
    },
    {
      _id: '102',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A gripping tale of racial injustice and childhood innocence.',
      price: 14.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/8415671-M.jpg',
      category: '1',
      stock: 12
    },
    {
      _id: '103',
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian social science fiction novel.',
      price: 13.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/7834701-M.jpg',
      category: '3',
      stock: 10
    },
    {
      _id: '104',
      title: 'Educated',
      author: 'Tara Westover',
      description: 'A memoir about a young woman who leaves her survivalist family.',
      price: 18.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/9276233-M.jpg',
      category: '5',
      stock: 20
    },
    {
      _id: '105',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      description: 'A novel about teenage angst and alienation.',
      price: 11.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/7816852-M.jpg',
      category: '1',
      stock: 8
    },
    {
      _id: '106',
      title: 'Dune',
      author: 'Frank Herbert',
      description: 'An epic science fiction novel about desert planets.',
      price: 16.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/8241446-M.jpg',
      category: '3',
      stock: 14
    },
    {
      _id: '107',
      title: 'Sapiens',
      author: 'Yuval Noah Harari',
      description: 'A brief history of humankind from the Stone Age.',
      price: 20.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/8659849-M.jpg',
      category: '2',
      stock: 18
    },
    {
      _id: '108',
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      description: 'A Nordic noir mystery novel.',
      price: 15.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/8379849-M.jpg',
      category: '4',
      stock: 11
    },
    {
      _id: '109',
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'A practical guide to building good habits.',
      price: 17.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/9319371-M.jpg',
      category: '2',
      stock: 25
    },
    {
      _id: '110',
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      description: 'A fantasy adventure about a hobbit\'s unexpected journey.',
      price: 14.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/8381230-M.jpg',
      category: '3',
      stock: 16
    }
  ],
  users: [
    {
      _id: 'admin1',
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: '$2a$10$example_hashed_password', // bcrypt hash of 'admin123'
      role: 'admin',
      wishlist: [],
      createdAt: new Date()
    }
  ]
};

console.log('📚 Creating mock database data...\n');

try {
  fs.writeFileSync(mockDataFile, JSON.stringify(mockData, null, 2));
  console.log('✅ Mock data created successfully!');
  console.log('\nMock Database Contents:');
  console.log(`  • Categories: ${mockData.categories.length}`);
  console.log(`  • Books: ${mockData.books.length}`);
  console.log(`  • Users: ${mockData.users.length}`);
  console.log('\n📝 Admin Credentials:');
  console.log(`  Email: admin@bookstore.com`);
  console.log(`  Password: admin123`);
  console.log('\n⚠️  NOTE: This is mock data for development only.');
  console.log('   To use real MongoDB, configure your connection and run: npm run seed');
  process.exit(0);
} catch (error) {
  console.error('❌ Error creating mock data:', error.message);
  process.exit(1);
}
