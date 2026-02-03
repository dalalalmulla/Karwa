import mongoose, { Schema, Document } from 'mongoose';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface IApplication extends Document {
    workerId: mongoose.Types.ObjectId; // Reference to User (worker/applicant)
    taskId: mongoose.Types.ObjectId; // Reference to Task
    status: ApplicationStatus;
    createdAt: Date;
    updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
    {
        workerId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Worker ID is required'],
        },
        taskId: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: [true, 'Task ID is required'],
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

// Compound unique index to ensure one application per worker per task
applicationSchema.index({ workerId: 1, taskId: 1 }, { unique: true });

// Indexes for faster queries
applicationSchema.index({ workerId: 1 });
applicationSchema.index({ taskId: 1 });
applicationSchema.index({ status: 1 });

const Application = mongoose.model<IApplication>('Application', applicationSchema);

export default Application;

