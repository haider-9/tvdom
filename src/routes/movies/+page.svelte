<script lang="ts">
	import MediaCard from "$lib/components/MediaCard.svelte";
	import { Button } from "$lib/components/ui/button";
	import {
		Film,
		ChevronRightIcon,
		ChevronLeft,
		ChevronDown,
		Check,
	} from "lucide-svelte";
	import type { PageData } from "./$types";
    import { ScrollArea } from "$lib/components/ui/scroll-area";

	let { data }: { data: PageData } = $props();
	let dropdownOpen = $state(false);

	const activeGenreName = $derived(
		data.currentGenre
			? (data.genres.find(
					(g: { id: number; name: string }) =>
						g.id === data.currentGenre,
				)?.name ?? null)
			: null,
	);
	const pageTitle = $derived(
		activeGenreName ??
			{
				popular: "Popular",
				trending: "Trending",
				top_rated: "Top Rated",
				upcoming: "Upcoming",
				now_playing: "Now Playing",
			}[data.currentSection] ??
			"Popular",
	);

	function genreHref(id: number | null) {
		return id === null
			? `/movies?section=${data.currentSection}&page=1`
			: `/movies?genre=${id}&page=1`;
	}
	function pageHref(p: number) {
		return data.currentGenre
			? `/movies?genre=${data.currentGenre}&page=${p}`
			: `/movies?section=${data.currentSection}&page=${p}`;
	}
	function close() {
		dropdownOpen = false;
	}
</script>

<svelte:window onkeydown={(e) => e.key === "Escape" && close()} />

<svelte:head>
	<title>{pageTitle} Movies - TVDom</title>
	<meta
		name="description"
		content="Browse popular, trending, top-rated, and upcoming movies on TVDom."
	/>
	<link rel="canonical" href="https://tvdom.vercel.app/movies" />
</svelte:head>

<div class="min-h-screen bg-background">
	<main class="container mx-auto px-4 md:px-8 py-10 md:py-14 space-y-8">
		<section
			class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
		>
			<div class="space-y-2">
				<div
					class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
				>
					<Film class="w-4 h-4" /><span>Browse movies</span>
				</div>
				<h1 class="text-3xl md:text-4xl font-semibold tracking-tight">
					{pageTitle} Movies
				</h1>
				<p class="max-w-xl text-sm text-muted-foreground">
					Discover popular, trending, top rated, now playing and
					upcoming releases.
				</p>
			</div>

			{#if data.genres.length > 0}
				<div class="relative flex-shrink-0 w-max">
					<button
						class="dropdown-trigger"
						onclick={() => (dropdownOpen = !dropdownOpen)}
					>
						<Film class="w-4 h-4 opacity-60" />
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
							<p class="dropdown-label">Genre</p>
							<div class="dropdown-list">
							<ScrollArea class="h-[200px] overflow-hidden">
								<a
									href={genreHref(null)}
									onclick={close}
									class="dropdown-item {!data.currentGenre
										? 'active'
										: ''}"
								>
									{#if !data.currentGenre}<Check
											class="w-3.5 h-3.5 shrink-0"
										/>{:else}<span
											class="w-3.5 h-3.5 shrink-0"
										></span>{/if}
									All
								</a>
								{#each data.genres as g}
									<a
										href={genreHref(g.id)}
										onclick={close}
										class="dropdown-item {data.currentGenre ===
										g.id
											? 'active'
											: ''}"
									>
										{#if data.currentGenre === g.id}<Check
												class="w-3.5 h-3.5 shrink-0"
											/>{:else}<span
												class="w-3.5 h-3.5 shrink-0"
											></span>{/if}
										{g.name}
									</a>
								{/each}
								</ScrollArea>
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</section>

		{#if activeGenreName}
			<div class="flex items-center gap-2 text-sm">
				<span class="text-muted-foreground">Filtered by:</span>
				<a
					href={genreHref(null)}
					class="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
				>
					{activeGenreName} ×
				</a>
			</div>
		{/if}

		<section class="space-y-6">
			{#if data.movies.length > 0}
				<div
					class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
				>
					{#each data.movies as movie (movie.id)}
						<MediaCard media={movie} type="movie" />
					{/each}
				</div>
			{:else}
				<div class="text-center py-16">
					<Film
						class="w-16 h-16 mx-auto mb-4 text-muted-foreground/30"
					/>
					<p class="text-muted-foreground">
						No movies found for this genre.
					</p>
				</div>
			{/if}

			{#if data.totalPages > 1}
				<div
					class="flex items-center justify-between pt-4 border-t border-border/60"
				>
					<p class="text-sm text-muted-foreground">
						Page {data.currentPage} of {Math.min(
							data.totalPages,
							500,
						)}
					</p>
					<div class="flex gap-3">
						{#if data.currentPage > 1}
							<a href={pageHref(data.currentPage - 1)}
								><Button variant="outline"
									><ChevronLeft /> Previous</Button
								></a
							>
						{/if}
						{#if data.currentPage < data.totalPages && data.currentPage < 500}
							<a href={pageHref(data.currentPage + 1)}
								><Button variant="outline"
									>Next <ChevronRightIcon /></Button
								></a
							>
						{/if}
					</div>
				</div>
			{/if}
		</section>
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
		transition: background 0.12s;
	}
	.dropdown-item:hover {
		background: var(--accent) / 30;
	}
	.dropdown-item.active {
		background: var(--primary);
		color: var(--primary-foreground);
		font-weight: 600;
	}
</style>
