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
    console.log('Database connected successfully');

    // Get current user ID from cookies to exclude them from results
    let currentUserId = null;
    try {
      const userCookie = cookies.get('tvdom_user');
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        currentUserId = userData._id || userData.id;
        console.log('Current user ID:', currentUserId);
      }
    } catch (error) {
      console.warn('Failed to parse user cookie:', error);
    }

    // First, let's check if there are any users at all
    const totalUsersInDb = await User.countDocuments();
    console.log('Total users in database:', totalUsersInDb);

    // If no users exist, create some sample users for testing
    if (totalUsersInDb === 0) {
      console.log('No users found, creating sample users...');
      const sampleUsers = [
        {
          username: 'moviebuff',
          email: 'moviebuff@example.com',
          displayName: 'Movie Buff',
          bio: 'Love watching movies and TV shows!',
          location: 'New York, NY',
          totalRatings: 150,
          followerCount: 25,
          averageRating: 8.2,
          favoriteGenres: ['Action', 'Drama', 'Sci-Fi']
        },
        {
          username: 'tvaddict',
          email: 'tvaddict@example.com',
          displayName: 'TV Addict',
          bio: 'Binge-watching is my superpower',
          location: 'Los Angeles, CA',
          totalRatings: 200,
          followerCount: 45,
          averageRating: 7.8,
          favoriteGenres: ['Comedy', 'Drama', 'Thriller']
        },
        {
          username: 'cinephile',
          email: 'cinephile@example.com',
          displayName: 'Cinema Lover',
          bio: 'Classic films and indie movies are my passion',
          location: 'Chicago, IL',
          totalRatings: 300,
          followerCount: 60,
          averageRating: 8.5,
          favoriteGenres: ['Drama', 'Romance', 'Documentary']
        }
      ];

      await User.insertMany(sampleUsers);
      console.log('Sample users created');
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

      console.log('Search query:', JSON.stringify(searchQuery));

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

      console.log('Base query:', JSON.stringify(baseQuery));

      users = await User.find(baseQuery)
        .select('-passwordHash -email')
        .sort({ totalRatings: -1, followerCount: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      totalUsers = await User.countDocuments(baseQuery);
    }

    console.log(`Found ${users.length} users, total: ${totalUsers}`);

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
      totalUsers: 0,
      error: error.message
    };
  }
};