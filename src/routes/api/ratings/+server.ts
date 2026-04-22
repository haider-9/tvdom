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

    const ratings = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RATINGS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt')
      ]
    );
    
    return json({ ratings: ratings.documents });
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    return json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, mediaId, mediaType, rating, review, mediaTitle, mediaPoster, isSpoiler, tags } = await request.json();
    
    if (!userId || !mediaId || !mediaType || !rating || !mediaTitle) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 10) {
      return json({ error: 'Rating must be between 1 and 10' }, { status: 400 });
    }

    // Check if rating already exists
    const existingRatings = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RATINGS,
      [
        Query.equal('userId', userId),
        Query.equal('mediaId', mediaId),
        Query.limit(1)
      ]
    );
    
    let ratingDoc;
    
    if (existingRatings.documents.length > 0) {
      // Update existing rating
      ratingDoc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.RATINGS,
        existingRatings.documents[0].$id,
        {
          rating,
          review: review || '',
          isSpoiler: isSpoiler || false,
          tags: tags || []
        }
      );
    } else {
      // Create new rating
      ratingDoc = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.RATINGS,
        ID.unique(),
        {
          userId,
          mediaId,
          mediaType,
          rating,
          review: review || '',
          mediaTitle,
          mediaPoster: mediaPoster || '',
          isSpoiler: isSpoiler || false,
          likes: 0,
          dislikes: 0,
          tags: tags || [],
          rewatched: false
        }
      );

      // Update user's rating count
      try {
        const userRatings = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.RATINGS,
          [Query.equal('userId', userId)]
        );
        
        const totalRatings = userRatings.documents.length;
        const sum = userRatings.documents.reduce((acc: number, r: any) => acc + r.rating, 0);
        const averageRating = totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;

        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USERS,
          userId,
          {
            totalRatings,
            averageRating
          }
        );
      } catch (userUpdateError) {
        console.error('Error updating user stats:', userUpdateError);
      }
    }

    return json({ success: true, rating: ratingDoc });
  } catch (error: any) {
    console.error('Error adding rating:', error);
    return json({ error: 'Failed to add rating' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const mediaId = url.searchParams.get('mediaId');
    
    if (!userId || !mediaId) {
      return json({ error: 'User ID and Media ID are required' }, { status: 400 });
    }

    // Find the rating to delete
    const existingRatings = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.RATINGS,
      [
        Query.equal('userId', userId),
        Query.equal('mediaId', mediaId),
        Query.limit(1)
      ]
    );
    
    if (existingRatings.documents.length === 0) {
      return json({ error: 'Rating not found' }, { status: 404 });
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.RATINGS,
      existingRatings.documents[0].$id
    );

    // Update user's rating count and average
    try {
      const userRatings = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.RATINGS,
        [Query.equal('userId', userId)]
      );
      
      const totalRatings = userRatings.documents.length;
      const sum = userRatings.documents.reduce((acc: number, r: any) => acc + r.rating, 0);
      const averageRating = totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;

      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          totalRatings,
          averageRating
        }
      );
    } catch (userUpdateError) {
      console.error('Error updating user stats:', userUpdateError);
    }

    return json({ success: true });
  } catch (error: any) {
    console.error('Error deleting rating:', error);
    return json({ error: 'Failed to delete rating' }, { status: 500 });
  }
};