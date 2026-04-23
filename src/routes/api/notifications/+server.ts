import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID } from '$lib/appwrite';
import { ID, Query } from 'appwrite';
import { TMDB_API_KEY } from '$env/static/private';

const TMDB_BASE = 'https://api.themoviedb.org/3';

async function tmdb(endpoint: string) {
  const res = await fetch(`${TMDB_BASE}${endpoint}&api_key=${TMDB_API_KEY}`);
  if (!res.ok) return null;
  return res.json();
}

// Generate virtual notifications from TMDB data
async function getVirtualNotifications(userId: string): Promise<any[]> {
  const virtual: any[] = [];

  try {
    // 1. Get user's watchlist to check for new releases
    const watchlist = await databases.listDocuments(DATABASE_ID, 'watchlist', [
      Query.equal('userId', userId),
      Query.orderDesc('addedAt'),
      Query.limit(20),
    ]);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    for (const item of watchlist.documents) {
      try {
        const mediaType = item.mediaType || 'movie';
        const details = await tmdb(`/${mediaType}/${item.mediaId}?`);
        if (!details) continue;

        const releaseDate = new Date(
          details.release_date || details.first_air_date || ''
        );

        // New release in last 30 days
        if (releaseDate > thirtyDaysAgo && releaseDate <= new Date()) {
          virtual.push({
            id: `release_${item.mediaId}`,
            userId,
            type: 'new_release',
            title: '🎬 Now Available',
            message: `${details.title || details.name} is now out!`,
            data: {
              mediaId: String(item.mediaId),
              mediaTitle: details.title || details.name,
              mediaType,
              posterPath: details.poster_path,
            },
            read: false,
            createdAt: releaseDate,
            $createdAt: releaseDate,
            virtual: true,
          });
        }

        // Upcoming in next 30 days
        const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        if (releaseDate > new Date() && releaseDate <= thirtyDaysFromNow) {
          virtual.push({
            id: `upcoming_${item.mediaId}`,
            userId,
            type: 'upcoming',
            title: '📅 Coming Soon',
            message: `${details.title || details.name} releases on ${releaseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            data: {
              mediaId: String(item.mediaId),
              mediaTitle: details.title || details.name,
              mediaType,
              posterPath: details.poster_path,
            },
            read: false,
            createdAt: new Date(),
            $createdAt: new Date(),
            virtual: true,
          });
        }
      } catch { /* skip individual failures */ }
    }

    // 2. Trending today — show top 3 as discovery notifications
    const trending = await tmdb('/trending/all/day?');
    if (trending?.results) {
      const top = trending.results.slice(0, 3);
      for (const item of top) {
        virtual.push({
          id: `trending_${item.id}`,
          userId,
          type: 'trending',
          title: '🔥 Trending Now',
          message: `${item.title || item.name} is trending today`,
          data: {
            mediaId: String(item.id),
            mediaTitle: item.title || item.name,
            mediaType: item.media_type,
            posterPath: item.poster_path,
            rating: item.vote_average?.toFixed(1),
          },
          read: false,
          createdAt: new Date(),
          $createdAt: new Date(),
          virtual: true,
        });
      }
    }

    // 3. Activity from people the user follows
    try {
      const follows = await databases.listDocuments(DATABASE_ID, 'follows', [
        Query.equal('followerId', userId),
        Query.limit(20),
      ]);

      const followingIds = follows.documents.map((f: any) => f.followingId);

      if (followingIds.length > 0) {
        // Get recent ratings from followed users
        const recentRatings = await databases.listDocuments(DATABASE_ID, 'ratings', [
          Query.equal('userId', followingIds.slice(0, 5)), // Appwrite supports array in equal
          Query.orderDesc('$createdAt'),
          Query.limit(10),
        ]);

        for (const rating of recentRatings.documents) {
          // Get the user's display name
          try {
            const ratingUser = await databases.getDocument(DATABASE_ID, 'users', rating.userId);
            virtual.push({
              id: `activity_rating_${rating.$id}`,
              userId,
              type: 'activity',
              title: '⭐ Friend Activity',
              message: `${ratingUser.displayName} rated ${rating.mediaTitle || 'a title'} ${rating.rating}/10`,
              data: {
                actorId: rating.userId,
                actorName: ratingUser.displayName,
                actorAvatar: ratingUser.avatar,
                mediaId: rating.mediaId,
                mediaTitle: rating.mediaTitle,
                mediaType: rating.mediaType,
                rating: rating.rating,
              },
              read: false,
              createdAt: new Date(rating.$createdAt),
              $createdAt: new Date(rating.$createdAt),
              virtual: true,
            });
          } catch { /* skip */ }
        }
      }
    } catch { /* follows fetch failed */ }

  } catch (e) {
    console.error('Error generating virtual notifications:', e);
  }

  return virtual;
}

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
    const includeVirtual = url.searchParams.get('virtual') !== 'false';

    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch DB notifications
    const dbNotifications = await databases.listDocuments(
      DATABASE_ID,
      'notifications',
      [
        Query.or([
          Query.equal('userId', userId),
          Query.equal('userId', 'all'),
        ]),
        ...(unreadOnly ? [Query.equal('read', false)] : []),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset),
      ]
    );

    const dbItems = dbNotifications.documents.map((n: any) => ({
      ...n,
      id: n.$id,
      createdAt: new Date(n.$createdAt),
      virtual: false,
    }));

    // Fetch virtual notifications from TMDB + activity (only on first page, no unreadOnly filter)
    let virtualItems: any[] = [];
    if (includeVirtual && offset === 0 && !unreadOnly) {
      virtualItems = await getVirtualNotifications(userId);
    }

    // Merge and sort by date, DB notifications first for same timestamp
    const all = [...dbItems, ...virtualItems].sort(
      (a, b) => new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
    );

    return json({ notifications: all });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const notificationData = await request.json();
    const { userId, type, title, message, data, read = false } = notificationData;

    if (!userId || !type || !title || !message) {
      return json({
        error: 'userId, type, title, and message are required'
      }, { status: 400 });
    }

    // Validate user exists (unless it's a system notification)
    if (userId !== 'all') {
      try {
        await databases.getDocument(DATABASE_ID, 'users', userId);
      } catch (error) {
        return json({ error: 'User not found' }, { status: 404 });
      }
    }

    // Create notification
    const notification = await databases.createDocument(
      DATABASE_ID,
      'notifications',
      ID.unique(),
      {
        userId,
        type,
        title,
        message,
        data: JSON.stringify(data || {}),
        read
      }
    );

    return json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return json({ error: 'Failed to create notification' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request }) => {
  try {
    const { action, userId, notificationIds } = await request.json();

    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    let modifiedCount = 0;

    if (action === 'markAllRead') {
      // Get all notifications for the user
      const userNotifications = await databases.listDocuments(
        DATABASE_ID,
        'notifications',
        [
          Query.or([
            Query.equal('userId', userId),
            Query.equal('userId', 'all')
          ]),
          Query.equal('read', false)
        ]
      );

      // Update each notification to mark as read
      for (const notification of userNotifications.documents) {
        await databases.updateDocument(
          DATABASE_ID,
          'notifications',
          notification.$id,
          { read: true }
        );
        modifiedCount++;
      }
    } else if (action === 'markRead' && notificationIds) {
      // Mark specific notifications as read
      for (const notificationId of notificationIds) {
        try {
          // Verify the notification belongs to the user
          const notification = await databases.getDocument(
            DATABASE_ID,
            'notifications',
            notificationId
          );

          if (notification.userId === userId || notification.userId === 'all') {
            await databases.updateDocument(
              DATABASE_ID,
              'notifications',
              notificationId,
              { read: true }
            );
            modifiedCount++;
          }
        } catch (error) {
          // Skip if notification doesn't exist or user doesn't have access
          continue;
        }
      }
    } else {
      return json({ error: 'Invalid action or missing parameters' }, { status: 400 });
    }

    return json({ success: true, modifiedCount });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return json({ error: 'Failed to update notifications' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    const notificationId = url.searchParams.get('notificationId');
    const userId = url.searchParams.get('userId');

    if (!notificationId || !userId) {
      return json({
        error: 'Notification ID and User ID are required'
      }, { status: 400 });
    }

    try {
      // Get the notification to verify ownership
      const notification = await databases.getDocument(
        DATABASE_ID,
        'notifications',
        notificationId
      );

      // Check if user owns the notification or it's a system notification
      if (notification.userId !== userId && notification.userId !== 'all') {
        return json({ error: 'Notification not found' }, { status: 404 });
      }

      // Delete the notification
      await databases.deleteDocument(
        DATABASE_ID,
        'notifications',
        notificationId
      );

      return json({ success: true });
    } catch (error) {
      return json({ error: 'Notification not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting notification:', error);
    return json({ error: 'Failed to delete notification' }, { status: 500 });
  }
};
