import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { connectToDatabase } from "$lib/server/database";
import { User } from "$lib/server/models/User";
import { Follow } from "$lib/server/models/Follow";
import { Rating } from "$lib/server/models/Rating";
import mongoose from "mongoose";

export const GET: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();

    const userId = url.searchParams.get("userId");
    const type = url.searchParams.get("type") || "following"; // 'following' or 'all'
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!userId) {
      return json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: "Invalid user ID format" }, { status: 400 });
    }

    let activities = [];

    if (type === "following") {
      // Get activities from users that the current user follows
      const following = await Follow.find({ followerId: userId }).select(
        "followingId",
      );
      const followingIds = following.map((f) => f.followingId);

      // Get recent activities from followed users
      const [ratings, follows] = await Promise.all([
        // Recent ratings
        Rating.find({
          userId: { $in: followingIds },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
        })
          .populate("userId", "username displayName avatar")
          .sort({ createdAt: -1 })
          .limit(limit),

        // Recent follows
        Follow.find({
          followerId: { $in: followingIds },
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        })
          .populate("followerId", "username displayName avatar")
          .populate("followingId", "username displayName avatar")
          .sort({ createdAt: -1 })
          .limit(limit),
      ]);

      // Transform and combine activities
      activities = [
        ...ratings.map((rating: any) => ({
          id: rating._id?.toString() || "unknown",
          type: "rating",
          userId:
            rating.userId?._id?.toString() ||
            rating.userId?.toString() ||
            "unknown",
          actorName: rating.userId?.displayName || "Unknown User",
          actorAvatar: rating.userId?.avatar,
          mediaId: rating.mediaId,
          mediaTitle: rating.mediaTitle,
          mediaType: rating.mediaType,
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.createdAt,
        })),
        ...follows.map((follow: any) => ({
          id: follow._id?.toString() || "unknown",
          type: "follow",
          userId:
            follow.followerId?._id?.toString() ||
            follow.followerId?.toString() ||
            "unknown",
          actorName: follow.followerId?.displayName || "Unknown User",
          actorAvatar: follow.followerId?.avatar,
          targetId:
            follow.followingId?._id?.toString() ||
            follow.followingId?.toString() ||
            "unknown",
          targetName: follow.followingId?.displayName || "Unknown User",
          targetAvatar: follow.followingId?.avatar,
          createdAt: follow.createdAt,
        })),
      ];
    } else {
      // Get all recent activities (public feed)
      const [ratings, follows] = await Promise.all([
        Rating.find({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
        })
          .populate("userId", "username displayName avatar")
          .sort({ createdAt: -1 })
          .limit(limit),

        Follow.find({
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        })
          .populate("followerId", "username displayName avatar")
          .populate("followingId", "username displayName avatar")
          .sort({ createdAt: -1 })
          .limit(limit),
      ]);

      // Transform activities
      activities = [
        ...ratings.map((rating: any) => ({
          id: rating._id?.toString() || "unknown",
          type: "rating",
          userId:
            rating.userId?._id?.toString() ||
            rating.userId?.toString() ||
            "unknown",
          actorName: rating.userId?.displayName || "Unknown User",
          actorAvatar: rating.userId?.avatar,
          mediaId: rating.mediaId,
          mediaTitle: rating.mediaTitle,
          mediaType: rating.mediaType,
          rating: rating.rating,
          review: rating.review,
          createdAt: rating.createdAt,
        })),
        ...follows.map((follow: any) => ({
          id: follow._id?.toString() || "unknown",
          type: "follow",
          userId:
            follow.followerId?._id?.toString() ||
            follow.followerId?.toString() ||
            "unknown",
          actorName: follow.followerId?.displayName || "Unknown User",
          actorAvatar: follow.followerId?.avatar,
          targetId:
            follow.followingId?._id?.toString() ||
            follow.followingId?.toString() ||
            "unknown",
          targetName: follow.followingId?.displayName || "Unknown User",
          targetAvatar: follow.followingId?.avatar,
          createdAt: follow.createdAt,
        })),
      ];
    }

    // Sort all activities by creation date and apply offset/limit
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const paginatedActivities = activities.slice(offset, offset + limit);

    return json({ activities: paginatedActivities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return json({ error: "Failed to fetch activities" }, { status: 500 });
  }
};
