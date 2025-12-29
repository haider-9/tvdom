import mongoose, { Schema, Document,Types } from 'mongoose';

export interface IWatchedItem extends Document {

  _id: Types.ObjectId;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  watchedAt: Date;
  rating?: number;
  isFavorite: boolean;
  rewatchCount: number;
  lastRewatchedAt?: Date;
  mediaTitle: string;
  mediaPoster?: string;
  seasonNumber?: number; // for TV shows
  episodeNumber?: number; // for TV shows
  progress?: number; // percentage watched (0-100)
}

const WatchedItemSchema = new Schema<IWatchedItem>({
  userId: { type: String, required: true, index: true },
  mediaId: { type: String, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  watchedAt: { type: Date, default: Date.now },
  rating: { type: Number, min: 1, max: 10 },
  isFavorite: { type: Boolean, default: false },
  rewatchCount: { type: Number, default: 0 },
  lastRewatchedAt: { type: Date },
  mediaTitle: { type: String, required: true },
  mediaPoster: { type: String },
  seasonNumber: { type: Number },
  episodeNumber: { type: Number },
  progress: { type: Number, min: 0, max: 100, default: 100 },
}, {
  timestamps: true,
});

// Compound index to prevent duplicates
WatchedItemSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

export const WatchedItem = mongoose.models.WatchedItem || mongoose.model<IWatchedItem>('WatchedItem', WatchedItemSchema);