import mongoose, { Schema, Document, Types } from "mongoose";

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: string; // Can be ObjectId or 'all' for system notifications
  type: "follow" | "unfollow" | "rating" | "review" | "system" | "api_change";
  title: string;
  message: string;
  data?: {
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    mediaId?: string;
    mediaTitle?: string;
    mediaType?: "movie" | "tv";
    rating?: number;
    followId?: string;
    [key: string]: any;
  };
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "unfollow", "rating", "review", "system", "api_change"],
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 100,
    },
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

// Compound indexes for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

// TTL index - automatically delete notifications older than 90 days
NotificationSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 90 * 24 * 60 * 60 },
);

export const Notification =
  mongoose.models.Notification ||
  mongoose.model<INotification>("Notification", NotificationSchema);
