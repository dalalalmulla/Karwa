import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../src/models/Task';
import Application from '../src/models/Application';
import Rating from '../src/models/Rating';

dotenv.config();

async function clearAllTasks() {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get all task IDs first
    const tasks = await Task.find({}, '_id');
    const taskIds = tasks.map(t => t._id);
    
    console.log(`Found ${taskIds.length} tasks to delete`);

    if (taskIds.length === 0) {
      console.log('No tasks found. Database is already clean.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Delete related applications
    const appsDeleted = await Application.deleteMany({ 
      taskId: { $in: taskIds } 
    });
    console.log(`✅ Deleted ${appsDeleted.deletedCount} applications`);

    // Delete related ratings
    const ratingsDeleted = await Rating.deleteMany({ 
      taskId: { $in: taskIds } 
    });
    console.log(`✅ Deleted ${ratingsDeleted.deletedCount} ratings`);

    // Delete all tasks
    const tasksDeleted = await Task.deleteMany({});
    console.log(`✅ Deleted ${tasksDeleted.deletedCount} tasks`);

    console.log('✅ All tasks cleared successfully!');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing tasks:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

clearAllTasks();

