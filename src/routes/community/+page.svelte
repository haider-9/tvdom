<script lang="ts">
	import { MessageSquare, Heart, Send, Trash2, Users2, Image as ImageIcon, X, AlertTriangle, TrendingUp, Clock, Flame, Bookmark, Share2, MoreHorizontal } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import { userStore } from '$lib/stores/user.svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let posts = $state<any[]>([]);
	let isLoading = $state(true);
	let newPostContent = $state('');
	let isPosting = $state(false);
	let expandedComments = $state<Set<string>>(new Set());
	let commentInputs = $state<Map<string, string>>(new Map());
	let selectedImages = $state<File[]>([]);
	let imagePreviewUrls = $state<string[]>([]);
	let fileInputRef = $state<HTMLInputElement>();
	let lightboxImage = $state<string | null>(null);
	let uploadingImages = $state(false);
	let deleteDialogOpen = $state(false);
	let postToDelete = $state<string | null>(null);
	let activeFilter = $state<'latest' | 'trending' | 'following'>('latest');
	let communityStats = $state({ totalPosts: 0, totalUsers: 0, activeToday: 0 });
	let showScrollTop = $state(false);

	function handleScroll() {
		showScrollTop = window.scrollY > 500;
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function openLightbox(imageUrl: string) {
		lightboxImage = imageUrl;
	}

	function closeLightbox() {
		lightboxImage = null;
	}

	async function loadPosts() {
		try {
			const response = await fetch('/api/posts');
			const data = await response.json();
			posts = data.posts || [];
			
			// Calculate community stats
			communityStats.totalPosts = posts.length;
			const uniqueUsers = new Set(posts.map(p => p.userId));
			communityStats.totalUsers = uniqueUsers.size;
			
			// Count posts from today
			const today = new Date();
			today.setHours(0, 0, 0, 0);
			communityStats.activeToday = posts.filter(p => new Date(p.createdAt) >= today).length;
		} catch (error) {
			console.error('Error loading posts:', error);
			toast.error('Failed to load posts');
		} finally {
			isLoading = false;
		}
	}

	function filterPosts() {
		if (activeFilter === 'latest') {
			return posts;
		} else if (activeFilter === 'trending') {
			return [...posts].sort((a, b) => {
				const scoreA = (a.likes?.length || 0) * 2 + (a.commentCount || 0);
				const scoreB = (b.likes?.length || 0) * 2 + (b.commentCount || 0);
				return scoreB - scoreA;
			});
		} else if (activeFilter === 'following') {
			// Filter posts from users you follow
			const followingIds = userStore.userFollows?.map(f => f.id) || [];
			return posts.filter(p => followingIds.includes(p.userId));
		}
		return posts;
	}

	function handleImageSelect(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = Array.from(input.files || []);
		
		if (files.length + selectedImages.length > 4) {
			toast.error('Maximum 4 images allowed per post');
			return;
		}

		const validFiles = files.filter(file => {
			if (!file.type.startsWith('image/')) {
				toast.error(`${file.name} is not an image`);
				return false;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error(`${file.name} is too large (max 5MB)`);
				return false;
			}
			return true;
		});

		selectedImages = [...selectedImages, ...validFiles];
		
		// Create preview URLs
		validFiles.forEach(file => {
			const reader = new FileReader();
			reader.onload = (e) => {
				imagePreviewUrls = [...imagePreviewUrls, e.target?.result as string];
			};
			reader.readAsDataURL(file);
		});
	}

	function removeImage(index: number) {
		selectedImages = selectedImages.filter((_, i) => i !== index);
		imagePreviewUrls = imagePreviewUrls.filter((_, i) => i !== index);
	}

	async function uploadImages(): Promise<string[]> {
		if (selectedImages.length === 0) return [];

		uploadingImages = true;
		const uploadedUrls: string[] = [];
		const cloudName = 'dntncz9no';
		const uploadPreset = 'unsigned_preset';
		
		for (let i = 0; i < selectedImages.length; i++) {
			const file = selectedImages[i];
			const formData = new FormData();
			formData.append('file', file);
			formData.append('upload_preset', uploadPreset);
			formData.append('folder', 'tvdom_posts');

			try {
				toast.loading(`Uploading image ${i + 1} of ${selectedImages.length}...`);
				
				const response = await fetch(
					`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
					{
						method: 'POST',
						body: formData
					}
				);

				if (response.ok) {
					const data = await response.json();
					uploadedUrls.push(data.secure_url);
				} else {
					const error = await response.json();
					console.error('Cloudinary upload error:', error);
					toast.error(`Failed to upload image ${i + 1}`);
				}
			} catch (error) {
				console.error('Error uploading image:', error);
				toast.error(`Failed to upload image ${i + 1}`);
			}
		}

		uploadingImages = false;
		return uploadedUrls;
	}

	async function createPost() {
		if (!userStore.isAuthenticated) {
			toast.error('Please sign in to post');
			return;
		}

		if (!newPostContent.trim() && selectedImages.length === 0) {
			toast.error('Post cannot be empty');
			return;
		}

		isPosting = true;
		try {
			const userId = userStore.user?._id || userStore.user?.id;
			
			// Upload images first
			const imageUrls = await uploadImages();

			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					userId,
					content: newPostContent,
					images: imageUrls
				})
			});

			if (response.ok) {
				const data = await response.json();
				posts = [{
					...data.post,
					user: {
						_id: userStore.user?._id || userStore.user?.id,
						username: userStore.user?.username,
						displayName: userStore.user?.displayName,
						avatar: userStore.user?.avatar,
						isVerified: userStore.user?.isVerified
					}
				}, ...posts];
				newPostContent = '';
				selectedImages = [];
				imagePreviewUrls = [];
				toast.success('Post created!');
			} else {
				toast.error('Failed to create post');
			}
		} catch (error) {
			console.error('Error creating post:', error);
			toast.error('Failed to create post');
		} finally {
			isPosting = false;
		}
	}

	async function toggleLike(postId: string) {
		if (!userStore.isAuthenticated) {
			toast.error('Please sign in to like posts');
			return;
		}

		try {
			const userId = userStore.user?._id || userStore.user?.id;
			const response = await fetch('/api/posts', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postId,
					userId,
					action: 'like'
				})
			});

			if (response.ok) {
				const data = await response.json();
				const post = posts.find(p => p._id.toString() === postId);
				if (post) {
					if (data.liked) {
						post.likes = [...(post.likes || []), userId];
					} else {
						post.likes = (post.likes || []).filter((id: string) => id !== userId);
					}
				}
			}
		} catch (error) {
			console.error('Error toggling like:', error);
		}
	}

	async function deletePost(postId: string) {
		try {
			const userId = userStore.user?._id || userStore.user?.id;
			const response = await fetch(`/api/posts?postId=${postId}&userId=${userId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				posts = posts.filter(p => p._id.toString() !== postId);
				toast.success('Post deleted');
				deleteDialogOpen = false;
				postToDelete = null;
			} else {
				toast.error('Failed to delete post');
			}
		} catch (error) {
			console.error('Error deleting post:', error);
			toast.error('Failed to delete post');
		}
	}

	function openDeleteDialog(postId: string) {
		postToDelete = postId;
		deleteDialogOpen = true;
	}

	async function toggleComments(postId: string) {
		if (expandedComments.has(postId)) {
			expandedComments.delete(postId);
			expandedComments = new Set(expandedComments);
		} else {
			expandedComments.add(postId);
			expandedComments = new Set(expandedComments);
			await loadComments(postId);
		}
	}

	async function loadComments(postId: string) {
		try {
			const response = await fetch(`/api/comments?postId=${postId}`);
			const data = await response.json();
			const post = posts.find(p => p._id.toString() === postId);
			if (post) {
				post.comments = data.comments || [];
			}
		} catch (error) {
			console.error('Error loading comments:', error);
		}
	}

	async function addComment(postId: string) {
		if (!userStore.isAuthenticated) {
			toast.error('Please sign in to comment');
			return;
		}

		const content = commentInputs.get(postId);
		if (!content?.trim()) return;

		try {
			const userId = userStore.user?._id || userStore.user?.id;
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					postId,
					userId,
					content
				})
			});

			if (response.ok) {
				commentInputs.set(postId, '');
				await loadComments(postId);
				const post = posts.find(p => p._id.toString() === postId);
				if (post) {
					post.commentCount = (post.commentCount || 0) + 1;
				}
			}
		} catch (error) {
			console.error('Error adding comment:', error);
		}
	}

	function formatDate(date: string | Date) {
		const d = new Date(date);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return d.toLocaleDateString();
	}

	function isLiked(post: any) {
		const userId = userStore.user?._id || userStore.user?.id;
		return post.likes?.includes(userId) || false;
	}

	function isOwnPost(post: any) {
		const userId = userStore.user?._id || userStore.user?.id;
		return post.userId === userId;
	}

	$effect(() => {
		loadPosts();
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<svelte:head>
	<title>Community - TVDom</title>
</svelte:head>

<div class="community-page">
	<div class="container">
		<div class="header">
			<div class="header-content">
				<div class="header-icon">
					<Users2 class="w-8 h-8" />
				</div>
				<div class="header-text">
					<h1 class="title">Community</h1>
					<p class="subtitle">Connect with fellow movie and TV enthusiasts</p>
				</div>
			</div>
			
			<!-- Community Stats -->
			<div class="stats-grid">
				<div class="stat-card">
					<MessageSquare class="stat-icon" />
					<div class="stat-content">
						<div class="stat-value">{communityStats.totalPosts}</div>
						<div class="stat-label">Posts</div>
					</div>
				</div>
				<div class="stat-card">
					<Users2 class="stat-icon" />
					<div class="stat-content">
						<div class="stat-value">{communityStats.totalUsers}</div>
						<div class="stat-label">Contributors</div>
					</div>
				</div>
				<div class="stat-card">
					<Flame class="stat-icon" />
					<div class="stat-content">
						<div class="stat-value">{communityStats.activeToday}</div>
						<div class="stat-label">Today</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Filter Tabs -->
		<div class="filter-tabs">
			<button
				class="filter-tab {activeFilter === 'latest' ? 'active' : ''}"
				onclick={() => activeFilter = 'latest'}
			>
				<Clock class="w-4 h-4" />
				Latest
			</button>
			<button
				class="filter-tab {activeFilter === 'trending' ? 'active' : ''}"
				onclick={() => activeFilter = 'trending'}
			>
				<TrendingUp class="w-4 h-4" />
				Trending
			</button>
			{#if userStore.isAuthenticated}
				<button
					class="filter-tab {activeFilter === 'following' ? 'active' : ''}"
					onclick={() => activeFilter = 'following'}
				>
					<Heart class="w-4 h-4" />
					Following
				</button>
			{/if}
		</div>

		<!-- Create Post -->
		{#if userStore.isAuthenticated}
			<Card.Root>
				<Card.Content class="p-6">
					<div class="create-post-header">
						{#if userStore.user?.avatar}
							<img src={userStore.user.avatar} alt={userStore.user.displayName} class="create-avatar" />
						{:else}
							<div class="create-avatar-placeholder">
								{userStore.user?.displayName?.charAt(0) || 'U'}
							</div>
						{/if}
						<div class="create-post-input-wrapper">
							<Textarea
								bind:value={newPostContent}
								placeholder="What's on your mind? Share your thoughts about movies and TV shows..."
								rows={3}
								maxlength={500}
							/>
							{#if newPostContent.length > 0}
								<div class="char-count" class:warning={newPostContent.length > 450}>
									{newPostContent.length}/500
								</div>
							{/if}
						</div>
					</div>

					<!-- Image Previews -->
					{#if imagePreviewUrls.length > 0}
						<div class="image-preview-grid">
							{#each imagePreviewUrls as url, index}
								<div class="image-preview-item">
									<img src={url} alt="Preview {index + 1}" />
									<button
										class="remove-image-btn"
										onclick={() => removeImage(index)}
										type="button"
									>
										<X class="w-4 h-4" />
									</button>
								</div>
							{/each}
						</div>
					{/if}

					<div class="create-post-footer">
						<div class="post-actions-left">
							<input
								type="file"
								accept="image/*"
								multiple
								bind:this={fileInputRef}
								onchange={handleImageSelect}
								class="hidden-file-input"
							/>
							<Button
								variant="ghost"
								size="sm"
								onclick={() => fileInputRef?.click()}
								disabled={isPosting || uploadingImages || selectedImages.length >= 4}
								type="button"
							>
								<ImageIcon class="w-4 h-4" />
								<span class="hide-mobile">Images</span>
							</Button>
							{#if selectedImages.length > 0}
								<Badge variant="secondary" class="ml-2">
									{selectedImages.length}/4
								</Badge>
							{/if}
						</div>
						<Button onclick={createPost} disabled={isPosting || uploadingImages || (!newPostContent.trim() && selectedImages.length === 0)}>
							<Send class="w-4 h-4" />
							{uploadingImages ? 'Uploading...' : isPosting ? 'Posting...' : 'Post'}
						</Button>
					</div>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root>
				<Card.Content class="signin-prompt">
					<Users2 class="w-16 h-16 opacity-20" />
					<div class="signin-text-content">
						<h3>Join the Conversation</h3>
						<p>Sign in to share your thoughts and connect with the community</p>
					</div>
					<Button onclick={() => goto('/login')} size="lg">Sign In</Button>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Posts Feed -->
		<div class="posts-feed">
			{#if isLoading}
				<div class="loading-state">
					<div class="loading-spinner"></div>
					<p>Loading posts...</p>
				</div>
			{:else if filterPosts().length === 0}
				<Card.Root>
					<Card.Content class="empty-state">
						{#if activeFilter === 'following'}
							<Users2 class="w-20 h-20 opacity-20" />
							<div class="empty-text-content">
								<h3>No Posts from Following</h3>
								<p>Start following users to see their posts here</p>
							</div>
							<Button onclick={() => goto('/users')}>Find Users</Button>
						{:else}
							<MessageSquare class="w-20 h-20 opacity-20" />
							<div class="empty-text-content">
								<h3>No Posts Yet</h3>
								<p>Be the first to share your thoughts with the community!</p>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{:else}
				{#each filterPosts() as post (post._id)}
					<Card.Root>
						<Card.Content class="p-0">
							<!-- Post Header -->
							<div class="post-header">
								<a href="/user/{post.user?.username}" class="user-link">
									{#if post.user?.avatar}
										<img src={post.user.avatar} alt={post.user.displayName} class="user-avatar" />
									{:else}
										<div class="user-avatar-placeholder">
											{post.user?.displayName?.charAt(0) || 'U'}
										</div>
									{/if}
									<div class="user-info">
										<div class="user-name-row">
											<span class="user-name">{post.user?.displayName || 'Unknown User'}</span>
											{#if post.user?.isVerified}
												<svg class="verified-badge" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
												</svg>
											{/if}
										</div>
										<div class="post-meta">
											<span class="username">@{post.user?.username || 'unknown'}</span>
											<span class="separator">•</span>
											<span class="post-time">{formatDate(post.createdAt)}</span>
										</div>
									</div>
								</a>
								{#if isOwnPost(post)}
									<Button variant="ghost" size="sm" onclick={() => openDeleteDialog(post._id.toString())} class="delete-btn">
										<Trash2 class="w-4 h-4" />
									</Button>
								{/if}
							</div>

							<!-- Post Content -->
							<div class="post-body">
								{#if post.content}
									<p class="post-text">{post.content}</p>
								{/if}

								<!-- Post Images -->
								{#if post.images && post.images.length > 0}
									<div class="post-images {post.images.length === 1 ? 'single' : post.images.length === 2 ? 'double' : 'grid'}">
										{#each post.images as image, index}
											<div class="post-image-wrapper">
												<img 
													src={image} 
													alt="Post image {index + 1}" 
													class="post-image"
													onclick={() => openLightbox(image)}
												/>
											</div>
										{/each}
									</div>
								{/if}

								<!-- Engagement Stats -->
								{#if (post.likes?.length > 0 || post.commentCount > 0)}
									<div class="engagement-stats">
										{#if post.likes?.length > 0}
											<span class="engagement-item">
												<Heart class="w-3.5 h-3.5 fill-current text-red-500" />
												{post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
											</span>
										{/if}
										{#if post.commentCount > 0}
											<span class="engagement-item">
												{post.commentCount} {post.commentCount === 1 ? 'comment' : 'comments'}
											</span>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Post Actions -->
							<div class="post-actions-bar">
								<button
									onclick={() => toggleLike(post._id.toString())}
									class="action-btn {isLiked(post) ? 'liked' : ''}"
									title={isLiked(post) ? 'Unlike' : 'Like'}
								>
									<Heart class="w-5 h-5 {isLiked(post) ? 'fill-current' : ''}" />
									<span>{post.likes?.length || 0}</span>
								</button>
								<button
									onclick={() => toggleComments(post._id.toString())}
									class="action-btn"
									title="Comments"
								>
									<MessageSquare class="w-5 h-5" />
									<span>{post.commentCount || 0}</span>
								</button>
								<button
									class="action-btn"
									title="Share"
									onclick={() => {
										navigator.clipboard.writeText(window.location.origin + '/community#' + post._id);
										toast.success('Link copied to clipboard');
									}}
								>
									<Share2 class="w-5 h-5" />
								</button>
							</div>

							<!-- Comments Section -->
							{#if expandedComments.has(post._id.toString())}
								<div class="comments-section">
									<!-- Add Comment -->
									{#if userStore.isAuthenticated}
										<div class="add-comment">
											<div class="add-comment-wrapper">
												{#if userStore.user?.avatar}
													<img src={userStore.user.avatar} alt={userStore.user.displayName} class="comment-input-avatar" />
												{:else}
													<div class="comment-input-avatar-placeholder">
														{userStore.user?.displayName?.charAt(0) || 'U'}
													</div>
												{/if}
												<Textarea
													value={commentInputs.get(post._id.toString()) || ''}
													oninput={(e) => commentInputs.set(post._id.toString(), e.currentTarget.value)}
													placeholder="Write a comment..."
													rows={2}
												/>
											</div>
											<div class="add-comment-actions">
												<Button
													size="sm"
													onclick={() => addComment(post._id.toString())}
													disabled={!commentInputs.get(post._id.toString())?.trim()}
												>
													<Send class="w-3 h-3" />
													Comment
												</Button>
											</div>
										</div>
									{/if}

									<!-- Comments List -->
									<div class="comments-list">
										{#if post.comments && post.comments.length > 0}
											{#each post.comments as comment}
												<div class="comment">
													<a href="/user/{comment.user?.username}" class="comment-avatar-link">
														{#if comment.user?.avatar}
															<img src={comment.user.avatar} alt={comment.user.displayName} class="comment-avatar" />
														{:else}
															<div class="comment-avatar-placeholder">
																{comment.user?.displayName?.charAt(0) || 'U'}
															</div>
														{/if}
													</a>
													<div class="comment-content">
														<div class="comment-bubble">
															<div class="comment-header">
																<a href="/user/{comment.user?.username}" class="comment-user">
																	{comment.user?.displayName || 'Unknown User'}
																</a>
																<span class="comment-time">{formatDate(comment.createdAt)}</span>
															</div>
															<p class="comment-text">{comment.content}</p>
														</div>
													</div>
												</div>
											{/each}
										{:else}
											<div class="no-comments">
												<MessageSquare class="w-8 h-8 opacity-20" />
												<p>No comments yet. Be the first to comment!</p>
											</div>
										{/if}
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				{/each}
			{/if}
		</div>
	</div>
</div>

<!-- Image Lightbox -->
{#if lightboxImage}
	<div class="lightbox" onclick={closeLightbox}>
		<button class="lightbox-close" onclick={closeLightbox}>
			<X class="w-6 h-6" />
		</button>
		<img src={lightboxImage} alt="Full size" class="lightbox-image" onclick={(e) => e.stopPropagation()} />
	</div>
{/if}

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<div class="flex items-center gap-3 mb-2">
				<div class="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
					<AlertTriangle class="w-6 h-6 text-red-600 dark:text-red-500" />
				</div>
				<div>
					<Dialog.Title class="text-lg font-semibold">Delete Post</Dialog.Title>
					<Dialog.Description class="text-sm text-muted-foreground mt-1">
						This action cannot be undone
					</Dialog.Description>
				</div>
			</div>
		</Dialog.Header>
		<div class="py-4">
			<p class="text-sm text-foreground">
				Are you sure you want to delete this post? This will permanently remove the post and all its comments.
			</p>
		</div>
		<Dialog.Footer class="flex gap-2 sm:gap-2">
			<Button
				variant="outline"
				onclick={() => {
					deleteDialogOpen = false;
					postToDelete = null;
				}}
				class="flex-1"
			>
				Cancel
			</Button>
			<Button
				variant="destructive"
				onclick={() => postToDelete && deletePost(postToDelete)}
				class="flex-1"
			>
				<Trash2 class="w-4 h-4 mr-2" />
				Delete
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<!-- Scroll to Top Button -->
{#if showScrollTop}
	<button class="scroll-to-top" onclick={scrollToTop} title="Scroll to top">
		<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
		</svg>
	</button>
{/if}

<style>
	.community-page {
		min-height: 100vh;
		padding: 2rem 0 4rem;
	}

	.container {
		max-width: 680px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	/* Header */
	.header {
		margin-bottom: 2rem;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.header-icon {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 1rem;
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.header-text {
		flex: 1;
	}

	.title {
		font-size: 1.875rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		margin: 0;
	}

	.subtitle {
		font-size: 0.9375rem;
		color: hsl(var(--muted-foreground));
		margin: 0.25rem 0 0;
	}

	/* Community Stats */
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 1rem;
	}

	.stat-card {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.75rem;
		transition: all 0.2s;
	}

	.stat-card:hover {
		border-color: hsl(var(--primary) / 0.3);
		box-shadow: 0 2px 8px hsl(var(--primary) / 0.1);
	}

	.stat-icon {
		width: 2.5rem;
		height: 2.5rem;
		padding: 0.5rem;
		border-radius: 0.5rem;
		background: hsl(var(--primary) / 0.1);
		color: hsl(var(--primary));
	}

	.stat-content {
		flex: 1;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: hsl(var(--foreground));
		line-height: 1;
	}

	.stat-label {
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
		margin-top: 0.25rem;
	}

	/* Filter Tabs */
	.filter-tabs {
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.filter-tab {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.625rem 1rem;
		border-radius: 0.5rem;
		background: transparent;
		border: none;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.filter-tab:hover {
		background: hsl(var(--background));
		color: hsl(var(--foreground));
	}

	.filter-tab.active {
		background: hsl(var(--background));
		color: hsl(var(--primary));
		box-shadow: 0 1px 3px hsl(var(--foreground) / 0.1);
	}

	/* Create Post */
	.create-post-header {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}

	.create-post-input-wrapper {
		flex: 1;
		position: relative;
	}

	.char-count {
		position: absolute;
		bottom: 0.5rem;
		right: 0.75rem;
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
		background: hsl(var(--background));
		padding: 0.25rem 0.5rem;
		border-radius: 0.25rem;
		pointer-events: none;
	}

	.char-count.warning {
		color: hsl(38, 92%, 50%);
		font-weight: 600;
	}

	.create-avatar,
	.create-avatar-placeholder {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.create-avatar {
		object-fit: cover;
		border: 2px solid hsl(var(--border));
	}

	.create-avatar-placeholder {
		background: hsl(var(--primary));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1rem;
	}

	.create-post-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: 0.75rem;
		border-top: 1px solid hsl(var(--border));
	}

	.post-actions-left {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.hidden-file-input {
		display: none;
	}

	/* Image Previews */
	.image-preview-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 0.75rem;
		margin-top: 1rem;
		padding: 1rem;
		background: hsl(var(--muted) / 0.3);
		border-radius: 0.5rem;
	}

	.image-preview-item {
		position: relative;
		aspect-ratio: 1;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 2px solid hsl(var(--border));
	}

	.image-preview-item img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.remove-image-btn {
		position: absolute;
		top: 0.375rem;
		right: 0.375rem;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 50%;
		background: hsl(0, 0%, 0%, 0.7);
		color: white;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: background 0.2s;
	}

	.remove-image-btn:hover {
		background: hsl(0, 84%, 60%);
	}

	/* Sign In Prompt */
	.signin-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 3.5rem 2rem;
		text-align: center;
	}

	.signin-text-content h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0 0 0.5rem;
	}

	.signin-text-content p {
		font-size: 0.9375rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	/* Posts Feed */
	.posts-feed {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: 1.5rem;
	}

	.posts-feed > :global(*) {
		animation: fadeInUp 0.4s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 4rem 2rem;
		color: hsl(var(--muted-foreground));
	}

	.loading-spinner {
		width: 2.5rem;
		height: 2.5rem;
		border: 3px solid hsl(var(--border));
		border-top-color: hsl(var(--primary));
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.25rem;
		padding: 4rem 2rem;
		text-align: center;
	}

	.empty-text-content h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin: 0 0 0.5rem;
	}

	.empty-text-content p {
		font-size: 0.9375rem;
		color: hsl(var(--muted-foreground));
		margin: 0;
	}

	/* Post Card */
	.post-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.25rem 1.25rem 0;
	}

	.user-link {
		display: flex;
		gap: 0.75rem;
		text-decoration: none;
		color: inherit;
		flex: 1;
		min-width: 0;
		transition: opacity 0.2s;
	}

	.user-link:hover {
		opacity: 0.8;
	}

	.user-link:hover .user-name {
		text-decoration: underline;
	}

	.user-avatar,
	.user-avatar-placeholder {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.user-avatar {
		object-fit: cover;
		border: 2px solid hsl(var(--border));
	}

	.user-avatar-placeholder {
		background: hsl(var(--primary));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 1.125rem;
	}

	.user-info {
		flex: 1;
		min-width: 0;
	}

	.user-name-row {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		margin-bottom: 0.125rem;
	}

	.user-name {
		font-weight: 600;
		font-size: 0.9375rem;
		color: hsl(var(--foreground));
	}

	.verified-badge {
		width: 1.125rem;
		height: 1.125rem;
		color: hsl(221, 83%, 53%);
		flex-shrink: 0;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
	}

	.username {
		color: hsl(var(--muted-foreground));
	}

	.separator {
		opacity: 0.5;
	}

	.post-time {
		color: hsl(var(--muted-foreground));
	}

	.delete-btn {
		color: hsl(var(--muted-foreground));
		opacity: 0.6;
		transition: opacity 0.2s;
	}

	.delete-btn:hover {
		opacity: 1;
		color: hsl(0, 84%, 60%);
	}

	.post-body {
		padding: 1rem 1.25rem;
	}

	.post-text {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: hsl(var(--foreground));
		white-space: pre-wrap;
		word-wrap: break-word;
		margin: 0;
	}

	/* Post Images */
	.post-images {
		margin-top: 1rem;
		border-radius: 0.75rem;
		overflow: hidden;
	}

	.post-images.single {
		max-width: 100%;
	}

	.post-images.double {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.25rem;
	}

	.post-images.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.25rem;
	}

	.post-image-wrapper {
		position: relative;
		width: 100%;
		overflow: hidden;
		background: hsl(var(--muted));
	}

	.post-images.single .post-image-wrapper {
		max-height: 500px;
	}

	.post-images.double .post-image-wrapper,
	.post-images.grid .post-image-wrapper {
		aspect-ratio: 1;
	}

	.post-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		cursor: pointer;
		transition: transform 0.3s;
	}

	.post-image:hover {
		transform: scale(1.02);
	}

	/* Engagement Stats */
	.engagement-stats {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-top: 0.75rem;
		margin-top: 0.75rem;
		border-top: 1px solid hsl(var(--border));
		font-size: 0.8125rem;
		color: hsl(var(--muted-foreground));
	}

	.engagement-item {
		display: flex;
		align-items: center;
		gap: 0.375rem;
	}

	/* Post Actions */
	.post-actions-bar {
		display: flex;
		gap: 0.25rem;
		padding: 0.5rem 0.75rem;
		border-top: 1px solid hsl(var(--border));
	}

	.action-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		border-radius: 0.5rem;
		background: transparent;
		border: none;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
	}

	.action-btn:hover {
		background: hsl(var(--accent));
		color: hsl(var(--foreground));
	}

	.action-btn.liked {
		color: hsl(0, 84%, 60%);
	}

	.action-btn.liked:hover {
		background: hsl(0, 84%, 60%, 0.1);
	}

	/* Comments Section */
	.comments-section {
		padding: 1rem 1.25rem 1.25rem;
		background: hsl(var(--muted) / 0.3);
		border-top: 1px solid hsl(var(--border));
	}

	.add-comment {
		margin-bottom: 1.25rem;
	}

	.add-comment-wrapper {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.comment-input-avatar,
	.comment-input-avatar-placeholder {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 0.25rem;
	}

	.comment-input-avatar {
		object-fit: cover;
		border: 2px solid hsl(var(--border));
	}

	.comment-input-avatar-placeholder {
		background: hsl(var(--primary));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.75rem;
	}

	.add-comment-actions {
		display: flex;
		justify-content: flex-end;
	}

	.comments-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.comment {
		display: flex;
		gap: 0.75rem;
	}

	.comment-avatar-link {
		flex-shrink: 0;
	}

	.comment-avatar,
	.comment-avatar-placeholder {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}

	.comment-avatar {
		object-fit: cover;
		border: 2px solid hsl(var(--border));
	}

	.comment-avatar-placeholder {
		background: hsl(var(--primary));
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.75rem;
	}

	.comment-content {
		flex: 1;
		min-width: 0;
	}

	.comment-bubble {
		background: hsl(var(--background));
		border: 1px solid hsl(var(--border));
		border-radius: 1rem;
		padding: 0.75rem 1rem;
	}

	.comment-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.375rem;
	}

	.comment-user {
		font-weight: 600;
		font-size: 0.8125rem;
		color: hsl(var(--foreground));
		text-decoration: none;
	}

	.comment-user:hover {
		text-decoration: underline;
	}

	.comment-time {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}

	.comment-text {
		font-size: 0.875rem;
		line-height: 1.5;
		color: hsl(var(--foreground));
		white-space: pre-wrap;
		word-wrap: break-word;
		margin: 0;
	}

	.no-comments {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 2.5rem 1rem;
		text-align: center;
		color: hsl(var(--muted-foreground));
	}

	.no-comments p {
		font-size: 0.875rem;
		margin: 0;
	}

	/* Scroll to Top Button */
	.scroll-to-top {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: hsl(var(--primary));
		color: white;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		box-shadow: 0 4px 12px hsl(var(--primary) / 0.3);
		transition: all 0.3s;
		z-index: 50;
		animation: slideUp 0.3s ease-out;
	}

	@keyframes slideUp {
		from {
			transform: translateY(100px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.scroll-to-top:hover {
		transform: translateY(-4px);
		box-shadow: 0 6px 16px hsl(var(--primary) / 0.4);
	}

	.scroll-to-top:active {
		transform: translateY(-2px);
	}

	/* Image Lightbox */
	.lightbox {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.95);
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		cursor: zoom-out;
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.lightbox-close {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10000;
	}

	.lightbox-close:hover {
		background: rgba(255, 255, 255, 0.2);
		transform: scale(1.1);
	}

	.lightbox-image {
		max-width: 90%;
		max-height: 90%;
		object-fit: contain;
		border-radius: 0.5rem;
		cursor: default;
		animation: zoomIn 0.3s ease-out;
	}

	@keyframes zoomIn {
		from {
			transform: scale(0.9);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}

	/* Responsive */
	@media (max-width: 640px) {
		.community-page {
			padding: 1.5rem 0 3rem;
		}

		.container {
			padding: 0 0.75rem;
		}

		.header-icon {
			width: 3rem;
			height: 3rem;
		}

		.title {
			font-size: 1.5rem;
		}

		.subtitle {
			font-size: 0.875rem;
		}

		.post-hint {
			display: none;
		}

		.hide-mobile {
			display: none;
		}

		.image-preview-grid {
			grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
		}

		.stats-grid {
			grid-template-columns: repeat(3, 1fr);
			gap: 0.75rem;
		}

		.stat-card {
			padding: 0.75rem;
		}

		.stat-icon {
			width: 2rem;
			height: 2rem;
			padding: 0.375rem;
		}

		.stat-value {
			font-size: 1.25rem;
		}

		.stat-label {
			font-size: 0.75rem;
		}

		.filter-tab {
			font-size: 0.8125rem;
			padding: 0.5rem 0.75rem;
		}

		.filter-tab span {
			display: none;
		}

		.post-header {
			padding: 1rem 1rem 0;
		}

		.post-body {
			padding: 0.875rem 1rem;
		}

		.comments-section {
			padding: 1rem;
		}
	}
</style>
