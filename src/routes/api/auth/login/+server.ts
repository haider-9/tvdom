import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID, COLLECTIONS } from '$lib/appwrite.js';
import { Query } from 'appwrite';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find user in users table by email
    const users = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.USERS,
      [Query.equal('email', email), Query.limit(1)]
    );

    if (users.documents.length === 0) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const user = users.documents[0];

    // For now, we'll do simple password comparison
    // In production, you should hash passwords with bcrypt or similar
    if (user.password !== password) {
      return json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Update last active time (Appwrite will automatically update $updatedAt)
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.USERS,
      user.$id,
      {
        lastActiveAt: new Date().toISOString()
      }
    );

    // Return user data (excluding password)
    const { password: _, ...userWithoutPassword } = user;
    
    return json({ 
      user: {
        _id: user.$id,
        id: user.$id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar || '',
        banner: user.banner || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        joinedAt: user.$createdAt,
        lastActiveAt: user.lastActiveAt,
        isVerified: user.isVerified || false,
        isPrivate: user.isPrivate || false,
        followerCount: user.followerCount || 0,
        followingCount: user.followingCount || 0,
        totalRatings: user.totalRatings || 0,
        averageRating: user.averageRating || 0,
        favoriteGenres: user.favoriteGenres || [],
        watchlistCount: user.watchlistCount || 0,
        watchedCount: user.watchedCount || 0
      }
    });

  } catch (error: any) {
    console.error('Error during login:', error);
    return json({ error: 'Login failed' }, { status: 500 });
  }
};
