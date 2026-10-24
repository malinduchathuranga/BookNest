import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb://harshachathurani77_db_user:Kwi5QBe2srIk3yKa@ac-ilu66me-shard-00-00.zy6iddr.mongodb.net:27017,ac-ilu66me-shard-00-01.zy6iddr.mongodb.net:27017,ac-ilu66me-shard-00-02.zy6iddr.mongodb.net:27017/online-bookstore?ssl=true&replicaSet=atlas-o1aepp-shard-0&authSource=admin&retryWrites=true&w=majority';

const NEW_PASSWORD = '1234abcd';

await mongoose.connect(MONGODB_URI);
console.log('Connected to MongoDB');

const hash = await bcrypt.hash(NEW_PASSWORD, 10);
const result = await mongoose.connection.collection('users').updateMany({}, { $set: { password: hash } });
console.log(`Updated ${result.modifiedCount} user(s)`);
await mongoose.disconnect();
