import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID, COLLECTIONS, ID } from '$lib/appwrite.js';
import { Query } from 'appwrite';

// Get currently watching items
export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		const following = url.searchParams.get('following') === 'true';

		// Clean up old entries (older than 6 hours)
		const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
		
		try {
			const oldEntries = await databases.listDocuments(
				DATABASE_ID,
				COLLECTIONS.CURRENTLY_WATCHING,
				[Query.lessThan('lastWatchedAt', sixHoursAgo)]
			);

			// Delete old entries
			for (const entry of oldEntries.documents) {
				await databases.deleteDocument(
					DATABASE_ID,
					COLLECTIONS.CURRENTLY_WATCHING,
					entry.$id
				);
			}
		} catch (cleanupError) {
			console.error('Error cleaning up old entries:', cleanupError);
		}

		let queries = [Query.orderDesc('lastWatchedAt'), Query.limit(50)];

		if (userId && following) {
			// Get user's following list
			try {
				const userFollows = await databases.listDocuments(
					DATABASE_ID,
					COLLECTIONS.FOLLOWS,
					[Query.equal('followerId', userId)]
				);
				
				const followingIds = userFollows.documents.map((f: any) => f.followingId);
				if (followingIds.length > 0) {
					queries.unshift(Query.equal('userId', followingIds));
				} else {
					// No following, return empty
					return json({ currentlyWatching: [] });
				}
			} catch (followError) {
				console.error('Error fetching follows:', followError);
				return json({ currentlyWatching: [] });
			}
		} else if (userId) {
			queries.unshift(Query.equal('userId', userId));
		}

		const currentlyWatching = await databases.listDocuments(
			DATABASE_ID,
			COLLECTIONS.CURRENTLY_WATCHING,
			queries
		);

		// Get user data for each entry
		const userIds = [...new Set(currentlyWatching.documents.map((item: any) => item.userId))];
		const enrichedData = [];

		for (const item of currentlyWatching.documents) {
			try {
				const user = await databases.getDocument(DATABASE_ID, COLLECTIONS.USERS, item.userId);
				enrichedData.push({
					...item,
					user: {
						username: user.username,
						displayName: user.displayName,
						avatar: user.avatar,
						isVerified: user.isVerified
					}
				});
			} catch (userError) {
				// If user not found, skip this entry
				console.error('User not found for currently watching entry:', userError);
			}
		}

		return json({ currentlyWatching: enrichedData });
	} catch (error: any) {
		console.error('Error fetching currently watching:', error);
		return json({ error: 'Failed to fetch currently watching' }, { status: 500 });
	}
};

// Update currently watching
export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { userId, mediaId, mediaType, mediaTitle, mediaPoster, season, episode } = data;

		if (!userId || !mediaId || !mediaType || !mediaTitle) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Ensure mediaId is always a string for Appwrite queries
		const mediaIdStr = String(mediaId);

		// Check if entry already exists
		const existingEntries = await databases.listDocuments(
			DATABASE_ID,
			COLLECTIONS.CURRENTLY_WATCHING,
			[
				Query.equal('userId', userId),
				Query.equal('mediaId', mediaIdStr),
				Query.limit(1)
			]
		);

		let currentlyWatching;

		if (existingEntries.documents.length > 0) {
			// Update existing entry
			currentlyWatching = await databases.updateDocument(
				DATABASE_ID,
				COLLECTIONS.CURRENTLY_WATCHING,
				existingEntries.documents[0].$id,
				{
					mediaType,
					mediaTitle,
					mediaPoster: mediaPoster || '',
					season: season || 0,
					episode: episode || 0,
					lastWatchedAt: new Date().toISOString()
				}
			);
		} else {
			// Create new entry
			currentlyWatching = await databases.createDocument(
				DATABASE_ID,
				COLLECTIONS.CURRENTLY_WATCHING,
				ID.unique(),
				{
					userId,
					mediaId: mediaIdStr,
					mediaType,
					mediaTitle,
					mediaPoster: mediaPoster || '',
					season: season || 0,
					episode: episode || 0,
					startedAt: new Date().toISOString(),
					lastWatchedAt: new Date().toISOString(),
					progress: 0,
					totalDuration: 0
				}
			);
		}

		return json({ success: true, item: currentlyWatching });
	} catch (error: any) {
		console.error('Error updating currently watching:', error);
		return json({ error: 'Failed to update currently watching' }, { status: 500 });
	}
};

// Stop watching
export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		const mediaId = url.searchParams.get('mediaId');

		if (!userId || !mediaId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Find and delete the entry
		const existingEntries = await databases.listDocuments(
			DATABASE_ID,
			COLLECTIONS.CURRENTLY_WATCHING,
			[
				Query.equal('userId', userId),
				Query.equal('mediaId', mediaId),
				Query.limit(1)
			]
		);

		if (existingEntries.documents.length > 0) {
			await databases.deleteDocument(
				DATABASE_ID,
				COLLECTIONS.CURRENTLY_WATCHING,
				existingEntries.documents[0].$id
			);
		}

		return json({ success: true });
	} catch (error: any) {
		console.error('Error deleting currently watching:', error);
		return json({ error: 'Failed to delete currently watching' }, { status: 500 });
	}
};
