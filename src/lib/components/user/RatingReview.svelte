<script lang="ts">
	import { userStore } from '$lib/stores/user.svelte.js';
	import {
		Star,
		Heart,
		MessageCircle,
		ThumbsUp,
		ThumbsDown,
		Flag,
		Edit3,
		Trash2,
		Eye,
		EyeOff,
		Calendar,
		Tag,
		MoreHorizontal
	} from 'lucide-svelte';
	import type { Rating, Review } from '$lib/user-types.js';

	// Props
	let {
		mediaId,
		mediaType,
		mediaTitle,
		mediaPoster,
		existingRating,
		showReviewForm = false
	}: {
		mediaId: string;
		mediaType: 'movie' | 'tv';
		mediaTitle: string;
		mediaPoster?: string;
		existingRating?: Rating;
		showReviewForm?: boolean;
	} = $props();

	// Local state using Svelte 5 runes
	let isRating = $state(false);
	let isReviewing = $state(showReviewForm);
	let selectedRating = $state(existingRating?.rating || 0);
	let hoverRating = $state(0);
	let reviewText = $state(existingRating?.review || '');
	let isSpoiler = $state(existingRating?.isSpoiler || false);
	let reviewTags = $state<string[]>(existingRating?.tags || []);
	let rewatched = $state(existingRating?.rewatched || false);
	let watchedDate = $state<string>(existingRating?.watchedDate?.toISOString().split('T')[0] || '');
	let isSubmitting = $state(false);
	let showTagInput = $state(false);
	let newTag = $state('');
	let showMoreOptions = $state(false);

	// Computed values
	let hasUserRated = $derived(!!existingRating);
	let canSubmit = $derived(selectedRating > 0);
	let isOwnRating = $derived(existingRating?.userId === userStore.user?.id);

	// Predefined tags
	const commonTags = [
		'Masterpiece',
		'Overrated',
		'Underrated',
		'Boring',
		'Exciting',
		'Emotional',
		'Funny',
		'Scary',
		'Thought-provoking',
		'Visually stunning',
		'Great acting',
		'Poor writing',
		'Amazing soundtrack',
		'Confusing plot',
		'Rewatchable'
	];

	// Rating labels
	const ratingLabels = {
		1: 'Terrible',
		2: 'Poor',
		3: 'Bad',
		4: 'Below Average',
		5: 'Average',
		6: 'Above Average',
		7: 'Good',
		8: 'Very Good',
		9: 'Excellent',
		10: 'Masterpiece'
	};

	function handleStarHover(rating: number) {
		hoverRating = rating;
	}

	function handleStarLeave() {
		hoverRating = 0;
	}

	function handleStarClick(rating: number) {
		selectedRating = rating;
		if (!isReviewing && userStore.isAuthenticated) {
			submitRating();
		}
	}

	async function submitRating() {
		if (!canSubmit || !userStore.isAuthenticated) return;

		isSubmitting = true;
		try {
			if (hasUserRated) {
				await userStore.updateRating(
					existingRating!.id,
					selectedRating,
					reviewText || undefined
				);
			} else {
				await userStore.addRating(
					mediaId,
					mediaType,
					selectedRating,
					reviewText || undefined
				);
			}

			// Close review form after successful submission
			if (isReviewing) {
				isReviewing = false;
			}
		} finally {
			isSubmitting = false;
		}
	}

	async function submitReview() {
		if (!canSubmit || !userStore.isAuthenticated) return;

		isSubmitting = true;
		try {
			const review = reviewText.trim() || undefined;

			if (hasUserRated) {
				await userStore.updateRating(existingRating!.id, selectedRating, review);
			} else {
				await userStore.addRating(mediaId, mediaType, selectedRating, review);
			}

			isReviewing = false;
			reviewText = '';
			reviewTags = [];
		} finally {
			isSubmitting = false;
		}
	}

	async function deleteRating() {
		if (!hasUserRated || !isOwnRating) return;

		if (confirm('Are you sure you want to delete your rating?')) {
			await userStore.deleteRating(existingRating!.id);
		}
	}

	function startReview() {
		if (!userStore.isAuthenticated) {
			userStore.openLoginModal();
			return;
		}
		isReviewing = true;
	}

	function cancelReview() {
		isReviewing = false;
		reviewText = existingRating?.review || '';
		isSpoiler = existingRating?.isSpoiler || false;
		reviewTags = existingRating?.tags || [];
	}

	function addTag(tag: string) {
		if (!reviewTags.includes(tag)) {
			reviewTags = [...reviewTags, tag];
		}
		showTagInput = false;
		newTag = '';
	}

	function removeTag(tag: string) {
		reviewTags = reviewTags.filter(t => t !== tag);
	}

	function handleTagInput(event: KeyboardEvent) {
		if (event.key === 'Enter' && newTag.trim()) {
			addTag(newTag.trim());
		}
	}

	function getStarColor(index: number): string {
		const activeRating = hoverRating || selectedRating;
		if (index <= activeRating) {
			if (activeRating <= 3) return 'text-red-500';
			if (activeRating <= 5) return 'text-orange-500';
			if (activeRating <= 7) return 'text-yellow-500';
			return 'text-green-500';
		}
		return 'text-gray-300 dark:text-gray-600';
	}

	function formatDate(date: Date): string {
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}
</script>

