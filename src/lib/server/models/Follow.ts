import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFollow extends Document {
  _id: Types.ObjectId;
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// Ensure one follow relationship per user pair
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

// Indexes for efficient queries
FollowSchema.index({ followerId: 1 });
FollowSchema.index({ followingId: 1 });

export const Follow = mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);