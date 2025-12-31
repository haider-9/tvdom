import { connectToDatabase } from '$lib/server/database';
import { User } from '$lib/server/models/User';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    await connectToDatabase();

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
        isPrivate: { $ne: true } // Only show public profiles
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
      users = await User.find({ isPrivate: { $ne: true } })
        .select('-passwordHash -email')
        .sort({ totalRatings: -1, followerCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      totalUsers = await User.countDocuments({ isPrivate: { $ne: true } });
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