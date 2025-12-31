<script lang="ts">
import MediaCard from '$lib/components/MediaCard.svelte';
import { Button } from '$lib/components/ui/button';
import { Tv, TrendingUp, Star, Calendar, ChevronRight, ChevronLeft } from 'lucide-svelte';
import type { PageData } from './$types';

let { data }: { data: PageData } = $props();

const sections = [
  { id: 'popular', label: 'Popular', icon: Tv },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'top_rated', label: 'Top Rated', icon: Star },
  { id: 'airing_today', label: 'Airing Today', icon: Calendar }
];

const sectionTitle = sections.find(s => s.id === data.currentSection)?.label || 'Popular';
</script>

<svelte:head>
	<title>TV Shows - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<main class="container mx-auto px-4 md:px-8 py-10 md:py-14 space-y-10">
		<!-- Page header -->
		<section class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
			<div class="space-y-2">
				<div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
					<Tv class="w-4 h-4" />
					<span>Browse TV shows</span>
				</div>
				<h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
					{sectionTitle} TV Shows
				</h1>
				<p class="max-w-xl text-sm md:text-base text-muted-foreground">
					Find something to binge from popular, trending, top rated and airing today.
				</p>
			</div>

			<!-- Section tabs -->
		
		</section>

		<!-- Results grid -->
		<section class="space-y-6">
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
				{#each data.shows as show}
					<MediaCard media={show} type="tv" />
				{/each}
			</div>

			{#if data.totalPages > 1}
				<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-border/60">
					<p class="text-xs md:text-sm text-muted-foreground">
						Page {data.currentPage} of {Math.min(data.totalPages, 500)}
					</p>
					<div class="flex justify-end items-center gap-3">
						{#if data.currentPage > 1}
							<a href={`/tv?section=${data.currentSection}&page=${data.currentPage - 1}`}>
								<Button
									variant="outline"
									class="px-4 md:px-6"
								>
									<ChevronLeft/> Previous
								</Button>
							</a>
						{/if}
						{#if data.currentPage < data.totalPages && data.currentPage < 500}
							<a href={`/tv?section=${data.currentSection}&page=${data.currentPage + 1}`}>
								<Button
									variant="outline"
									class="px-4 md:px-6 "
								>
									Next <ChevronRight/>
								</Button>
							</a>
						{/if}
					</div>
				</div>
			{/if}
		</section>
	</main>
</div>

<style>
	/* Legacy horizontal scroll helpers left empty intentionally */
</style>
