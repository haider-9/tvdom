import { connectToDatabase } from "$lib/server/database";
import { User } from "$lib/server/models/User";
import { Rating } from "$lib/server/models/Rating";
import { WatchlistItem } from "$lib/server/models/WatchlistItem";
import { WatchedItem } from "$lib/server/models/WatchedItem";
import { PersonRating } from "$lib/server/models/PersonRating";
import { PersonFavorite } from "$lib/server/models/PersonFavorite";
import { Follow } from "$lib/server/models/Follow";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, cookies }) => {
  const { username } = params;

  try {
    await connectToDatabase();

    // Find user by username
    const user = await User.findOne({ username })
      .select("-passwordHash -email") // Don't expose sensitive data
      .lean();

    if (!user) {
      throw error(404, "User not found");
    }

    // Get current user from session/user cookies
    let currentUserId = null;

    // Try multiple cookie methods to get the current user
    const sessionCookie = cookies.get("session");
    const userCookie = cookies.get("user");
    const tvdomUserCookie = cookies.get("tvdom_user");
    const tvdomSessionCookie = cookies.get("tvdom_session");

    // Try session cookie first
    if (sessionCookie) {
      try {
        const sessionData = JSON.parse(sessionCookie);
        currentUserId =
          sessionData.userId ||
          sessionData.id ||
          sessionData.user?.id ||
          sessionData.user?._id;
        console.log("Found user from session cookie:", currentUserId);
      } catch (e) {
        console.warn("Invalid session cookie:", e);
      }
    }

    // Try user cookie
    if (!currentUserId && userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        currentUserId = userData.id || userData._id;
        console.log("Found user from user cookie:", currentUserId);
      } catch (e) {
        console.warn("Invalid user cookie:", e);
      }
    }

    // Try TVDom specific user cookie
    if (!currentUserId && tvdomUserCookie) {
      try {
        const userData = JSON.parse(tvdomUserCookie);
        currentUserId = userData.id || userData._id;
        console.log("Found user from tvdom_user cookie:", currentUserId);
      } catch (e) {
        console.warn("Invalid tvdom_user cookie:", e);
      }
    }

    // Try TVDom session cookie
    if (!currentUserId && tvdomSessionCookie) {
      try {
        const sessionData = JSON.parse(tvdomSessionCookie);
        currentUserId =
          sessionData.userId ||
          sessionData.id ||
          sessionData.user?.id ||
          sessionData.user?._id;
        console.log("Found user from tvdom_session cookie:", currentUserId);
      } catch (e) {
        console.warn("Invalid tvdom_session cookie:", e);
      }
    }

    console.log("Final current user ID:", currentUserId);

    // Check if profile is private
    if (user.isPrivate) {
      return {
        user: {
          ...user,
          _id: user._id.toString(),
          joinedAt: user.joinedAt.toISOString(),
          lastActiveAt: user.lastActiveAt.toISOString(),
        },
        isPrivate: true,
        isFollowing: false,
        ratings: [],
        watchlist: [],
        watched: [],
        personRatings: [],
        personFavorites: [],
      };
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== user._id.toString()) {
      try {
        console.log(
          `Checking follow relationship: follower=${currentUserId}, following=${user._id}`,
        );

        const followRelation = await Follow.findOne({
          followerId: currentUserId,
          followingId: user._id,
        });

        isFollowing = !!followRelation;
        console.log(
          `Follow check result: ${currentUserId} following ${user._id} = ${isFollowing}`,
          followRelation
            ? `(found relation: ${followRelation._id})`
            : "(no relation found)",
        );
      } catch (error) {
        console.error("Error checking follow status:", error);
        isFollowing = false;
      }
    } else if (currentUserId === user._id.toString()) {
      console.log("User viewing own profile, setting isFollowing to false");
      isFollowing = false;
    } else {
      console.log("No current user ID, setting isFollowing to false");
      isFollowing = false;
    }

    // Get user's activity data
    const [ratings, watchlist, watched, personRatings, personFavorites] =
      await Promise.all([
        Rating.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        WatchlistItem.find({ userId: user._id })
          .sort({ addedAt: -1 })
          .limit(10)
          .lean(),
        WatchedItem.find({ userId: user._id })
          .sort({ watchedAt: -1 })
          .limit(10)
          .lean(),
        PersonRating.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        PersonFavorite.find({ userId: user._id })
          .sort({ addedAt: -1 })
          .limit(10)
          .lean(),
      ]);

    console.log("Returning user data:", {
      userId: user._id.toString(),
      currentUserId,
      isFollowing,
      isPrivate: false,
    });

    return {
      user: {
        ...user,
        _id: user._id.toString(),
        joinedAt: user.joinedAt.toISOString(),
        lastActiveAt: user.lastActiveAt.toISOString(),
      },
      isPrivate: false,
      isFollowing,
      currentUserId, // Add this for debugging
      ratings: ratings.map((rating) => ({
        ...rating,
        _id: rating._id.toString(),
        userId: rating.userId.toString(),
        createdAt: rating.createdAt.toISOString(),
        updatedAt: rating.updatedAt.toISOString(),
      })),
      watchlist: watchlist.map((item) => ({
        ...item,
        _id: item._id.toString(),
        userId: item.userId.toString(),
        addedAt: item.addedAt.toISOString(),
      })),
      watched: watched.map((item) => ({
        ...item,
        _id: item._id.toString(),
        userId: item.userId.toString(),
        watchedAt: item.watchedAt.toISOString(),
        lastRewatchedAt: item.lastRewatchedAt?.toISOString(),
      })),
      personRatings: personRatings.map((rating) => ({
        ...rating,
        _id: rating._id.toString(),
        userId: rating.userId.toString(),
        createdAt: rating.createdAt.toISOString(),
        updatedAt: rating.updatedAt.toISOString(),
      })),
      personFavorites: personFavorites.map((fav) => ({
        ...fav,
        _id: fav._id.toString(),
        userId: fav.userId.toString(),
        addedAt: fav.addedAt.toISOString(),
      })),
    };
  } catch (err) {
    console.error("Error loading user profile:", err);
    if (
      err &&
      typeof err === "object" &&
      "status" in err &&
      err.status === 404
    ) {
      throw err;
    }
    throw error(500, "Failed to load user profile");
  }
};
