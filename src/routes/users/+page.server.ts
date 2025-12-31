import { connectToDatabase } from '$lib/server/database';
import { User } from '$lib/server/models/User';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    await connectToDatabase();

    // Get current user ID from cookies to exclude them from results
    let currentUserId = null;
    try {
      const userCookie = cookies.get('tvdom_user');
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        currentUserId = userData._id || userData.id;
      }
    } catch (error) {
      console.warn('Failed to parse user cookie:', error);
    }

    let users = [];
    let totalUsers = 0;

    if (query.trim()) {
      // Search users by username, displayName, or email
      const searchRegex = new RegExp(query.trim(), 'i');
      
      const searchQuery = {
        $or: [
          { username: searchRegex },
          { displayName: searchRegex },
          { email: searchRegex }
        ],
        isPrivate: { $ne: true }, // Only show public profiles
        ...(currentUserId && { _id: { $ne: currentUserId } }) // Exclude current user
      };

      users = await User.find(searchQuery)
        .select('-passwordHash -email') // Don't expose sensitive data
        .sort({ totalRatings: -1, followerCount: -1 }) // Sort by activity
        .skip(skip)
        .limit(limit)
        .lean();

      totalUsers = await User.countDocuments(searchQuery);
    } else {
      // Show popular users when no search query
      const baseQuery = { 
        isPrivate: { $ne: true },
        ...(currentUserId && { _id: { $ne: currentUserId } }) // Exclude current user
      };

      users = await User.find(baseQuery)
        .select('-passwordHash -email')
        .sort({ totalRatings: -1, followerCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      totalUsers = await User.countDocuments(baseQuery);
    }

    return {
      users: users.map(user => ({
        ...user,
        _id: user._id.toString(),
        joinedAt: user.joinedAt.toISOString(),
        lastActiveAt: user.lastActiveAt.toISOString()
      })),
      query,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      totalUsers
    };
  } catch (error) {
    console.error('Error loading users:', error);
    return {
      users: [],
      query,
      currentPage: 1,
      totalPages: 1,
      totalUsers: 0
    };
  }
};