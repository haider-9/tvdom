import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { databases, DATABASE_ID, COLLECTIONS, ID } from '$lib/appwrite.js';
import { Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get("userId");
    const type = url.searchParams.get("type"); // 'following' or 'followers'

    if (!userId) {
      return json({ error: "User ID is required" }, { status: 400 });
    }

    let follows;
    if (type === "followers") {
      // Get users who follow this user
      follows = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [
          Query.equal('followingId', userId),
          Query.orderDesc('$createdAt')
        ]
      );
    } else {
      // Get users this user follows (default)
      follows = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.FOLLOWS,
        [
          Query.equal('followerId', userId),
          Query.orderDesc('$createdAt')
        ]
      );
    }

    return json({ follows: follows.documents });
  } catch (error: any) {
    console.error("Error fetching follows:", error);
    return json({ error: "Failed to fetch follows" }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { followerId, followingId } = await request.json();

    if (!followerId || !followingId) {
      return json(
        { error: "Follower ID and Following ID are required" },
        { status: 400 },
      );
    }

    // Prevent self-following
    if (followerId === followingId) {
      return json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    // Check if already following
    const existingFollows = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FOLLOWS,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
        Query.limit(1)
      ]
    );

    if (existingFollows.documents.length > 0) {
      return json({ error: "Already following this user" }, { status: 409 });
    }

    // Check if both users exist
    try {
      await Promise.all([
        databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, followerId),
        databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, followingId)
      ]);
    } catch (userError) {
      return json({ error: "User not found" }, { status: 404 });
    }

    // Create follow relationship
    const follow = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.FOLLOWS,
      ID.unique(),
      {
        followerId,
        followingId
      }
    );

    // Update follow counts
    try {
      const [followerFollows, followingFollowers] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [Query.equal('followerId', followerId)]
        ),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [Query.equal('followingId', followingId)]
        )
      ]);

      await Promise.all([
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          followerId,
          { followingCount: followerFollows.documents.length }
        ),
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          followingId,
          { followerCount: followingFollowers.documents.length }
        )
      ]);
    } catch (countUpdateError) {
      console.error('Error updating follow counts:', countUpdateError);
    }

    return json({ success: true, follow });
  } catch (error: any) {
    console.error("Error creating follow:", error);
    return json({ error: "Failed to follow user" }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const followerId = url.searchParams.get("followerId");
    const followingId = url.searchParams.get("followingId");

    if (!followerId || !followingId) {
      return json(
        { error: "Follower ID and Following ID are required" },
        { status: 400 },
      );
    }

    // Find the follow relationship to delete
    const existingFollows = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.FOLLOWS,
      [
        Query.equal('followerId', followerId),
        Query.equal('followingId', followingId),
        Query.limit(1)
      ]
    );

    if (existingFollows.documents.length === 0) {
      return json({ error: "Follow relationship not found" }, { status: 404 });
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.FOLLOWS,
      existingFollows.documents[0].$id
    );

    // Update follow counts
    try {
      const [followerFollows, followingFollowers] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [Query.equal('followerId', followerId)]
        ),
        databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [Query.equal('followingId', followingId)]
        )
      ]);

      await Promise.all([
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          followerId,
          { followingCount: followerFollows.documents.length }
        ),
        databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          followingId,
          { followerCount: followingFollowers.documents.length }
        )
      ]);
    } catch (countUpdateError) {
      console.error('Error updating follow counts:', countUpdateError);
    }

    return json({ success: true });
  } catch (error: any) {
    console.error("Error unfollowing user:", error);
    return json({ error: "Failed to unfollow user" }, { status: 500 });
  }
};
