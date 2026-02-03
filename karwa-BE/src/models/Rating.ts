import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  raterId: mongoose.Types.ObjectId; // User who gives the rating
  ratedUserId: mongoose.Types.ObjectId; // User being rated
  taskId: mongoose.Types.ObjectId; // Task this rating is for
  rating: number; // Rating value (1-5)
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    raterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rater ID is required'],
    },
    ratedUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Rated user ID is required'],
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one rating per rater per task
ratingSchema.index({ raterId: 1, taskId: 1 }, { unique: true });

// Indexes for faster queries
ratingSchema.index({ ratedUserId: 1 });
ratingSchema.index({ taskId: 1 });
ratingSchema.index({ rating: 1 });

const Rating = mongoose.model<IRating>('Rating', ratingSchema);

export default Rating;

