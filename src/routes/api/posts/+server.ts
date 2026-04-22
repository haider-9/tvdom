import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID } from '$lib/appwrite';
import { ID, Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
	try {
		const userId = url.searchParams.get('userId');
		const postId = url.searchParams.get('postId');
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const offset = (page - 1) * limit;

		// Get single post
		if (postId) {
			try {
				const post = await databases.getDocument(DATABASE_ID, 'posts', postId);
				
				// Get user data
				let user = null;
				try {
					user = await databases.getDocument(DATABASE_ID, 'users', post.userId);
				} catch (error) {
					// User not found, continue without user data
				}

				return json({
					post: {
						...post,
						user: user ? {
							$id: user.$id,
							username: user.username,
							displayName: user.displayName,
							avatar: user.avatar,
							isVerified: user.isVerified
						} : null
					}
				});
			} catch (error) {
				return json({ error: 'Post not found' }, { status: 404 });
			}
		}

		// Build queries
		const queries = [
			Query.orderDesc('$createdAt'),
			Query.limit(limit),
			Query.offset(offset)
		];

		// Get user's posts
		if (userId) {
			queries.unshift(Query.equal('userId', userId));
		}

		const posts = await databases.listDocuments(DATABASE_ID, 'posts', queries);

		// Get user data for each post
		const postsWithUsers = await Promise.all(
			posts.documents.map(async (post) => {
				let user = null;
				try {
					user = await databases.getDocument(DATABASE_ID, 'users', post.userId);
				} catch (error) {
					// User not found, continue without user data
				}
				
				return {
					...post,
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

		return json({
			posts: postsWithUsers,
			pagination: {
				page,
				limit,
				total: posts.total,
				totalPages: Math.ceil(posts.total / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching posts:', error);
		return json({ error: 'Failed to fetch posts' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { userId, content, mediaId, mediaType, mediaTitle, mediaPoster, spoiler, images } = data;

		if (!userId || (!content && (!images || images.length === 0))) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		const newPost = await databases.createDocument(
			DATABASE_ID,
			'posts',
			ID.unique(),
			{
				userId,
				content: content || '',
				images: JSON.stringify(images || []),
				mediaId: mediaId || '',
				mediaType: mediaType || '',
				mediaTitle: mediaTitle || '',
				mediaPoster: mediaPoster || '',
				spoiler: spoiler || false,
				likes: JSON.stringify([]),
				commentCount: 0
			}
		);

		return json({
			success: true,
			post: newPost
		});
	} catch (error) {
		console.error('Error creating post:', error);
		return json({ error: 'Failed to create post' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	try {
		const data = await request.json();
		const { postId, userId, action } = data;

		if (!postId || !userId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Like/Unlike post
		if (action === 'like') {
			try {
				const post = await databases.getDocument(DATABASE_ID, 'posts', postId);
				
				const likes = JSON.parse(post.likes || '[]');
				const isLiked = likes.includes(userId);

				if (isLiked) {
					// Unlike
					const updatedLikes = likes.filter((id: string) => id !== userId);
					await databases.updateDocument(
						DATABASE_ID,
						'posts',
						postId,
						{ likes: JSON.stringify(updatedLikes) }
					);
				} else {
					// Like
					likes.push(userId);
					await databases.updateDocument(
						DATABASE_ID,
						'posts',
						postId,
						{ likes: JSON.stringify(likes) }
					);
				}

				return json({ success: true, liked: !isLiked });
			} catch (error) {
				return json({ error: 'Post not found' }, { status: 404 });
			}
		}

		// Update post content
		if (action === 'update') {
			const { content } = data;
			if (!content) {
				return json({ error: 'Content is required' }, { status: 400 });
			}

			try {
				await databases.updateDocument(
					DATABASE_ID,
					'posts',
					postId,
					{ content }
				);

				return json({ success: true });
			} catch (error) {
				return json({ error: 'Post not found or unauthorized' }, { status: 404 });
			}
		}

		return json({ error: 'Invalid action' }, { status: 400 });
	} catch (error) {
		console.error('Error updating post:', error);
		return json({ error: 'Failed to update post' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	try {
		const postId = url.searchParams.get('postId');
		const userId = url.searchParams.get('userId');

		if (!postId || !userId) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		try {
			// Verify ownership
			const post = await databases.getDocument(DATABASE_ID, 'posts', postId);
			
			if (post.userId !== userId) {
				return json({ error: 'Unauthorized' }, { status: 403 });
			}

			// Delete post
			await databases.deleteDocument(DATABASE_ID, 'posts', postId);

			// Delete associated comments
			const comments = await databases.listDocuments(
				DATABASE_ID,
				'comments',
				[Query.equal('postId', postId)]
			);

			for (const comment of comments.documents) {
				await databases.deleteDocument(DATABASE_ID, 'comments', comment.$id);
			}

			return json({ success: true });
		} catch (error) {
			return json({ error: 'Post not found' }, { status: 404 });
		}
	} catch (error) {
		console.error('Error deleting post:', error);
		return json({ error: 'Failed to delete post' }, { status: 500 });
	}
};
