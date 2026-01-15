import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { connectToDatabase } from '$lib/server/database';
import { CurrentlyWatching } from '$lib/server/models/CurrentlyWatching';
import { User } from '$lib/server/models/User';

// Get currently watching items
export const GET: RequestHandler = async ({ url }) => {
	try {
		await connectToDatabase();

		const userId = url.searchParams.get('userId');
		const following = url.searchParams.get('following') === 'true';

		// Clean up old entries (older than 6 hours)
		const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
		await CurrentlyWatching.deleteMany({ lastActiveAt: { $lt: sixHoursAgo } });

		let query: any = {};

		if (userId && following) {
			// Get user's following list
			const user = await User.findOne({ username: userId });
			if (user && user.following) {
				const followingIds = user.following.map((f: any) => f.toString());
				query = { userId: { $in: followingIds } };
			}
		} else if (userId) {
			query = { userId };
		}

		const currentlyWatching = await CurrentlyWatching.find(query)
			.sort({ lastActiveAt: -1 })
			.limit(50)
			.lean();

		// Populate user data
		const userIds = [...new Set(currentlyWatching.map((item) => item.userId))];
		const users = await User.find({ _id: { $in: userIds } }).select(
			'username displayName avatar isVerified'
		);

		const usersMap = new Map(users.map((u) => [u._id.toString(), u]));

		const enrichedData = currentlyWatching.map((item) => ({
			...item,
			user: usersMap.get(item.userId)
		}));

		return json({ currentlyWatching: enrichedData });
	} catch (error) {
		console.error('Error fetching currently watching:', error);
		return json({ error: 'Failed to fetch currently watching' }, { status: 500 });
	}
};

// Update currently watching
export const POST: RequestHandler = async ({ request }) => {
	try {
		await connectToDatabase();

		const data = await request.json();
		const { userId, mediaId, mediaType, mediaTitle, mediaPoster, season, episode } = data;

		if (!userId || !mediaId || !mediaType || !mediaTitle) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Update or create currently watching entry
		const currentlyWatching = await CurrentlyWatching.findOneAndUpdate(
			{ userId, mediaId },
			{
				userId,
				mediaId,
				mediaType,
				mediaTitle,
				mediaPoster,
				season,
				episode,
				lastActiveAt: new Date(),
				$setOnInsert: { startedAt: new Date() }
			},
			{ upsert: true, new: true }
		);

		return json({ success: true, item: currentlyWatching });
	} catch (error) {
		console.error('Error updating currently watching:', error);
		return json({ error: 'Failed to update currently watching' }, { status: 500 });
	}
};

// Stop watching
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		await connectToDatabase();

		const userId = url.searchParams.get('userId');
		const mediaId = url.searchParams.get('mediaId');

		if (!userId || !mediaId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		await CurrentlyWatching.findOneAndDelete({ userId, mediaId });

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting currently watching:', error);
		return json({ error: 'Failed to delete currently watching' }, { status: 500 });
	}
};
