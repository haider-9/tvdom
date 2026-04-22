import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '$lib/appwrite.js';
import { Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const personId = url.searchParams.get('personId');
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    let queries = [Query.equal('userId', userId)];
    if (personId) {
      queries.push(Query.equal('personId', personId));
    }
    queries.push(Query.orderDesc('$createdAt'));

    const ratings = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PERSON_RATINGS,
      queries
    );
    
    return json({ ratings: ratings.documents });
  } catch (error: any) {
    console.error('Error fetching person ratings:', error);
    return json({ error: 'Failed to fetch person ratings' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, personId, rating, review, personName, personImage, isSpoiler, tags } = await request.json();
    
    if (!userId || !personId || !rating || !personName) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 10) {
      return json({ error: 'Rating must be between 1 and 10' }, { status: 400 });
    }

    // Check if rating already exists
    const existingRatings = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PERSON_RATINGS,
      [
        Query.equal('userId', userId),
        Query.equal('personId', personId),
        Query.limit(1)
      ]
    );
    
    let ratingDoc;
    
    if (existingRatings.documents.length > 0) {
      // Update existing rating
      ratingDoc = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.PERSON_RATINGS,
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
        COLLECTIONS.PERSON_RATINGS,
        ID.unique(),
        {
          userId,
          personId,
          rating,
          review: review || '',
          personName,
          personImage: personImage || '',
          isSpoiler: isSpoiler || false,
          tags: tags || []
        }
      );
    }

    return json({ success: true, rating: ratingDoc });
  } catch (error: any) {
    console.error('Error adding person rating:', error);
    return json({ error: 'Failed to add person rating' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const personId = url.searchParams.get('personId');
    
    if (!userId || !personId) {
      return json({ error: 'User ID and Person ID are required' }, { status: 400 });
    }

    // Find the rating to delete
    const existingRatings = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PERSON_RATINGS,
      [
        Query.equal('userId', userId),
        Query.equal('personId', personId),
        Query.limit(1)
      ]
    );
    
    if (existingRatings.documents.length === 0) {
      return json({ error: 'Rating not found' }, { status: 404 });
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.PERSON_RATINGS,
      existingRatings.documents[0].$id
    );

    return json({ success: true });
  } catch (error: any) {
    console.error('Error deleting person rating:', error);
    return json({ error: 'Failed to delete person rating' }, { status: 500 });
  }
};