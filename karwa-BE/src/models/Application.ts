import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface IApplication extends Document {
  taskId: mongoose.Types.ObjectId;
  applicantId: mongoose.Types.ObjectId;
  status: ApplicationStatus;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: [true, 'Task ID is required'],
    },
    applicantId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'ACCEPTED', 'REJECTED'],
        message: 'Status must be one of: PENDING, ACCEPTED, REJECTED',
      },
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// One application per user per task
applicationSchema.index({ taskId: 1, applicantId: 1 }, { unique: true });
applicationSchema.index({ taskId: 1 });
applicationSchema.index({ applicantId: 1 });

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;
