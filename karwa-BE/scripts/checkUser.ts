import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import User from '../src/models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkUser(email: string) {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/karwa';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`\nChecking for email: "${email}"`);
    console.log(`Normalized email: "${normalizedEmail}"`);

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail });
    
    if (user) {
      console.log('\n❌ User found:');
      console.log({
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        createdAt: user.createdAt,
      });
    } else {
      console.log('\n✅ No user found with this email');
    }

    // Also check all users with similar emails
    const similarUsers = await User.find({
      email: { $regex: normalizedEmail.split('@')[0], $options: 'i' }
    });
    
    if (similarUsers.length > 0) {
      console.log('\n📋 Similar emails found:');
      similarUsers.forEach(u => {
        console.log(`  - ${u.email} (ID: ${u._id})`);
      });
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('Usage: ts-node scripts/checkUser.ts <email>');
  console.error('Example: ts-node scripts/checkUser.ts test@example.com');
  process.exit(1);
}

checkUser(email);

