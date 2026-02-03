import mongoose, { Schema, Document } from 'mongoose';

export type TaskType = 'indoor' | 'outdoor' | 'home_service' | 'car_service';
export type TaskStatus = 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'PENDING_CONFIRMATION' | 'COMPLETED' | 'CANCELLED';

export interface ITask extends Document {
  title: string;
  description: string;
  pictures: string[]; // Array of image URLs
  money: number;
  location: string;
  type: TaskType;
  points: number; // Auto-generated from backend
  status: TaskStatus;
  posterId: mongoose.Types.ObjectId; // Reference to User who created the task
  assignedWorkerId?: mongoose.Types.ObjectId; // Reference to User assigned (only one)
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    pictures: {
      type: [String],
      default: [],
      validate: {
        validator: (pics: string[]) => pics.length <= 10,
        message: 'Maximum 10 pictures allowed',
      },
    },
    money: {
      type: Number,
      required: [true, 'Money amount is required'],
      min: [0, 'Money amount must be positive'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: [200, 'Location cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Task type is required'],
      enum: {
        values: ['indoor', 'outdoor', 'home_service', 'car_service'],
        message: 'Task type must be one of: indoor, outdoor, home_service, car_service',
      },
    },
    points: {
      type: Number,
      required: true,
      min: [0, 'Points must be positive'],
    },
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_CONFIRMATION', 'COMPLETED', 'CANCELLED'],
        message: 'Status must be one of: OPEN, ASSIGNED, IN_PROGRESS, PENDING_CONFIRMATION, COMPLETED, CANCELLED',
      },
      default: 'OPEN',
    },
    posterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Poster ID is required'],
    },
    assignedWorkerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
taskSchema.index({ posterId: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ assignedWorkerId: 1 });
taskSchema.index({ createdAt: -1 }); // For marketplace sorting
taskSchema.index({ money: 1 }); // For money range filtering
taskSchema.index({ location: 'text' }); // For location search

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task;

