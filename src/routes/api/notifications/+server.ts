import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { Notification } from '$lib/server/models/Notification';
import { User } from '$lib/server/models/User';
import mongoose from 'mongoose';

export const GET: RequestHandler = async ({ url, request }) => {
  try {
    await connectToDatabase();

    const userId = url.searchParams.get('userId');
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const unreadOnly = url.searchParams.get('unreadOnly') === 'true';

    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    // Build query
    const query: any = {
      $or: [
        { userId: userId },
        { userId: 'all' } // System notifications for all users
      ]
    };

    if (unreadOnly) {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset);

    return json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();

    const notificationData = await request.json();
    const { userId, type, title, message, data, read = false } = notificationData;

    if (!userId || !type || !title || !message) {
      return json({
        error: 'userId, type, title, and message are required'
      }, { status: 400 });
    }

    // Validate user exists (unless it's a system notification)
    if (userId !== 'all') {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return json({ error: 'Invalid user ID format' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return json({ error: 'User not found' }, { status: 404 });
      }
    }

    // Create notification
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      data: data || {},
      read
    });

    await notification.save();

    return json({ success: true, notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    return json({ error: 'Failed to create notification' }, { status: 500 });
  }
};

export const PATCH: RequestHandler = async ({ request }) => {
  try {
    await connectToDatabase();

    const { action, userId, notificationIds } = await request.json();

    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return json({ error: 'Invalid user ID format' }, { status: 400 });
    }

    let result;

    if (action === 'markAllRead') {
      // Mark all notifications as read for the user
      result = await Notification.updateMany(
        {
          $or: [
            { userId: userId },
            { userId: 'all' }
          ]
        },
        { read: true }
      );
    } else if (action === 'markRead' && notificationIds) {
      // Mark specific notifications as read
      result = await Notification.updateMany(
        {
          _id: { $in: notificationIds },
          $or: [
            { userId: userId },
            { userId: 'all' }
          ]
        },
        { read: true }
      );
    } else {
      return json({ error: 'Invalid action or missing parameters' }, { status: 400 });
    }

    return json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('Error updating notifications:', error);
    return json({ error: 'Failed to update notifications' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ url }) => {
  try {
    await connectToDatabase();

    const notificationId = url.searchParams.get('notificationId');
    const userId = url.searchParams.get('userId');

    if (!notificationId || !userId) {
      return json({
        error: 'Notification ID and User ID are required'
      }, { status: 400 });
    }

    // Validate ObjectId formats
    if (!mongoose.Types.ObjectId.isValid(notificationId) ||
        (userId !== 'all' && !mongoose.Types.ObjectId.isValid(userId))) {
      return json({ error: 'Invalid ID format' }, { status: 400 });
    }

    // Delete notification (ensure user owns it or it's a system notification)
    const deletedNotification = await Notification.findOneAndDelete({
      _id: notificationId,
      $or: [
        { userId: userId },
        { userId: 'all' }
      ]
    });

    if (!deletedNotification) {
      return json({ error: 'Notification not found' }, { status: 404 });
    }

    return json({ success: true });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return json({ error: 'Failed to delete notification' }, { status: 500 });
  }
};
