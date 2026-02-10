import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listUsers() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/karwa';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Get all users
    const users = await User.find({}).select('email firstName lastName role createdAt').sort({ createdAt: -1 });
    
    console.log(`Total users in database: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      console.log('Users:');
      console.log('─'.repeat(80));
      users.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}`);
        console.log(`   Name: ${user.firstName || ''} ${user.lastName || ''}`.trim() || '   (No name)');
        console.log(`   Role: ${user.role}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('─'.repeat(80));
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

listUsers();

