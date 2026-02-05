import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'poster' | 'worker' | 'both';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  civilId?: string;
  role?: UserRole; // User role: 'poster' (task creator), 'worker' (task doer), or 'both'
  rating?: number; // Worker rating (0-5), used when displaying applicants
  points?: number; // Earned from completed tasks (added when poster confirms)
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false, // Don't return password by default
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    civilId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true, // Allows multiple null values
    },
    role: {
      type: String,
      enum: ['poster', 'worker', 'both'],
      default: 'both', // Default to 'both' to allow flexibility
    },
    rating: {
      type: Number,
      min: [0, 'Rating must be at least 0'],
      max: [5, 'Rating cannot exceed 5'],
      default: null,
    },
    points: {
      type: Number,
      min: [0, 'Points cannot be negative'],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model<IUser>('User', userSchema);

export default User;
