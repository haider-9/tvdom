import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID } from '$lib/appwrite';
import { ID, Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const postId = url.searchParams.get('postId');

		if (!postId) {
			return json({ error: 'Post ID is required' }, { status: 400 });
		}

		const comments = await databases.listDocuments(
			DATABASE_ID,
			'comments',
			[
				Query.equal('postId', postId),
				Query.orderDesc('$createdAt')
			]
		);

		// Get user data for each comment
		const commentsWithUsers = await Promise.all(
			comments.documents.map(async (comment) => {
				let user = null;
				try {
					user = await databases.getDocument(DATABASE_ID, 'users', comment.userId);
				} catch (error) {
					// User not found, continue without user data
				}
				
				return {
					...comment,
					user: user ? {
						$id: user.$id,
						username: user.username,
						displayName: user.displayName,
						avatar: user.avatar,
						isVerified: user.isVerified
					} : null
				};
			})
		);

		return json({ comments: commentsWithUsers });
	} catch (error) {
		console.error('Error fetching comments:', error);
		return json({ error: 'Failed to fetch comments' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { postId, userId, content } = data;

		if (!postId || !userId || !content) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newComment = await databases.createDocument(
			DATABASE_ID,
			'comments',
			ID.unique(),
			{
				postId,
				userId,
				content,
				likes: JSON.stringify([])
			}
		);

		// Increment comment count on post
		try {
			const post = await databases.getDocument(DATABASE_ID, 'posts', postId);
			await databases.updateDocument(
				DATABASE_ID,
				'posts',
				postId,
				{ commentCount: (post.commentCount || 0) + 1 }
			);
		} catch (error) {
			// Post might not exist, but comment was created successfully
			console.warn('Could not update post comment count:', error);
		}

		return json({
			success: true,
			comment: newComment
		});
	} catch (error) {
		console.error('Error creating comment:', error);
		return json({ error: 'Failed to create comment' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const commentId = url.searchParams.get('commentId');
		const userId = url.searchParams.get('userId');

		if (!commentId || !userId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		try {
			const comment = await databases.getDocument(DATABASE_ID, 'comments', commentId);
			
			if (comment.userId !== userId) {
				return json({ error: 'Unauthorized' }, { status: 403 });
			}

			await databases.deleteDocument(DATABASE_ID, 'comments', commentId);

			// Decrement comment count on post
			try {
				const post = await databases.getDocument(DATABASE_ID, 'posts', comment.postId);
				await databases.updateDocument(
					DATABASE_ID,
					'posts',
					comment.postId,
					{ commentCount: Math.max((post.commentCount || 1) - 1, 0) }
				);
			} catch (error) {
				// Post might not exist, but comment was deleted successfully
				console.warn('Could not update post comment count:', error);
			}

			return json({ success: true });
		} catch (error) {
			return json({ error: 'Comment not found' }, { status: 404 });
		}
	} catch (error) {
		console.error('Error deleting comment:', error);
		return json({ error: 'Failed to delete comment' }, { status: 500 });
	}
};
