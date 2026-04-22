import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '$lib/appwrite.js';
import { Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    const watchedItems = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.WATCHED,
      [
        Query.equal('userId', userId),
        Query.orderDesc('watchedAt')
      ]
    );
    
    return json({ watched: watchedItems.documents });
  } catch (error: any) {
    console.error('Error fetching watched items:', error);
    return json({ error: 'Failed to fetch watched items' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, mediaId, mediaType, mediaTitle, mediaPoster, rating, isFavorite } = await request.json();
    
    if (!userId || !mediaId || !mediaType || !mediaTitle) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if item already exists
    const existingItems = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.WATCHED,
      [
        Query.equal('userId', userId),
        Query.equal('mediaId', mediaId),
        Query.limit(1)
      ]
    );

    let watchedItem;
    
    if (existingItems.documents.length > 0) {
      // Update rewatch count
      const existing = existingItems.documents[0];
      watchedItem = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.WATCHED,
        existing.$id,
        {
          rewatchCount: (existing.rewatchCount || 0) + 1,
          lastRewatchedAt: new Date().toISOString(),
          rating: rating || existing.rating,
          isFavorite: isFavorite !== undefined ? isFavorite : existing.isFavorite
        }
      );
    } else {
      // Create new watched item
      watchedItem = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.WATCHED,
        ID.unique(),
        {
          userId,
          mediaId,
          mediaType,
          mediaTitle,
          mediaPoster: mediaPoster || '',
          watchedAt: new Date().toISOString(),
          isFavorite: isFavorite || false,
          rewatchCount: 0,
          progress: 100,
          rating: rating || 0
        }
      );

      // Remove from watchlist if it exists
      try {
        const watchlistItems = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.WATCHLIST,
          [
            Query.equal('userId', userId),
            Query.equal('mediaId', mediaId),
            Query.limit(1)
          ]
        );

        if (watchlistItems.documents.length > 0) {
          await databases.deleteDocument(
            DATABASE_ID,
            COLLECTIONS.WATCHLIST,
            watchlistItems.documents[0].$id
          );
        }
      } catch (watchlistError) {
        console.error('Error removing from watchlist:', watchlistError);
      }

      // Update user counts
      try {
        const [userWatched, userWatchlist] = await Promise.all([
          databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WATCHED,
            [Query.equal('userId', userId)]
          ),
          databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.WATCHLIST,
            [Query.equal('userId', userId)]
          )
        ]);

        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userId,
          {
            watchedCount: userWatched.documents.length,
            watchlistCount: userWatchlist.documents.length
          }
        );
      } catch (userUpdateError) {
        console.error('Error updating user counts:', userUpdateError);
      }
    }

    return json({ success: true, item: watchedItem });
  } catch (error: any) {
    console.error('Error marking as watched:', error);
    return json({ error: 'Failed to mark as watched' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const mediaId = url.searchParams.get('mediaId');
    
    if (!userId || !mediaId) {
      return json({ error: 'User ID and Media ID are required' }, { status: 400 });
    }

    // Find the item to delete
    const existingItems = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.WATCHED,
      [
        Query.equal('userId', userId),
        Query.equal('mediaId', mediaId),
        Query.limit(1)
      ]
    );
    
    if (existingItems.documents.length === 0) {
      return json({ error: 'Item not found in watched list' }, { status: 404 });
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.WATCHED,
      existingItems.documents[0].$id
    );

    // Update user's watched count
    try {
      const userWatched = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WATCHED,
        [Query.equal('userId', userId)]
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          watchedCount: userWatched.documents.length
        }
      );
    } catch (userUpdateError) {
      console.error('Error updating user watched count:', userUpdateError);
    }

    return json({ success: true });
  } catch (error: any) {
    console.error('Error removing from watched:', error);
    return json({ error: 'Failed to remove from watched' }, { status: 500 });
  }
};