import mongoose, { Schema, Document } from 'mongoose';

export interface IRating extends Document {
  taskId: mongoose.Types.ObjectId;
  raterId: mongoose.Types.ObjectId;   // poster who rated
  ratedUserId: mongoose.Types.ObjectId; // worker who was rated
  score: number; // 1-5
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<IRating>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
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
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: [1, 'Score must be between 1 and 5'],
      max: [5, 'Score must be between 1 and 5'],
    },
  },
  {
    timestamps: true,
  }
);

// One rating per task
ratingSchema.index({ taskId: 1 }, { unique: true });
ratingSchema.index({ ratedUserId: 1 });

const Rating = mongoose.model<IRating>('Rating', ratingSchema);

export default Rating;
