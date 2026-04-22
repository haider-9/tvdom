import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '$lib/appwrite.js';
import { Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');
    
    if (!userId && !email) {
      return json({ error: 'User ID or email is required' }, { status: 400 });
    }

    let user;
    if (userId) {
      // Get user by ID
      user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, userId);
    } else if (email) {
      // Get user by email
      const users = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USERS,
        [Query.equal('email', email), Query.limit(1)]
      );
      user = users.documents.length > 0 ? users.documents[0] : null;
    }
    
    if (!user) {
      return json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return json({ user: userWithoutPassword });
  } catch (error: any) {
    console.error('Error fetching user:', error);
    return json({ error: 'Failed to fetch user' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request, url }) => {
  try {
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData = await request.json();
    
    // Update user in users table (Appwrite will automatically update $updatedAt)
    const updatedUser = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      updateData
    );
    
    // Return updated user data (excluding password)
    const { password: _, ...userWithoutPassword } = updatedUser;
    return json({ 
      success: true, 
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    return json({ error: 'Failed to update user' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const userData = await request.json();
    const { username, email, displayName, password } = userData;

    if (!username || !email || !displayName || !password) {
      return json({
        error: 'Username, email, display name, and password are required'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUsers = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('email', email), Query.limit(1)]
    );

    if (existingUsers.documents.length > 0) {
      return json({ error: 'User with this email already exists' }, { status: 409 });
    }

    // Check if username is taken
    const existingUsername = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('username', username), Query.limit(1)]
    );

    if (existingUsername.documents.length > 0) {
      return json({ error: 'Username is already taken' }, { status: 409 });
    }

    // Generate userId first
    const userId = ID.unique();

    // Create user in users table (Appwrite will automatically set $createdAt and $updatedAt)
    const user = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      userId,
      {
        userId, // Include userId in the payload
        username,
        email,
        displayName,
        password, // In production, hash this password
        bio: '',
        location: '',
        website: '',
        avatar: '',
        banner: '',
        isPrivate: false,
        isVerified: false,
        followerCount: 0,
        followingCount: 0,
        totalRatings: 0,
        averageRating: 0,
        favoriteGenres: [],
        watchlistCount: 0,
        watchedCount: 0,
        lastActiveAt: new Date().toISOString(),
      }
    );
    
    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    return json({ 
      success: true, 
      user: {
        ...userWithoutPassword,
        id: user.$id,
        _id: user.$id,
        joinedAt: user.$createdAt,
      }
    });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return json({ error: 'Failed to create user' }, { status: 500 });
  }
};