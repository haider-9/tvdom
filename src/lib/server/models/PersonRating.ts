import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPersonRating extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  personId: string; // TMDB person ID
  rating: number; // 1-10
  review?: string;
  isSpoiler: boolean;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  tags: string[];
  personName: string;
  personImage?: string;
}

const PersonRatingSchema = new Schema<IPersonRating>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  personId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 10 },
  review: { type: String },
  isSpoiler: { type: Boolean, default: false },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  tags: [{ type: String }],
  personName: { type: String, required: true },
  personImage: { type: String },
}, {
  timestamps: true,
});

// Ensure one rating per user per person
PersonRatingSchema.index({ userId: 1, personId: 1 }, { unique: true });

export const PersonRating = mongoose.models.PersonRating || mongoose.model<IPersonRating>('PersonRating', PersonRatingSchema);