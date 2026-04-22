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

    const favorites = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PERSON_FAVORITES,
      [
        Query.equal('userId', userId),
        Query.orderDesc('addedAt')
      ]
    );
    
    return json({ favorites: favorites.documents });
  } catch (error: any) {
    console.error('Error fetching person favorites:', error);
    return json({ error: 'Failed to fetch person favorites' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { userId, personId, personName, personImage, personKnownFor } = await request.json();
    
    if (!userId || !personId || !personName) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if already favorited
    const existingFavorites = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PERSON_FAVORITES,
      [
        Query.equal('userId', userId),
        Query.equal('personId', personId),
        Query.limit(1)
      ]
    );

    if (existingFavorites.documents.length > 0) {
      return json({ error: 'Person already in favorites' }, { status: 409 });
    }

    const favorite = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.PERSON_FAVORITES,
      ID.unique(),
      {
        userId,
        personId,
        personName,
        personImage: personImage || '',
        personKnownFor: personKnownFor || '',
        addedAt: new Date().toISOString()
      }
    );

    return json({ success: true, favorite });
  } catch (error: any) {
    console.error('Error adding person to favorites:', error);
    return json({ error: 'Failed to add person to favorites' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const personId = url.searchParams.get('personId');
    
    if (!userId || !personId) {
      return json({ error: 'User ID and Person ID are required' }, { status: 400 });
    }

    // Find the favorite to delete
    const existingFavorites = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.PERSON_FAVORITES,
      [
        Query.equal('userId', userId),
        Query.equal('personId', personId),
        Query.limit(1)
      ]
    );
    
    if (existingFavorites.documents.length === 0) {
      return json({ error: 'Favorite not found' }, { status: 404 });
    }

    await databases.deleteDocument(
      DATABASE_ID,
      COLLECTIONS.PERSON_FAVORITES,
      existingFavorites.documents[0].$id
    );

    return json({ success: true });
  } catch (error: any) {
    console.error('Error removing person from favorites:', error);
    return json({ error: 'Failed to remove person from favorites' }, { status: 500 });
  }
};