<script lang="ts">
	import { goto } from '$app/navigation';
	import { Search } from 'lucide-svelte';
	import MediaCard from '$lib/components/MediaCard.svelte';
	import { Input } from '$lib/components/ui/input';
	import * as Card from '$lib/components/ui/card';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let searchQuery = $state(data.query);

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	}
</script>

<svelte:head>
	<title>Search - TVDom</title>
</svelte:head>

<div class="min-h-screen">
	<Card.Root class="border-b rounded-none">
		<Card.Content class="container mx-auto px-4 py-8">
			<form onsubmit={handleSearch} class="max-w-2xl mx-auto">
				<div class="relative">
					<Search
						class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
					/>
					<Input
						type="text"
						bind:value={searchQuery}
						placeholder="Search for movies, TV shows..."
						class="pl-12 pr-4 h-14 text-base"
					/>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<main class="container mx-auto px-4 py-8">
		{#if data.query}
			<h1 class="text-3xl font-bold mb-6">
				Search results for "{data.query}"
			</h1>

			{#if data.results.length > 0}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#each data.results as item}
						{#if item.media_type === 'movie' || item.media_type === 'tv'}
							<MediaCard media={item} type={item.media_type} />
						{/if}
					{/each}
				</div>
			{:else}
				<div class="text-center py-16">
					<p class="text-xl text-muted-foreground">No results found for "{data.query}"</p>
				</div>
			{/if}
		{:else}
			<div class="text-center py-16">
				<Search class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
				<p class="text-xl text-muted-foreground">Start searching for movies and TV shows</p>
			</div>
		{/if}
	</main>
</div>
