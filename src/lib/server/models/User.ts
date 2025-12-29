import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: Date;
  lastActiveAt: Date;
  isVerified: boolean;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  totalRatings: number;
  averageRating: number;
  favoriteGenres: string[];
  watchlistCount: number;
  watchedCount: number;
  passwordHash?: string; // For future authentication
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  avatar: { type: String },
  banner: { type: String },
  bio: { type: String },
  location: { type: String },
  website: { type: String },
  joinedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  isVerified: { type: Boolean, default: false },
  isPrivate: { type: Boolean, default: false },
  followerCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  favoriteGenres: [{ type: String }],
  watchlistCount: { type: Number, default: 0 },
  watchedCount: { type: Number, default: 0 },
  passwordHash: { type: String }, // For future authentication
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);