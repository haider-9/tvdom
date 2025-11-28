<script lang="ts">
	import MediaCard from '$lib/components/MediaCard.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Film, TrendingUp, Star, Calendar, Play, ChevronRightIcon, ChevronLeft } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/stores';
	
	let { data }: { data: PageData } = $props();
	
	const sections = [
	  { id: 'popular', label: 'Popular', icon: Film },
	  { id: 'trending', label: 'Trending', icon: TrendingUp },
	  { id: 'top_rated', label: 'Top Rated', icon: Star },
	  { id: 'now_playing', label: 'Now Playing', icon: Play },
	  { id: 'upcoming', label: 'Upcoming', icon: Calendar }
	];
	
	const sectionTitle = $derived(sections.find(s => s.id === data.currentSection)?.label || 'Popular');
	
	async function navigateToSection(section: string) {
		await goto(`/movies?section=${section}`, { 
			invalidateAll: true,
			noScroll: false 
		});
	}
	
	async function navigateToPage(pageNum: number) {
		const section = $page.url.searchParams.get('section') || 'popular';
		await goto(`/movies?section=${section}&page=${pageNum}`, { 
			invalidateAll: true,
			noScroll: false 
		});
	}
	</script>
	
	<svelte:head>
		<title>Movies - TVDom</title>
	</svelte:head>
	
	<div class="min-h-screen bg-background">
		<main class="container mx-auto px-4 md:px-8 py-10 md:py-14 space-y-10">
			<!-- Page header -->
			<section class="flex flex-col gap-4">
				<div class="space-y-2">
					<div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
						<Film class="w-4 h-4" />
						<span>Browse movies</span>
					</div>
					<h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
						{sectionTitle} Movies
					</h1>
					<p class="max-w-xl text-sm md:text-base text-muted-foreground">
						Discover what to watch next across popular, trending, top rated, now playing and upcoming releases.
					</p>
				</div>
	
				<!-- Section tabs -->
				<div class="mx-auto max-w-fit flex items-center justify-center flex-wrap gap-2 rounded-full bg-card/80 px-1 py-1 border border-border/80">
					{#each sections as section}
						{@const Icon = section.icon}
						<Button
							variant={data.currentSection === section.id ? 'default' : 'ghost'}
							class="flex items-center gap-1.5 rounded-full px-3 md:px-4 py-2 text-xs md:text-sm"
							onclick={() => navigateToSection(section.id)}
						>
							<Icon class="w-4 h-4" />
							<span>{section.label}</span>
						</Button>
					{/each}
				</div>
			</section>
	
			<!-- Results grid -->
			<section class="space-y-6 @container">
				<!-- Add a key to force re-render -->
				{#key data.currentSection + data.currentPage}
					<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
						{#each data.movies as movie (movie.id)}
							<MediaCard media={movie} type="movie" />
						{/each}
					</div>
				{/key}
	
				{#if data.totalPages > 1}
					<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-border/60">
						<p class="text-xs md:text-sm text-muted-foreground">
							Page {data.currentPage} of {Math.min(data.totalPages, 500)}
						</p>
						<div class="flex justify-end items-center gap-3">
							{#if data.currentPage > 1}
								<Button
									variant="outline"
									class="px-4 md:px-6"
									onclick={() => navigateToPage(data.currentPage - 1)}
								>
									<ChevronLeft/> Previous
								</Button>
							{/if}
							{#if data.currentPage < data.totalPages && data.currentPage < 500}
								<Button
									variant="outline"
									class="px-4 md:px-6"
									onclick={() => navigateToPage(data.currentPage + 1)}
								>
									Next <ChevronRightIcon/>
								</Button>
							{/if}
						</div>
					</div>
				{/if}
			</section>
	
			<!-- Genres row -->
			{#if data.genres.length > 0}
				<section class="space-y-3">
					<h2 class="text-base md:text-lg font-medium text-foreground">Browse by genre</h2>
					<div class="flex flex-wrap gap-2">
						{#each data.genres as genre}
							<a href={`/movies?genre=${genre.id}`} class="inline-flex">
								<Badge
									variant="outline"
									class="rounded-full px-3 py-1 text-xs md:text-sm bg-card/60 hover:bg-primary/10 cursor-pointer"
								>
									{genre.name}
								</Badge>
							</a>
						{/each}
					</div>
				</section>
			{/if}
		</main>
	</div>