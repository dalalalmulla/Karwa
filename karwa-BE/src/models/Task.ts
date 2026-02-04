import mongoose, { Schema, Document } from 'mongoose';

export type TaskType = 'indoor' | 'outdoor';
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface ITask extends Document {
  title: string;
  description: string;
  pictures: string[];
  money: number;
  location: string;
  type: TaskType;
  points: number;
  status: TaskStatus;
  posterId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [100, 'Title must not exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters long'],
    },
    pictures: {
      type: [String],
      default: [],
    },
    money: {
      type: Number,
      required: [true, 'Amount in KWD is required'],
      min: [0, 'Amount in KWD must be positive'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['indoor', 'outdoor'],
      required: [true, 'Task type is required'],
    },
    points: {
      type: Number,
      default: 0,
      min: [0, 'Points must be positive'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
    },
    posterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Poster ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
taskSchema.index({ posterId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ createdAt: -1 });

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;

