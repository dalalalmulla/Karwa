import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Application from '../src/models/Application';
import Task from '../src/models/Task';
import User from '../src/models/User';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testApplications() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/karwa';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB\n');

    // Get a task
    const task = await Task.findOne({ status: 'OPEN' });
    if (!task) {
      console.log('❌ No OPEN tasks found. Please create a task first.');
      await mongoose.disconnect();
      return;
    }

    console.log(`Task found: ${task.title} (ID: ${task._id})`);
    console.log(`Status: ${task.status}`);
    console.log(`Poster ID: ${task.posterId}\n`);

    // Get all applications for this task
    const applications = await Application.find({ taskId: task._id })
      .populate('applicantId', 'email firstName lastName')
      .sort({ createdAt: -1 });

    console.log(`Total applications for this task: ${applications.length}\n`);

    if (applications.length === 0) {
      console.log('No applications found for this task.');
    } else {
      console.log('Applications:');
      console.log('─'.repeat(80));
      applications.forEach((app, index) => {
        const applicant = app.applicantId as unknown as {
          email: string;
          firstName?: string;
          lastName?: string;
        };
        console.log(`${index + 1}. Applicant: ${applicant.email}`);
        console.log(`   Name: ${applicant.firstName || ''} ${applicant.lastName || ''}`.trim() || '   (No name)');
        console.log(`   Status: ${app.status}`);
        console.log(`   Created: ${app.createdAt}`);
        console.log(`   Application ID: ${app._id}`);
        console.log('─'.repeat(80));
      });
    }

    // Check unique constraint
    console.log('\n📊 Unique Constraint Check:');
    const duplicateCheck = await Application.aggregate([
      { $match: { taskId: task._id } },
      {
        $group: {
          _id: { taskId: '$taskId', applicantId: '$applicantId' },
          count: { $sum: 1 },
          applicationIds: { $push: '$_id' },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    if (duplicateCheck.length > 0) {
      console.log('⚠️  WARNING: Duplicate applications found!');
      duplicateCheck.forEach((dup) => {
        console.log(`   Task: ${dup._id.taskId}, Applicant: ${dup._id.applicantId}, Count: ${dup.count}`);
      });
    } else {
      console.log('✅ No duplicate applications found (unique constraint working correctly)');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testApplications();

