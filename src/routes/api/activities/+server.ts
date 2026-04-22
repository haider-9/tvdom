import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { databases, DATABASE_ID, COLLECTIONS } from '$lib/appwrite.js';
import { Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get("userId");
    const type = url.searchParams.get("type") || "following"; // 'following' or 'all'
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    if (!userId) {
      return json({ error: "User ID is required" }, { status: 400 });
    }

    let activities = [];

    if (type === "following") {
      // Get activities from users that the current user follows
      const following = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [Query.equal('followerId', userId)]
      );
      
      const followingIds = following.documents.map((f: any) => f.followingId);

      if (followingIds.length > 0) {
        // Get recent activities from followed users
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        
        const [ratings, follows] = await Promise.all([
          // Recent ratings
          databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.RATINGS,
            [
              Query.equal('userId', followingIds),
              Query.greaterThanEqual('$createdAt', sevenDaysAgo),
              Query.orderDesc('$createdAt'),
              Query.limit(limit)
            ]
          ),

          // Recent follows
          databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.FOLLOWS,
            [
              Query.equal('followerId', followingIds),
              Query.greaterThanEqual('$createdAt', sevenDaysAgo),
              Query.orderDesc('$createdAt'),
              Query.limit(limit)
            ]
          )
        ]);

        // Get user data for activities
        const allUserIds = [
          ...new Set([
            ...ratings.documents.map((r: any) => r.userId),
            ...follows.documents.map((f: any) => f.followerId),
            ...follows.documents.map((f: any) => f.followingId)
          ])
        ];

        const users = new Map();
        for (const uid of allUserIds) {
          try {
            const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, uid);
            users.set(uid, user);
          } catch (error) {
            console.warn(`User ${uid} not found`);
          }
        }

        // Transform and combine activities
        activities = [
          ...ratings.documents.map((rating: any) => {
            const user = users.get(rating.userId);
            return {
              id: rating.$id,
              type: "rating",
              userId: rating.userId,
              actorName: user?.displayName || "Unknown User",
              actorAvatar: user?.avatar,
              mediaId: rating.mediaId,
              mediaTitle: rating.mediaTitle,
              mediaType: rating.mediaType,
              rating: rating.rating,
              review: rating.review,
              createdAt: rating.$createdAt,
            };
          }),
          ...follows.documents.map((follow: any) => {
            const follower = users.get(follow.followerId);
            const following = users.get(follow.followingId);
            return {
              id: follow.$id,
              type: "follow",
              userId: follow.followerId,
              actorName: follower?.displayName || "Unknown User",
              actorAvatar: follower?.avatar,
              targetId: follow.followingId,
              targetName: following?.displayName || "Unknown User",
              targetAvatar: following?.avatar,
              createdAt: follow.$createdAt,
            };
          }),
        ];
      }
    } else {
      // Get all recent activities (public feed)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const [ratings, follows] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.RATINGS,
          [
            Query.greaterThanEqual('$createdAt', oneDayAgo),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
          ]
        ),

        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [
            Query.greaterThanEqual('$createdAt', oneDayAgo),
            Query.orderDesc('$createdAt'),
            Query.limit(limit)
          ]
        )
      ]);

      // Get user data for activities
      const allUserIds = [
        ...new Set([
          ...ratings.documents.map((r: any) => r.userId),
          ...follows.documents.map((f: any) => f.followerId),
          ...follows.documents.map((f: any) => f.followingId)
        ])
      ];

      const users = new Map();
      for (const uid of allUserIds) {
        try {
          const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, uid);
          users.set(uid, user);
        } catch (error) {
          console.warn(`User ${uid} not found`);
        }
      }

      // Transform activities
      activities = [
        ...ratings.documents.map((rating: any) => {
          const user = users.get(rating.userId);
          return {
            id: rating.$id,
            type: "rating",
            userId: rating.userId,
            actorName: user?.displayName || "Unknown User",
            actorAvatar: user?.avatar,
            mediaId: rating.mediaId,
            mediaTitle: rating.mediaTitle,
            mediaType: rating.mediaType,
            rating: rating.rating,
            review: rating.review,
            createdAt: rating.$createdAt,
          };
        }),
        ...follows.documents.map((follow: any) => {
          const follower = users.get(follow.followerId);
          const following = users.get(follow.followingId);
          return {
            id: follow.$id,
            type: "follow",
            userId: follow.followerId,
            actorName: follower?.displayName || "Unknown User",
            actorAvatar: follower?.avatar,
            targetId: follow.followingId,
            targetName: following?.displayName || "Unknown User",
            targetAvatar: following?.avatar,
            createdAt: follow.$createdAt,
          };
        }),
      ];
    }

    // Sort all activities by creation date and apply offset/limit
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const paginatedActivities = activities.slice(offset, offset + limit);

    return json({ activities: paginatedActivities });
  } catch (error: any) {
    console.error("Error fetching activities:", error);
    return json({ error: "Failed to fetch activities" }, { status: 500 });
  }
};
