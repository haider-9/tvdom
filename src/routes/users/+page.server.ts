import { databases, DATABASE_ID } from '$lib/appwrite';
import { Query } from 'appwrite';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, cookies }) => {
  const query = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    console.log('Loading users from Appwrite...');

    // Get current user ID from cookies to exclude them from results
    let currentUserId = null;
    try {
      const userCookie = cookies.get('tvdom_user');
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        currentUserId = userData.$id || userData.id;
        console.log('Current user ID:', currentUserId);
      }
    } catch (error) {
      console.warn('Failed to parse user cookie:', error);
    }

    // Check total users in database
    const allUsers = await databases.listDocuments(DATABASE_ID, 'users', [Query.limit(1)]);
    console.log('Total users in database:', allUsers.total);

    let users = [];
    let totalUsers = 0;

    if (query.trim()) {
      // Search users by username or displayName
      const searchQueries = [
        Query.search('username', query.trim()),
        Query.search('displayName', query.trim())
      ];

      // Get users matching search
      const searchResults = await databases.listDocuments(
        DATABASE_ID,
        'users',
        [
          Query.or(searchQueries),
          Query.equal('isPrivate', false),
          Query.orderDesc('totalRatings'),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      users = searchResults.documents.filter(user => user.$id !== currentUserId);
      totalUsers = searchResults.total;
    } else {
      // Show popular users when no search query
      const userResults = await databases.listDocuments(
        DATABASE_ID,
        'users',
        [
          Query.equal('isPrivate', false),
          Query.orderDesc('totalRatings'),
          Query.limit(limit + 1), // Get one extra to filter out current user
          Query.offset(offset)
        ]
      );

      users = userResults.documents.filter(user => user.$id !== currentUserId).slice(0, limit);
      totalUsers = userResults.total - (currentUserId ? 1 : 0); // Subtract current user from total
    }

    console.log(`Found ${users.length} users, total: ${totalUsers}`);

    return {
      users: users.map(user => ({
        ...user,
        joinedAt: user.$createdAt,
        lastActiveAt: user.lastActiveAt || user.$updatedAt
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