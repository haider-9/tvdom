<script lang="ts">
	import { onMount } from 'svelte';
	import { Play } from 'lucide-svelte';

	interface Props {
		userId?: string;
	}

	let { userId }: Props = $props();

	let currentlyWatching = $state<any[]>([]);
	let isLoading = $state(true);

	async function loadCurrentlyWatching() {
		try {
			const params = new URLSearchParams();
			if (userId) params.append('userId', userId);

			console.log('Fetching currently watching for userId:', userId);
			const response = await fetch(`/api/currently-watching?${params}`);
			const data = await response.json();
			console.log('Currently watching response:', data);
			currentlyWatching = data.currentlyWatching || [];
			console.log('Currently watching items:', currentlyWatching.length);
		} catch (error) {
			console.error('Error loading currently watching:', error);
		} finally {
			isLoading = false;
		}
	}

	function getTimeAgo(date: string) {
		const now = new Date();
		const then = new Date(date);
		const diff = now.getTime() - then.getTime();
		const minutes = Math.floor(diff / 60000);

		if (minutes < 1) return 'now';
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		return `${hours}h`;
	}

	onMount(() => {
		loadCurrentlyWatching();
		const interval = setInterval(loadCurrentlyWatching, 30000);
		return () => clearInterval(interval);
	});
</script>

{#if !isLoading && currentlyWatching.length > 0}
	<div class="watching-section">
		<h3>Currently Watching</h3>
		<div class="watching-list-wrapper">
			<div class="watching-list">
				{#each currentlyWatching as item}
					<div class="watching-item">
						{#if item.mediaPoster}
							<img
								src="https://image.tmdb.org/t/p/w92{item.mediaPoster}"
								alt={item.mediaTitle}
								class="poster"
							/>
						{:else}
							<div class="poster-placeholder">
								<Play class="w-5 h-5" />
							</div>
						{/if}
						<div class="info">
							<div class="title">{item.mediaTitle}</div>
							{#if item.season && item.episode}
								<div class="meta">S{item.season} E{item.episode} · {getTimeAgo(item.lastActiveAt)}</div>
							{:else}
								<div class="meta">{getTimeAgo(item.lastActiveAt)}</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

<style>
	.watching-section {
		margin-bottom: 2rem;
	}

	h3 {
		font-size: 1.125rem;
		font-weight: 600;
		color: hsl(var(--foreground));
		margin-bottom: 1rem;
	}

	.watching-list-wrapper {
		max-height: 13rem;
		overflow-y: auto;
		padding-right: 0.25rem;
	}

	.watching-list-wrapper::-webkit-scrollbar {
		width: 0.375rem;
	}

	.watching-list-wrapper::-webkit-scrollbar-track {
		background: hsl(var(--muted));
		border-radius: 0.375rem;
	}

	.watching-list-wrapper::-webkit-scrollbar-thumb {
		background: hsl(var(--muted-foreground) / 0.3);
		border-radius: 0.375rem;
	}

	.watching-list-wrapper::-webkit-scrollbar-thumb:hover {
		background: hsl(var(--muted-foreground) / 0.5);
	}

	.watching-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.watching-item {
		display: flex;
		gap: 0.75rem;
		padding: 0.75rem;
		background: hsl(var(--card));
		border: 1px solid hsl(var(--border));
		border-radius: 0.5rem;
	}

	.poster {
		width: 3rem;
		height: 4.5rem;
		border-radius: 0.375rem;
		object-fit: cover;
		flex-shrink: 0;
	}

	.poster-placeholder {
		width: 3rem;
		height: 4.5rem;
		border-radius: 0.375rem;
		background: hsl(var(--muted));
		display: flex;
		align-items: center;
		justify-content: center;
		color: hsl(var(--muted-foreground));
		flex-shrink: 0;
	}

	.info {
		flex: 1;
		min-width: 0;
	}

	.title {
		font-weight: 500;
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		margin-bottom: 0.25rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.meta {
		font-size: 0.75rem;
		color: hsl(var(--muted-foreground));
	}
</style>
