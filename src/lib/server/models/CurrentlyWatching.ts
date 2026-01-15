import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ICurrentlyWatching extends Document {
	_id: Types.ObjectId;
	userId: string;
	mediaId: string;
	mediaType: 'movie' | 'tv';
	mediaTitle: string;
	mediaPoster?: string;
	season?: number;
	episode?: number;
	startedAt: Date;
	lastActiveAt: Date;
}

const CurrentlyWatchingSchema = new Schema<ICurrentlyWatching>({
	userId: { type: String, required: true, index: true },
	mediaId: { type: String, required: true },
	mediaType: { type: String, required: true, enum: ['movie', 'tv'] },
	mediaTitle: { type: String, required: true },
	mediaPoster: { type: String },
	season: { type: Number },
	episode: { type: Number },
	startedAt: { type: Date, default: Date.now },
	lastActiveAt: { type: Date, default: Date.now }
});

// Index for efficient queries
CurrentlyWatchingSchema.index({ userId: 1, mediaId: 1 });
CurrentlyWatchingSchema.index({ lastActiveAt: 1 }); // For cleanup of old entries

export const CurrentlyWatching =
	mongoose.models.CurrentlyWatching ||
	mongoose.model<ICurrentlyWatching>('CurrentlyWatching', CurrentlyWatchingSchema);
