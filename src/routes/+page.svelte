<script lang="ts">
	import type { PageData } from './$types';
	import MediaCard from '$lib/components/MediaCard.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import { Button } from '$lib/components/ui/button';
	import { generateSEOTags } from '$lib/seo';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	const seoConfig = generateSEOTags({
		title: 'TVDom - Your Ultimate TV & Movie Destination',
		description: 'Discover and explore movies, TV shows, and the people who make them. Browse trending content, read reviews, and find your next favorite watch.',
		url: $page.url.pathname,
		keywords: ['movies', 'TV shows', 'entertainment', 'streaming', 'reviews', 'trending movies', 'popular TV shows']
	});
</script>

<svelte:head>
	<title>{seoConfig.title}</title>
	<meta name="description" content={seoConfig.description} />
	<meta name="keywords" content={seoConfig.keywords} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={seoConfig.title} />
	<meta property="og:description" content={seoConfig.description} />
	<meta property="og:image" content={seoConfig.image} />
	<meta property="og:url" content={seoConfig.url} />
	<meta property="og:type" content={seoConfig.type} />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seoConfig.title} />
	<meta name="twitter:description" content={seoConfig.description} />
	<meta name="twitter:image" content={seoConfig.image} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href={seoConfig.url} />
</svelte:head>

<div class="min-h-screen">
	<Hero items={data.trendingMovies.slice(0, 5)} />

	<main class="container   max-w-[85rem] mx-auto px-4 py-8 space-y-12">
		<!-- Trending Movies -->
		<section>
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-3xl font-bold text-foreground">Trending Movies</h2>
				<Button href="/movies?section=trending" variant="outline" class="hidden md:inline-flex">
					See more
				</Button>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  gap-6">
				{#each data.trendingMovies.slice(0, 10) as movie}
					<MediaCard media={movie} type="movie" />
				{/each}
			</div>
			<div class="mt-6 md:hidden flex justify-center">
				<Button href="/movies?section=trending" variant="outline" class="w-full">
					See more
				</Button>
			</div>
		</section>

		<!-- Trending TV Shows -->
		<section>
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-3xl font-bold text-foreground">Trending TV Shows</h2>
				<Button href="/tv?section=trending" variant="outline" class="hidden md:inline-flex">
					See more
				</Button>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  gap-6">
				{#each data.trendingTV.slice(0, 10) as show}
					<MediaCard media={show} type="tv" />
				{/each}
			</div>
			<div class="mt-6 md:hidden flex justify-center">
				<Button href="/tv?section=trending" variant="outline" class="w-full">
					See more
				</Button>
			</div>
		</section>

		<!-- Popular Movies -->
		<section>
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-3xl font-bold text-foreground">Popular Movies</h2>
				<Button href="/movies" variant="outline" class="hidden md:inline-flex">
					See more
				</Button>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  gap-6">
				{#each data.popularMovies.slice(0, 10) as movie}
					<MediaCard media={movie} type="movie" />
				{/each}
			</div>
			<div class="mt-6 md:hidden flex justify-center">
				<Button href="/movies" variant="outline" class="w-full">
					See more
				</Button>
			</div>
		</section>

		<!-- Popular TV Shows -->
		<section>
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-3xl font-bold text-foreground">Popular TV Shows</h2>
				<Button href="/tv" variant="outline" class="hidden md:inline-flex">
					See more
				</Button>
			</div>
			<div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4  gap-6">
				{#each data.popularTV.slice(0, 10) as show}
					<MediaCard media={show} type="tv" />
				{/each}
			</div>
			<div class="mt-6 md:hidden flex justify-center">
				<Button href="/tv" variant="outline" class="w-full">
					See more
				</Button>
			</div>
		</section>
	</main>
</div>
