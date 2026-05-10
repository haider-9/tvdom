<script lang="ts">
	import { goto } from "$app/navigation";
	import { Search, ChevronDown, Check } from "lucide-svelte";
	import MediaCard from "$lib/components/MediaCard.svelte";
	import type { PageData } from "./$types";
	import { ScrollArea } from "$lib/components/ui/scroll-area";

	let { data }: { data: PageData } = $props();
	let searchQuery = $state(data.query);
	let activeGenre = $state<number | null>(data.currentGenre ?? null);
	let dropdownOpen = $state(false);

	const activeGenreName = $derived(
		activeGenre
			? (data.genres.find((g: any) => g.id === activeGenre)?.name ?? null)
			: null,
	);

	const availableGenres = $derived(
		data.genres.filter((g: any) =>
			data.results.some((r: any) => (r.genre_ids ?? []).includes(g.id)),
		),
	);

	const filteredResults = $derived(
		data.results.filter((item: any) => {
			if (item.media_type !== "movie" && item.media_type !== "tv")
				return false;
			if (!activeGenre) return true;
			return (item.genre_ids ?? []).includes(activeGenre);
		}),
	);

	function handleSearch(e: Event) {
		e.preventDefault();
		if (searchQuery.trim()) {
			activeGenre = null;
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	}

	function close() {
		dropdownOpen = false;
	}
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && close()} />

<svelte:head>
	<title
		>{data.query
			? `Search: ${data.query} - TVDom`
			: "Search - TVDom"}</title
	>
	<meta
		name="description"
		content={data.query
			? `Search results for "${data.query}" on TVDom.`
			: "Search for movies, TV shows, and people on TVDom."}
	/>
	<meta name="robots" content="noindex, follow" />
	<link rel="canonical" href="https://tvdom.vercel.app/search" />
</svelte:head>

<div class="min-h-screen">
	<main class="container mx-auto px-4 py-8 space-y-6">
		{#if data.query}
			<div
				class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
			>
				<div>
					<h1 class="text-2xl font-bold text-foreground">
						"{data.query}"
					</h1>
					<p class="text-sm text-muted-foreground mt-0.5">
						{filteredResults.length} result{filteredResults.length !==
						1
							? "s"
							: ""}
						{activeGenreName ? ` in ${activeGenreName}` : ""}
					</p>
				</div>

				{#if availableGenres.length > 0}
					<div class="relative flex-shrink-0 w-max">
						<button
							class="dropdown-trigger"
							onclick={() => (dropdownOpen = !dropdownOpen)}
						>
							<Search class="w-4 h-4 opacity-60" />
							<span>{activeGenreName ?? "All Genres"}</span>
							<ChevronDown
								class="w-4 h-4 opacity-50 transition-transform duration-200 {dropdownOpen
									? 'rotate-180'
									: ''}"
							/>
						</button>

						{#if dropdownOpen}
							<button
								class="fixed inset-0 z-40"
								onclick={close}
								aria-label="Close"
								tabindex="-1"
							></button>
							<div class="dropdown-panel">
								<p class="dropdown-label">Filter by genre</p>
								<div class="dropdown-list">
									<ScrollArea
										class="h-[200px] overflow-hidden"
									>
										<button
											onclick={() => {
												activeGenre = null;
												close();
											}}
											class="dropdown-item {activeGenre ===
											null
												? 'active'
												: ''}"
										>
											{#if activeGenre === null}<Check
													class="w-3.5 h-3.5 shrink-0"
												/>{:else}<span
													class="w-3.5 h-3.5 shrink-0"
												></span>{/if}
											All
										</button>
										{#each availableGenres as g}
											<button
												onclick={() => {
													activeGenre = g.id;
													close();
												}}
												class="dropdown-item {activeGenre ===
												g.id
													? 'active'
													: ''}"
											>
												{#if activeGenre === g.id}<Check
														class="w-3.5 h-3.5 shrink-0"
													/>{:else}<span
														class="w-3.5 h-3.5 shrink-0"
													></span>{/if}
												{g.name}
											</button>
										{/each}
									</ScrollArea>
								</div>
							</div>
						{/if}
					</div>
				{/if}
			</div>

			{#if activeGenreName}
				<div class="flex items-center gap-2 text-sm">
					<span class="text-muted-foreground">Filtered by:</span>
					<button
						onclick={() => (activeGenre = null)}
						class="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
					>
						{activeGenreName} ×
					</button>
				</div>
			{/if}

			{#if filteredResults.length > 0}
				<div
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
				>
					{#each filteredResults as item (item.id)}
						<MediaCard media={item} type={item.media_type} />
					{/each}
				</div>
			{:else}
				<div class="text-center py-16">
					<p class="text-xl text-muted-foreground">
						{activeGenre
							? "No results in this genre."
							: `No results found for "${data.query}"`}
					</p>
				</div>
			{/if}
		{:else}
			<div class="text-center py-16">
				<Search class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
				<p class="text-xl text-muted-foreground">
					Start searching for movies and TV shows
				</p>
			</div>
		{/if}
	</main>
</div>

<style>
	.dropdown-trigger {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.75rem;
		border: 1.5px solid var(--border);
		background: var(--card);
		color: var(--foreground);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
		font-family: inherit;
		min-width: 10rem;
		justify-content: space-between;
	}
	.dropdown-trigger:hover {
		border-color: var(--primary);
		box-shadow: 0 0 0 3px oklch(from var(--primary) l c h / 0.1);
	}
	.dropdown-panel {
		position: absolute;
		left: 0;
		top: calc(100% + 0.5rem);
		z-index: 50;
		width: 14rem;
		background: var(--card);
		border: 1.5px solid var(--border);
		border-radius: 1rem;
		box-shadow:
			0 20px 40px -8px oklch(from var(--primary) l c h / 0.15),
			0 4px 16px -4px rgba(0, 0, 0, 0.15);
		padding: 0.5rem;
		animation: dropIn 0.15s ease;
	}
	@media (min-width: 640px) {
		.dropdown-panel {
			left: auto;
			right: 0;
		}
	}
	@keyframes dropIn {
		from {
			opacity: 0;
			transform: translateY(-6px) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}
	.dropdown-label {
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--muted-foreground);
		padding: 0.25rem 0.5rem 0.375rem;
	}
	.dropdown-list {
		display: flex;
		flex-direction: column;
		gap: 1px;
		max-height: 17rem;
		overflow-y: auto;
		scrollbar-width: thin;
	}
	.dropdown-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.45rem 0.6rem;
		border-radius: 0.5rem;
		font-size: 0.875rem;
		color: var(--foreground);
		text-decoration: none;
		background: none;
		border: none;
		width: 100%;
		text-align: left;
		font-family: inherit;
		cursor: pointer;
		transition: background 0.12s;
	}
	.dropdown-item:hover {
		background: color-mix(in oklch, var(--accent) 20%, transparent);
	}
	.dropdown-item.active {
		background: var(--primary);
		color: var(--primary-foreground);
		font-weight: 600;
	}
</style>
