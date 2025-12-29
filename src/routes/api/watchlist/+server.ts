import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
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

    const watchlistItems = await WatchlistItem.find({ userId }).sort({ addedAt: -1 });
    
    return json({ watchlist: watchlistItems });
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    
    const { userId, mediaId, mediaType, mediaTitle, mediaPoster, mediaYear, mediaGenres, priority, notes } = await request.json();
    
    if (!userId || !mediaId || !mediaType || !mediaTitle) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // Check if item already exists
    const existingItem = await WatchlistItem.findOne({ userId, mediaId });
    if (existingItem) {
      return json({ error: 'Item already in watchlist' }, { status: 409 });
    }

    const watchlistItem = new WatchlistItem({
      userId,
      mediaId,
      mediaType,
      mediaTitle,
      mediaPoster,
      mediaYear,
      mediaGenres: mediaGenres || [],
      priority: priority || 'medium',
      notes,
    });

    await watchlistItem.save();

    // Update user's watchlist count
    await User.findByIdAndUpdate(userId, { $inc: { watchlistCount: 1 } });

    return json({ success: true, item: watchlistItem });
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return json({ error: 'Failed to add to watchlist' }, { status: 500 });
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

    const deletedItem = await WatchlistItem.findOneAndDelete({ userId, mediaId });
    
    if (!deletedItem) {
      return json({ error: 'Item not found in watchlist' }, { status: 404 });
    }

    // Update user's watchlist count
    await User.findByIdAndUpdate(userId, { $inc: { watchlistCount: -1 } });

    return json({ success: true });
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
};