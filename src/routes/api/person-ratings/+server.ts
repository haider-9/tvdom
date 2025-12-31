import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { PersonRating } from '$lib/server/models/PersonRating';
import { User } from '$lib/server/models/User';
import mongoose from 'mongoose';

export const GET: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();
    
    const userId = url.searchParams.get('userId');
    const personId = url.searchParams.get('personId');
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    let query: any = { userId };
    if (personId) {
      query.personId = personId;
    }

    const ratings = await PersonRating.find(query).sort({ createdAt: -1 });
    
    return json({ ratings });
  } catch (error) {
    console.error('Error fetching person ratings:', error);
    return json({ error: 'Failed to fetch person ratings' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    
    const { userId, personId, rating, review, personName, personImage, isSpoiler, tags } = await request.json();
    
    if (!userId || !personId || !rating || !personName) {
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
    const existingRating = await PersonRating.findOne({ userId, personId });
    
    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
      existingRating.isSpoiler = isSpoiler || false;
      existingRating.tags = tags || [];
      existingRating.updatedAt = new Date();
      
      await existingRating.save();
      
      return json({ success: true, rating: existingRating });
    } else {
      const newRating = new PersonRating({
        userId,
        personId,
        rating,
        review,
        personName,
        personImage,
        isSpoiler: isSpoiler || false,
        tags: tags || [],
      });

      await newRating.save();

      return json({ success: true, rating: newRating });
    }
  } catch (error) {
    console.error('Error adding person rating:', error);
    return json({ error: 'Failed to add person rating' }, { status: 500 });
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

    const deletedRating = await PersonRating.findOneAndDelete({ userId, personId });
    
    if (!deletedRating) {
      return json({ error: 'Rating not found' }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting person rating:', error);
    return json({ error: 'Failed to delete person rating' }, { status: 500 });
  }
};