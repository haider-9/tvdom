import { databases, DATABASE_ID } from "$lib/appwrite";
import { Query } from "appwrite";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, cookies }) => {
  const { username } = params;

  try {
    // Find user by username
    const users = await databases.listDocuments(
      DATABASE_ID,
      'users',
      [Query.equal('username', username)]
    );

    if (users.documents.length === 0) {
      throw error(404, "User not found");
    }

    const user = users.documents[0];

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
          sessionData.user?.$id;
        console.log("Found user from session cookie:", currentUserId);
      } catch (e) {
        console.warn("Invalid session cookie:", e);
      }
    }

    // Try user cookie
    if (!currentUserId && userCookie) {
      try {
        const userData = JSON.parse(userCookie);
        currentUserId = userData.id || userData.$id;
        console.log("Found user from user cookie:", currentUserId);
      } catch (e) {
        console.warn("Invalid user cookie:", e);
      }
    }

    // Try TVDom specific user cookie
    if (!currentUserId && tvdomUserCookie) {
      try {
        const userData = JSON.parse(tvdomUserCookie);
        currentUserId = userData.id || userData.$id;
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
          sessionData.user?.$id;
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
        _id: user.$id,
        id: user.$id,
        joinedAt: user.$createdAt,
        lastActiveAt: user.lastActiveAt || user.$updatedAt,
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
    if (currentUserId && currentUserId !== user.$id) {
      try {
        console.log(
          `Checking follow relationship: follower=${currentUserId}, following=${user.$id}`,
        );

        const followRelations = await databases.listDocuments(
          DATABASE_ID,
          'follows',
          [
            Query.equal('followerId', currentUserId),
            Query.equal('followingId', user.$id)
          ]
        );

        isFollowing = followRelations.documents.length > 0;
        console.log(
          `Follow check result: ${currentUserId} following ${user.$id} = ${isFollowing}`,
          followRelations.documents.length > 0
            ? `(found relation: ${followRelations.documents[0].$id})`
            : "(no relation found)",
        );
      } catch (error) {
        console.error("Error checking follow status:", error);
        isFollowing = false;
      }
    } else if (currentUserId === user.$id) {
      console.log("User viewing own profile, setting isFollowing to false");
      isFollowing = false;
    } else {
      console.log("No current user ID, setting isFollowing to false");
      isFollowing = false;
    }

    // Get user's activity data
    const [ratings, watchlist, watched, personRatings, personFavorites] =
      await Promise.all([
        databases.listDocuments(DATABASE_ID, 'ratings', [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]),
        databases.listDocuments(DATABASE_ID, 'watchlist', [
          Query.equal('userId', user.$id),
          Query.orderDesc('addedAt'),
          Query.limit(10)
        ]),
        databases.listDocuments(DATABASE_ID, 'watched', [
          Query.equal('userId', user.$id),
          Query.orderDesc('watchedAt'),
          Query.limit(10)
        ]),
        databases.listDocuments(DATABASE_ID, 'person_ratings', [
          Query.equal('userId', user.$id),
          Query.orderDesc('$createdAt'),
          Query.limit(10)
        ]),
        databases.listDocuments(DATABASE_ID, 'person_favorites', [
          Query.equal('userId', user.$id),
          Query.orderDesc('addedAt'),
          Query.limit(10)
        ]),
      ]);

    console.log("Returning user data:", {
      userId: user.$id,
      currentUserId,
      isFollowing,
      isPrivate: false,
    });

    return {
      user: {
        _id: user.$id,
        id: user.$id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar || '',
        banner: user.banner || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        joinedAt: user.$createdAt,
        lastActiveAt: user.lastActiveAt || user.$updatedAt,
        isVerified: user.isVerified || false,
        isPrivate: user.isPrivate || false,
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        totalRatings: user.totalRatings || 0,
        averageRating: user.averageRating || 0,
        favoriteGenres: user.favoriteGenres || [],
        watchlistCount: user.watchlistCount || 0,
        watchedCount: user.watchedCount || 0,
      },
      isPrivate: false,
      isFollowing,
      currentUserId,
      ratings: ratings.documents.map((rating) => ({
        ...rating,
        createdAt: rating.$createdAt,
        updatedAt: rating.$updatedAt,
      })),
      watchlist: watchlist.documents.map((item) => ({
        ...item,
        addedAt: item.addedAt || item.$createdAt,
      })),
      watched: watched.documents.map((item) => ({
        ...item,
        watchedAt: item.watchedAt || item.$createdAt,
      })),
      personRatings: personRatings.documents.map((rating) => ({
        ...rating,
        createdAt: rating.$createdAt,
        updatedAt: rating.$updatedAt,
      })),
      personFavorites: personFavorites.documents.map((fav) => ({
        ...fav,
        addedAt: fav.addedAt || fav.$createdAt,
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
