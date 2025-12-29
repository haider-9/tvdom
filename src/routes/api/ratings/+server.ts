import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { Rating } from '$lib/server/models/Rating';
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

    const ratings = await Rating.find({ userId }).sort({ createdAt: -1 });
    
    return json({ ratings });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    
    const { userId, mediaId, mediaType, rating, review, mediaTitle, mediaPoster, isSpoiler, tags } = await request.json();
    
    if (!userId || !mediaId || !mediaType || !rating || !mediaTitle) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 10) {
      return json({ error: 'Rating must be between 1 and 10' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // Check if rating already exists and update it
    const existingRating = await Rating.findOne({ userId, mediaId });
    
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.isSpoiler = isSpoiler || false;
      existingRating.tags = tags || [];
      existingRating.updatedAt = new Date();
      
      await existingRating.save();
      
      // Recalculate user's average rating
      await updateUserAverageRating(userId);
      
      return json({ success: true, rating: existingRating });
    } else {
      const newRating = new Rating({
        userId,
        mediaId,
        mediaType,
        rating,
        review,
        mediaTitle,
        mediaPoster,
        isSpoiler: isSpoiler || false,
        tags: tags || [],
      });

      await newRating.save();

      // Update user's rating count and average
      await User.findByIdAndUpdate(userId, { $inc: { totalRatings: 1 } });
      await updateUserAverageRating(userId);

      return json({ success: true, rating: newRating });
    }
  } catch (error) {
    console.error('Error adding rating:', error);
    return json({ error: 'Failed to add rating' }, { status: 500 });
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

    const deletedRating = await Rating.findOneAndDelete({ userId, mediaId });
    
    if (!deletedRating) {
      return json({ error: 'Rating not found' }, { status: 404 });
    }

    // Update user's rating count and average
    await User.findByIdAndUpdate(userId, { $inc: { totalRatings: -1 } });
    await updateUserAverageRating(userId);

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting rating:', error);
    return json({ error: 'Failed to delete rating' }, { status: 500 });
  }
};

async function updateUserAverageRating(userId: string) {
  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid user ID format');
  }

  const ratings = await Rating.find({ userId });
  if (ratings.length === 0) {
    await User.findByIdAndUpdate(userId, { averageRating: 0 });
    return;
  }
  
  const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
  const average = Math.round((sum / ratings.length) * 10) / 10;
  
  await User.findByIdAndUpdate(userId, { averageRating: average });
}