<div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6">
	<!-- Header -->
	<div class="flex items-start gap-4 mb-6">
		{#if mediaPoster}
			<img
				src={mediaPoster}
				alt="{mediaTitle} poster"
				class="w-16 h-24 object-cover rounded-lg shadow-md"
			/>
		{/if}
		<div class="flex-1">
			<h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
				{mediaTitle}
			</h3>
			<div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
				<span class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
					{mediaType === 'movie' ? 'Movie' : 'TV Show'}
				</span>
			</div>
		</div>
	</div>

	<!-- Existing Rating Display -->
	{#if hasUserRated && !isReviewing}
		<div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
			<div class="flex items-center justify-between mb-3">
				<div class="flex items-center gap-3">
					<div class="flex items-center gap-1">
						{#each Array(10) as _, i}
							<Star
								class="w-5 h-5 {i < existingRating!.rating ? getStarColor(i + 1) : 'text-gray-300 dark:text-gray-600'}"
								fill={i < existingRating!.rating ? 'currentColor' : 'none'}
							/>
						{/each}
					</div>
					<span class="text-lg font-bold text-gray-900 dark:text-white">
						{existingRating!.rating}/10
					</span>
					<span class="text-sm text-gray-600 dark:text-gray-400">
						{ratingLabels[existingRating!.rating as keyof typeof ratingLabels]}
					</span>
				</div>

				{#if isOwnRating}
					<div class="relative">
						<button
							onclick={() => showMoreOptions = !showMoreOptions}
							class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
						>
							<MoreHorizontal class="w-4 h-4 text-gray-600 dark:text-gray-400" />
						</button>

						{#if showMoreOptions}
							<div class="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
								<button
									onclick={() => { isReviewing = true; showMoreOptions = false; }}
									class="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
								>
									<Edit3 class="w-4 h-4" />
									Edit Rating
								</button>
								<button
									onclick={deleteRating}
									class="flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-red-600 dark:text-red-400"
								>
									<Trash2 class="w-4 h-4" />
									Delete Rating
								</button>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			{#if existingRating!.review}
				<div class="space-y-3">
					{#if existingRating!.isSpoiler}
						<div class="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
							<Eye class="w-4 h-4" />
							Contains spoilers
						</div>
					{/if}

					<p class="text-gray-700 dark:text-gray-300 leading-relaxed">
						{existingRating!.review}
					</p>

					{#if existingRating!.tags.length > 0}
						<div class="flex flex-wrap gap-2">
							{#each existingRating!.tags as tag}
								<span class="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
									{tag}
								</span>
							{/each}
						</div>
					{/if}

					<div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
						<div class="flex items-center gap-1">
							<Calendar class="w-4 h-4" />
							{formatDate(existingRating!.createdAt)}
						</div>
						{#if existingRating!.rewatched}
							<div class="flex items-center gap-1">
								<Heart class="w-4 h-4" />
								Rewatched
							</div>
						{/if}
					</div>
				</div>
			{:else if isOwnRating}
				<button
					onclick={startReview}
					class="text-blue-600 dark:text-blue-400 hover:underline text-sm"
				>
					Add a review
				</button>
			{/if}
		</div>
	{/if}

	<!-- Rating Interface -->
	{#if !hasUserRated || isReviewing}
		<div class="space-y-6">
			<!-- Star Rating -->
			<div class="text-center">
				<h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
					{hasUserRated ? 'Update your rating' : 'Rate this ' + mediaType}
				</h4>

				<div class="flex justify-center gap-1 mb-3">
					{#each Array(10) as _, i}
						<button
							onmouseenter={() => handleStarHover(i + 1)}
							onmouseleave={handleStarLeave}
							onclick={() => handleStarClick(i + 1)}
							class="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
							disabled={isSubmitting}
						>
							<Star
								class="w-8 h-8 {getStarColor(i + 1)} transition-colors"
								fill={(hoverRating || selectedRating) > i ? 'currentColor' : 'none'}
							/>
						</button>
					{/each}
				</div>

				{#if selectedRating > 0}
					<div class="text-center">
						<span class="text-2xl font-bold text-gray-900 dark:text-white">
							{selectedRating}/10
						</span>
						<span class="ml-2 text-lg text-gray-600 dark:text-gray-400">
							{ratingLabels[selectedRating as keyof typeof ratingLabels]}
						</span>
					</div>
				{/if}
			</div>

			<!-- Review Form -->
			{#if isReviewing}
				<div class="space-y-4">
					<!-- Review Text -->
					<div>
						<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
							Write a review (optional)
						</label>
						<textarea
							bind:value={reviewText}
							placeholder="Share your thoughts about this {mediaType}..."
							class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
							rows="4"
						></textarea>
					</div>

					<!-- Options -->
					<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
						<!-- Spoiler Warning -->
						<label class="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={isSpoiler}
								class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">Contains spoilers</span>
						</label>

						<!-- Rewatch -->
						<label class="flex items-center gap-3 cursor-pointer">
							<input
								type="checkbox"
								bind:checked={rewatched}
								class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<span class="text-sm text-gray-700 dark:text-gray-300">This is a rewatch</span>
						</label>
					</div>

					<!-- Watched Date -->
					{#if rewatched || reviewText}
						<div>
							<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								When did you watch this?
							</label>
							<input
								type="date"
								bind:value={watchedDate}
								class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
							/>
						</div>
					{/if}

					<!-- Tags -->
					<div class="space-y-3">
						<div class="flex items-center justify-between">
							<label class="text-sm font-medium text-gray-700 dark:text-gray-300">
								Tags
							</label>
							<button
								onclick={() => showTagInput = !showTagInput}
								class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
							>
								Add custom tag
							</button>
						</div>

						{#if showTagInput}
							<div class="flex gap-2">
								<input
									type="text"
									bind:value={newTag}
									onkeydown={handleTagInput}
									placeholder="Enter a tag..."
									class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
								/>
								<button
									onclick={() => newTag.trim() && addTag(newTag.trim())}
									disabled={!newTag.trim()}
									class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
								>
									Add
								</button>
							</div>
						{/if}

						<!-- Common Tags -->
						<div class="flex flex-wrap gap-2">
							{#each commonTags as tag}
								<button
									onclick={() => addTag(tag)}
									disabled={reviewTags.includes(tag)}
									class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full text-sm
										hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
										disabled:bg-blue-100 dark:disabled:bg-blue-900 disabled:text-blue-800 dark:disabled:text-blue-200 disabled:cursor-not-allowed"
								>
									{tag}
								</button>
							{/each}
						</div>

						<!-- Selected Tags -->
						{#if reviewTags.length > 0}
							<div class="flex flex-wrap gap-2">
								{#each reviewTags as tag}
									<span class="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
										{tag}
										<button
											onclick={() => removeTag(tag)}
											class="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
										>
											<Tag class="w-3 h-3" />
										</button>
									</span>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Action Buttons -->
					<div class="flex gap-3 pt-4">
						<button
							onclick={submitReview}
							disabled={!canSubmit || isSubmitting}
							class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						>
							{#if isSubmitting}
								<div class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
								Submitting...
							{:else}
								{hasUserRated ? 'Update' : 'Submit'} Rating
							{/if}
						</button>

						{#if hasUserRated}
							<button
								onclick={cancelReview}
								class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
							>
								Cancel
							</button>
						{/if}
					</div>
				</div>
			{:else if !hasUserRated}
				<!-- Quick Rating Buttons -->
				<div class="flex justify-center">
					<button
						onclick={startReview}
						class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
					>
						<MessageCircle class="w-4 h-4" />
						Write a Review
					</button>
				</div>
			{/if}

			{#if !userStore.isAuthenticated}
				<div class="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<p class="text-gray-600 dark:text-gray-400 mb-3">
						Sign in to rate and review
					</p>
					<button
						onclick={userStore.openLoginModal}
						class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
					>
						Sign In
					</button>
				</div>
			{/if}
		</div>
	{/if}
</div>

<!-- Click outside to close more options -->
{#if showMoreOptions}
	<div
		class="fixed inset-0 z-0"
		onclick={() => showMoreOptions = false}
	></div>
{/if}
