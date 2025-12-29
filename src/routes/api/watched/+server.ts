import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { WatchedItem } from '$lib/server/models/WatchedItem';
import { WatchlistItem } from '$lib/server/models/WatchlistItem';
import { User } from '$lib/server/models/User';
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

    const watchedItems = await WatchedItem.find({ userId }).sort({ watchedAt: -1 });
    
    return json({ watched: watchedItems });
  } catch (error) {
    console.error('Error fetching watched items:', error);
    return json({ error: 'Failed to fetch watched items' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    
    const { userId, mediaId, mediaType, mediaTitle, mediaPoster, rating, isFavorite } = await request.json();
    
    if (!userId || !mediaId || !mediaType || !mediaTitle) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // Check if item already exists
    const existingItem = await WatchedItem.findOne({ userId, mediaId });
    if (existingItem) {
      // Update rewatch count
      existingItem.rewatchCount += 1;
      existingItem.lastRewatchedAt = new Date();
      if (rating) existingItem.rating = rating;
      if (isFavorite !== undefined) existingItem.isFavorite = isFavorite;
      
      await existingItem.save();
      return json({ success: true, item: existingItem });
    }

    const watchedItem = new WatchedItem({
      userId,
      mediaId,
      mediaType,
      mediaTitle,
      mediaPoster,
      rating,
      isFavorite: isFavorite || false,
    });

    await watchedItem.save();

    // Remove from watchlist if it exists
    await WatchlistItem.findOneAndDelete({ userId, mediaId });

    // Update user counts
    await User.findByIdAndUpdate(userId, { 
      $inc: { 
        watchedCount: 1,
        watchlistCount: -1 // Decrease watchlist count if item was removed
      } 
    });

    return json({ success: true, item: watchedItem });
  } catch (error) {
    console.error('Error marking as watched:', error);
    return json({ error: 'Failed to mark as watched' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();
    
    const userId = url.searchParams.get('userId');
    const mediaId = url.searchParams.get('mediaId');
    
    if (!userId || !mediaId) {
      return json({ error: 'User ID and Media ID are required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const deletedItem = await WatchedItem.findOneAndDelete({ userId, mediaId });
    
    if (!deletedItem) {
      return json({ error: 'Item not found in watched list' }, { status: 404 });
    }

    // Update user's watched count
    await User.findByIdAndUpdate(userId, { $inc: { watchedCount: -1 } });

    return json({ success: true });
  } catch (error) {
    console.error('Error removing from watched:', error);
    return json({ error: 'Failed to remove from watched' }, { status: 500 });
  }
};