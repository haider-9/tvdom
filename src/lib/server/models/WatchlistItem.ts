import mongoose, { Schema, Document,Types } from 'mongoose';

export interface IWatchlistItem extends Document {
      _id: Types.ObjectId;
    
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  addedAt: Date;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  reminderDate?: Date;
  mediaTitle: string;
  mediaPoster?: string;
  mediaYear?: number;
  mediaGenres: string[];
}

const WatchlistItemSchema = new Schema<IWatchlistItem>({
  userId: { type: String, required: true, index: true },
  mediaId: { type: String, required: true },
  mediaType: { type: String, enum: ['movie', 'tv'], required: true },
  addedAt: { type: Date, default: Date.now },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  notes: { type: String },
  reminderDate: { type: Date },
  mediaTitle: { type: String, required: true },
  mediaPoster: { type: String },
  mediaYear: { type: Number },
  mediaGenres: [{ type: String }],
}, {
  timestamps: true,
});

// Compound index to prevent duplicates
WatchlistItemSchema.index({ userId: 1, mediaId: 1 }, { unique: true });

export const WatchlistItem = mongoose.models.WatchlistItem || mongoose.model<IWatchlistItem>('WatchlistItem', WatchlistItemSchema);