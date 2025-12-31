import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { connectToDatabase } from "$lib/server/database";
import { Follow } from "$lib/server/models/Follow";
import { User } from "$lib/server/models/User";
import { Notification } from "$lib/server/models/Notification";
import mongoose from "mongoose";

export const GET: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();

    const userId = url.searchParams.get("userId");
    const type = url.searchParams.get("type"); // 'following' or 'followers'

    if (!userId) {
      return json({ error: "User ID is required" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: "Invalid user ID format" }, { status: 400 });
    }

    let follows;
    if (type === "followers") {
      // Get users who follow this user
      follows = await Follow.find({ followingId: userId })
        .populate("followerId", "username displayName avatar")
        .sort({ createdAt: -1 });
    } else {
      // Get users this user follows (default)
      follows = await Follow.find({ followerId: userId })
        .populate("followingId", "username displayName avatar")
        .sort({ createdAt: -1 });
    }

    return json({ follows });
  } catch (error) {
    console.error("Error fetching follows:", error);
    return json({ error: "Failed to fetch follows" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();

    const { followerId, followingId } = await request.json();

    if (!followerId || !followingId) {
      return json(
        { error: "Follower ID and Following ID are required" },
        { status: 400 },
      );
    }

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(followerId) ||
      !mongoose.Types.ObjectId.isValid(followingId)
    ) {
      return json({ error: "Invalid user ID format" }, { status: 400 });
    }

    // Prevent self-following
    if (followerId === followingId) {
      return json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
      return json({ error: "Already following this user" }, { status: 409 });
    }

    // Check if both users exist
    const [follower, following] = await Promise.all([
      User.findById(followerId),
      User.findById(followingId),
    ]);

    if (!follower || !following) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Create follow relationship
    const follow = new Follow({
      followerId,
      followingId,
    });

    await follow.save();

    // Update follow counts
    await Promise.all([
      User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }),
      User.findByIdAndUpdate(followingId, { $inc: { followerCount: 1 } }),
    ]);

    // Create notification for the user being followed
    try {
      const notification = new Notification({
        userId: followingId,
        type: "follow",
        title: "New Follower",
        message: `${follower.displayName} started following you`,
        data: {
          actorId: followerId,
          actorName: follower.displayName,
          actorAvatar: follower.avatar,
          followId: follow._id.toString(),
        },
        read: false,
      });
      await notification.save();
    } catch (notificationError) {
      console.error("Failed to create follow notification:", notificationError);
      // Don't fail the follow operation if notification fails
    }

    return json({ success: true, follow });
  } catch (error) {
    console.error("Error creating follow:", error);
    return json({ error: "Failed to follow user" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();

    const followerId = url.searchParams.get("followerId");
    const followingId = url.searchParams.get("followingId");

    if (!followerId || !followingId) {
      return json(
        { error: "Follower ID and Following ID are required" },
        { status: 400 },
      );
    }

    // Validate ObjectId format
    if (
      !mongoose.Types.ObjectId.isValid(followerId) ||
      !mongoose.Types.ObjectId.isValid(followingId)
    ) {
      return json({ error: "Invalid user ID format" }, { status: 400 });
    }

    const deletedFollow = await Follow.findOneAndDelete({
      followerId,
      followingId,
    });

    if (!deletedFollow) {
      return json({ error: "Follow relationship not found" }, { status: 404 });
    }

    // Update follow counts
    const [follower] = await Promise.all([
      User.findById(followerId),
      User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } }),
      User.findByIdAndUpdate(followingId, { $inc: { followerCount: -1 } }),
    ]);

    // Create unfollow notification (optional - you might not want this)
    try {
      if (follower) {
        const notification = new Notification({
          userId: followingId,
          type: "unfollow",
          title: "Unfollowed",
          message: `${follower.displayName} unfollowed you`,
          data: {
            actorId: followerId,
            actorName: follower.displayName,
            actorAvatar: follower.avatar,
          },
          read: false,
        });
        await notification.save();
      }
    } catch (notificationError) {
      console.error(
        "Failed to create unfollow notification:",
        notificationError,
      );
      // Don't fail the unfollow operation if notification fails
    }

    return json({ success: true });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return json({ error: "Failed to unfollow user" }, { status: 500 });
  }
};
