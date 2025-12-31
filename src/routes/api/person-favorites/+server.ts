import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { PersonFavorite } from '$lib/server/models/PersonFavorite';
import mongoose from 'mongoose';

export const GET: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();
    
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const favorites = await PersonFavorite.find({ userId }).sort({ addedAt: -1 });
    
    return json({ favorites });
  } catch (error) {
    console.error('Error fetching person favorites:', error);
    return json({ error: 'Failed to fetch person favorites' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    
    const { userId, personId, personName, personImage, personKnownFor } = await request.json();
    
    if (!userId || !personId || !personName) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // Check if already favorited
    const existingFavorite = await PersonFavorite.findOne({ userId, personId });
    if (existingFavorite) {
      return json({ error: 'Person already in favorites' }, { status: 409 });
    }

    const favorite = new PersonFavorite({
      userId,
      personId,
      personName,
      personImage,
      personKnownFor,
    });

    await favorite.save();

    return json({ success: true, favorite });
  } catch (error) {
    console.error('Error adding person to favorites:', error);
    return json({ error: 'Failed to add person to favorites' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();
    
    const userId = url.searchParams.get('userId');
    const personId = url.searchParams.get('personId');
    
    if (!userId || !personId) {
      return json({ error: 'User ID and Person ID are required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const deletedFavorite = await PersonFavorite.findOneAndDelete({ userId, personId });
    
    if (!deletedFavorite) {
      return json({ error: 'Favorite not found' }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error removing person from favorites:', error);
    return json({ error: 'Failed to remove person from favorites' }, { status: 500 });
  }
};