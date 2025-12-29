import mongoose, { Schema, Document , Types} from 'mongoose';

export interface IRating extends Document {
  _id: Types.ObjectId;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  rating: number; // 1-10
  review?: string;
  isSpoiler: boolean;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  tags: string[];
  rewatched: boolean;
  watchedDate?: Date;
  mediaTitle: string;
  mediaPoster?: string;
}

const RatingSchema = new Schema<IRating>({
  userId: { type: String, required: true, index: true },
  mediaId: { type: String, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  review: { type: String },
  isSpoiler: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  tags: [{ type: String }],
  rewatched: { type: Boolean, default: false },
  watchedDate: { type: Date },
  mediaTitle: { type: String, required: true },
  mediaPoster: { type: String },
}, {
  timestamps: true,
});

// Compound index to prevent duplicate ratings
RatingSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

export const Rating = mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);