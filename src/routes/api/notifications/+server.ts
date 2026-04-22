import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID } from '$lib/appwrite';
import { ID, Query } from 'appwrite';

export const GET: RequestHandler = async ({ url, request }) => {
  try {
    const userId = url.searchParams.get('userId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Build queries for user-specific and system notifications
    const queries = [
      Query.equal('userId', userId),
      Query.equal('userId', 'all') // System notifications for all users
    ];

    if (unreadOnly) {
      queries.push(Query.equal('read', false));
    }

    const notifications = await databases.listDocuments(
      DATABASE_ID,
      'notifications',
      [
        Query.or(queries.slice(0, 2)), // userId queries
        ...(unreadOnly ? [Query.equal('read', false)] : []),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
        Query.offset(offset)
      ]
    );

    return json({ notifications: notifications.documents });
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
