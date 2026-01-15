import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongodb';
import { ObjectId } from 'mongodb';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const client = await clientPromise;
		const db = client.db('tvdom');
		const commentsCollection = db.collection('comments');

		const postId = url.searchParams.get('postId');

		if (!postId) {
			return json({ error: 'Post ID is required' }, { status: 400 });
		}

		const comments = await commentsCollection
			.find({ postId })
			.sort({ createdAt: -1 })
			.toArray();

		// Populate user data
		const usersCollection = db.collection('users');
		const commentsWithUsers = await Promise.all(
			comments.map(async (comment) => {
				const user = await usersCollection.findOne({ _id: new ObjectId(comment.userId) });
				return {
					...comment,
					user: user ? {
						_id: user._id,
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
		const client = await clientPromise;
		const db = client.db('tvdom');
		const commentsCollection = db.collection('comments');
		const postsCollection = db.collection('posts');

		const data = await request.json();
		const { postId, userId, content } = data;

		if (!postId || !userId || !content) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newComment = {
			postId,
			userId,
			content,
			likes: [],
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const result = await commentsCollection.insertOne(newComment);

		// Increment comment count on post
		await postsCollection.updateOne(
			{ _id: new ObjectId(postId) },
			{ $inc: { commentCount: 1 } }
		);

		return json({
			success: true,
			comment: {
				_id: result.insertedId,
				...newComment
			}
		});
	} catch (error) {
		console.error('Error creating comment:', error);
		return json({ error: 'Failed to create comment' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const client = await clientPromise;
		const db = client.db('tvdom');
		const commentsCollection = db.collection('comments');
		const postsCollection = db.collection('posts');

		const commentId = url.searchParams.get('commentId');
		const userId = url.searchParams.get('userId');

		if (!commentId || !userId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const comment = await commentsCollection.findOne({ _id: new ObjectId(commentId) });
		if (!comment) {
			return json({ error: 'Comment not found' }, { status: 404 });
		}

		if (comment.userId !== userId) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		await commentsCollection.deleteOne({ _id: new ObjectId(commentId) });

		// Decrement comment count on post
		await postsCollection.updateOne(
			{ _id: new ObjectId(comment.postId) },
			{ $inc: { commentCount: -1 } }
		);

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting comment:', error);
		return json({ error: 'Failed to delete comment' }, { status: 500 });
	}
};
