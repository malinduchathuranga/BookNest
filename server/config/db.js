import mongoose from 'mongoose';
import dns from 'dns';

// Node's resolver may default to 127.0.0.1, which breaks mongodb+srv lookups
dns.setServers(['8.8.8.8', '1.1.1.1']);

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/online-bookstore';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\n⚠️  To fix this:');
    console.error('   Option 1: Install MongoDB Community https://www.mongodb.com/try/download/community');
    console.error('   Option 2: Use a different network (mobile hotspot, home WiFi)');
    console.error('   Option 3: Contact your IT to whitelist MongoDB Atlas');
    return false;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting MongoDB:', error.message);
  }
};
