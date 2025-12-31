import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IPersonFavorite extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  personId: string; // TMDB person ID
  addedAt: Date;
  personName: string;
  personImage?: string;
  personKnownFor?: string; // e.g., "Acting", "Directing"
}

const PersonFavoriteSchema = new Schema<IPersonFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  personId: { type: String, required: true },
  personName: { type: String, required: true },
  personImage: { type: String },
  personKnownFor: { type: String },
  addedAt: { type: Date, default: Date.now },
});

// Ensure one favorite per user per person
PersonFavoriteSchema.index({ userId: 1, personId: 1 }, { unique: true });

export const PersonFavorite = mongoose.models.PersonFavorite || mongoose.model<IPersonFavorite>('PersonFavorite', PersonFavoriteSchema);