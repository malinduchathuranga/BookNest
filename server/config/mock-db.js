// Mock database for development when MongoDB isn't available
// This stores data in memory and logs to console

let collections = {
  users: [],
  books: [],
  categories: [],
  orders: [],
  reviews: []
};

export const mockConnectDB = async () => {
  console.log('📦 Using in-memory mock database (MongoDB not connected)');

  // Initialize with sample data
  initializeMockData();

  return {
    connected: true,
    collections: collections
  };
};

const initializeMockData = () => {
  // Categories
  collections.categories = [
    { _id: '1', name: 'Fiction', description: 'Novels and short stories', createdAt: new Date() },
    { _id: '2', name: 'Non-Fiction', description: 'Educational books', createdAt: new Date() },
    { _id: '3', name: 'Science Fiction', description: 'Sci-fi and fantasy', createdAt: new Date() },
    { _id: '4', name: 'Mystery', description: 'Mystery novels', createdAt: new Date() },
    { _id: '5', name: 'Biography', description: 'Biographies', createdAt: new Date() }
  ];

  // Books
  collections.books = [
    {
      _id: '101',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel.',
      price: 12.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/7993110-M.jpg',
      category: '1',
      stock: 15,
      createdAt: new Date()
    },
    {
      _id: '102',
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      description: 'A gripping tale of racial injustice.',
      price: 14.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/8415671-M.jpg',
      category: '1',
      stock: 12,
      createdAt: new Date()
    },
    {
      _id: '103',
      title: '1984',
      author: 'George Orwell',
      description: 'A dystopian science fiction novel.',
      price: 13.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/7834701-M.jpg',
      category: '3',
      stock: 10,
      createdAt: new Date()
    },
    {
      _id: '104',
      title: 'Educated',
      author: 'Tara Westover',
      description: 'A memoir about education and family.',
      price: 18.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/9276233-M.jpg',
      category: '5',
      stock: 20,
      createdAt: new Date()
    },
    {
      _id: '105',
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      description: 'A novel about teenage angst.',
      price: 11.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/7816852-M.jpg',
      category: '1',
      stock: 8,
      createdAt: new Date()
    },
    {
      _id: '106',
      title: 'Dune',
      author: 'Frank Herbert',
      description: 'An epic science fiction novel.',
      price: 16.99,
      imageUrl: 'https://covers.openlibrary.org/b/id/8241446-M.jpg',
      category: '3',
      stock: 14,
      createdAt: new Date()
    }
  ];

  // Admin user
  collections.users = [
    {
      _id: 'admin1',
      name: 'Admin User',
      email: 'admin@bookstore.com',
      password: '$2a$10$eImiTXuWVxfaHNYY0iHRuOpst9/PgBkqquzi.Ss7KIUgO2t0jWMUe', // bcrypt hash of 'admin123'
      role: 'admin',
      wishlist: [],
      createdAt: new Date()
    }
  ];
};

export default {
  mockConnectDB,
  collections
};
