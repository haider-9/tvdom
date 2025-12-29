import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { User } from '$lib/server/models/User';
import mongoose from 'mongoose';

export const GET: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();
    
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');
    
    if (!userId && !email) {
      return json({ error: 'User ID or email is required' }, { status: 400 });
    }

    let user;
    if (userId) {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return json({ error: 'Invalid user ID format' }, { status: 400 });
      }
      user = await User.findById(userId);
    } else {
      user = await User.findOne({ email });
    }
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return json({ error: 'Failed to fetch user' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    
    const userData = await request.json();
    
    if (!userData.username || !userData.email || !userData.displayName) {
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: userData.email },
        { username: userData.username }
      ]
    });

    if (existingUser) {
      return json({ error: 'User already exists' }, { status: 409 });
    }

    // Persist password for simple authentication by storing it in passwordHash.
    // NOTE: This is for demo purposes only and should be replaced with a real
    // hashing mechanism (e.g. bcrypt) for production use.
    const user = new User({
      ...userData,
      passwordHash: userData.password ?? userData.passwordHash,
    });

    await user.save();

    return json({ success: true, user });
  } catch (error) {
    console.error('Error creating user:', error);
    return json({ error: 'Failed to create user' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();
    
    const { userId, ...updateData } = await request.json();
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId, 
      { ...updateData, lastActiveAt: new Date() },
      { new: true }
    );

    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    return json({ success: true, user });
  } catch (error) {
    console.error('Error updating user:', error);
    return json({ error: 'Failed to update user' }, { status: 500 });
  }
};