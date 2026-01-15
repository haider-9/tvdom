import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import clientPromise from '$lib/server/mongodb';
import { ObjectId } from 'mongodb';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const client = await clientPromise;
		const db = client.db('tvdom');
		const postsCollection = db.collection('posts');

		const userId = url.searchParams.get('userId');
		const postId = url.searchParams.get('postId');
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const skip = (page - 1) * limit;

		// Get single post
		if (postId) {
			const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
			if (!post) {
				return json({ error: 'Post not found' }, { status: 404 });
			}

			// Populate user data
			const usersCollection = db.collection('users');
			const user = await usersCollection.findOne({ _id: new ObjectId(post.userId) });

			return json({
				post: {
					...post,
					user: user ? {
						_id: user._id,
						username: user.username,
						displayName: user.displayName,
						avatar: user.avatar,
						isVerified: user.isVerified
					} : null
				}
			});
		}

		// Get user's posts
		if (userId) {
			const posts = await postsCollection
				.find({ userId })
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit)
				.toArray();

			const total = await postsCollection.countDocuments({ userId });

			return json({
				posts,
				pagination: {
					page,
					limit,
					total,
					totalPages: Math.ceil(total / limit)
				}
			});
		}

		// Get all posts (feed)
		const posts = await postsCollection
			.find({})
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit)
			.toArray();

		// Populate user data for each post
		const usersCollection = db.collection('users');
		const postsWithUsers = await Promise.all(
			posts.map(async (post) => {
				const user = await usersCollection.findOne({ _id: new ObjectId(post.userId) });
				return {
					...post,
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

		const total = await postsCollection.countDocuments({});

		return json({
			posts: postsWithUsers,
			pagination: {
				page,
				limit,
				total,
				totalPages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching posts:', error);
		return json({ error: 'Failed to fetch posts' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const client = await clientPromise;
		const db = client.db('tvdom');
		const postsCollection = db.collection('posts');

		const data = await request.json();
		const { userId, content, mediaId, mediaType, mediaTitle, mediaPoster, spoiler, images } = data;

		if (!userId || (!content && (!images || images.length === 0))) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newPost = {
			userId,
			content: content || '',
			images: images || [],
			mediaId: mediaId || null,
			mediaType: mediaType || null,
			mediaTitle: mediaTitle || null,
			mediaPoster: mediaPoster || null,
			spoiler: spoiler || false,
			likes: [],
			commentCount: 0,
			createdAt: new Date(),
			updatedAt: new Date()
		};

		const result = await postsCollection.insertOne(newPost);

		return json({
			success: true,
			post: {
				_id: result.insertedId,
				...newPost
			}
		});
	} catch (error) {
		console.error('Error creating post:', error);
		return json({ error: 'Failed to create post' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const client = await clientPromise;
		const db = client.db('tvdom');
		const postsCollection = db.collection('posts');

		const data = await request.json();
		const { postId, userId, action } = data;

		if (!postId || !userId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Like/Unlike post
		if (action === 'like') {
			const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
			if (!post) {
				return json({ error: 'Post not found' }, { status: 404 });
			}

			const likes = post.likes || [];
			const isLiked = likes.includes(userId);

			if (isLiked) {
				// Unlike
				await postsCollection.updateOne(
					{ _id: new ObjectId(postId) },
					{ $pull: { likes: userId } }
				);
			} else {
				// Like
				await postsCollection.updateOne(
					{ _id: new ObjectId(postId) },
					{ $addToSet: { likes: userId } }
				);
			}

			return json({ success: true, liked: !isLiked });
		}

		// Update post content
		if (action === 'update') {
			const { content } = data;
			if (!content) {
				return json({ error: 'Content is required' }, { status: 400 });
			}

			await postsCollection.updateOne(
				{ _id: new ObjectId(postId), userId },
				{ $set: { content, updatedAt: new Date() } }
			);

			return json({ success: true });
		}

		return json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.error('Error updating post:', error);
		return json({ error: 'Failed to update post' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const client = await clientPromise;
		const db = client.db('tvdom');
		const postsCollection = db.collection('posts');
		const commentsCollection = db.collection('comments');

		const postId = url.searchParams.get('postId');
		const userId = url.searchParams.get('userId');

		if (!postId || !userId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Verify ownership
		const post = await postsCollection.findOne({ _id: new ObjectId(postId) });
		if (!post) {
			return json({ error: 'Post not found' }, { status: 404 });
		}

		if (post.userId !== userId) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		// Delete post and its comments
		await postsCollection.deleteOne({ _id: new ObjectId(postId) });
		await commentsCollection.deleteMany({ postId });

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting post:', error);
		return json({ error: 'Failed to delete post' }, { status: 500 });
	}
};
