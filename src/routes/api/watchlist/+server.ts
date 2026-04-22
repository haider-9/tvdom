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

    const watchlistItems = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.WATCHLIST,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );
    
    return json({ watchlist: watchlistItems.documents });
  } catch (error: any) {
    console.error('Error fetching watchlist:', error);
    return json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, mediaId, mediaType, mediaTitle, mediaPoster, mediaYear, mediaGenres, priority, notes } = await request.json();
    
    if (!userId || !mediaId || !mediaType || !mediaTitle) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if item already exists
    const existingItems = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.WATCHLIST,
      [
        Query.equal('userId', userId),
        Query.equal('mediaId', mediaId),
        Query.limit(1)
      ]
    );

    if (existingItems.documents.length > 0) {
      return json({ error: 'Item already in watchlist' }, { status: 409 });
    }

    const watchlistItem = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.WATCHLIST,
      ID.unique(),
      {
        userId,
        mediaId,
        mediaType,
        mediaTitle,
        mediaPoster: mediaPoster || '',
        mediaYear: mediaYear || 0,
        mediaGenres: mediaGenres || [],
        priority: priority || 'medium',
        notes: notes || '',
        addedAt: new Date().toISOString()
      }
    );

    // Update user's watchlist count
    try {
      const userWatchlist = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WATCHLIST,
        [Query.equal('userId', userId)]
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          watchlistCount: userWatchlist.documents.length
        }
      );
    } catch (userUpdateError) {
      console.error('Error updating user watchlist count:', userUpdateError);
    }

    return json({ success: true, item: watchlistItem });
  } catch (error: any) {
    console.error('Error adding to watchlist:', error);
    return json({ error: 'Failed to add to watchlist' }, { status: 500 });
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
      COLLECTIONS.WATCHLIST,
      [
        Query.equal('userId', userId),
        Query.equal('mediaId', mediaId),
        Query.limit(1)
      ]
    );
    
    if (existingItems.documents.length === 0) {
      return json({ error: 'Item not found in watchlist' }, { status: 404 });
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.WATCHLIST,
      existingItems.documents[0].$id
    );

    // Update user's watchlist count
    try {
      const userWatchlist = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.WATCHLIST,
        [Query.equal('userId', userId)]
      );

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          watchlistCount: userWatchlist.documents.length
        }
      );
    } catch (userUpdateError) {
      console.error('Error updating user watchlist count:', userUpdateError);
    }

    return json({ success: true });
  } catch (error: any) {
    console.error('Error removing from watchlist:', error);
    return json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
};