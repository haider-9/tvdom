<script lang="ts">
	import { Users, Film, Tv, Calendar } from 'lucide-svelte';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	// dialog UI is not used for the gallery lightbox; use a simple custom modal
	import MediaCard from '$lib/components/MediaCard.svelte';
	import type { PageData } from './$types';
	import { generateSEOTags, generateStructuredData } from '$lib/seo';
	import { page } from '$app/stores';

	let { data }: { data: PageData } = $props();

	const { details, credits } = data;

	const profileUrl = details.profile_path
		? `https://image.tmdb.org/t/p/w500${details.profile_path}`
		: '';

	const movieCredits = (credits?.cast || []).filter((c: any) => c.media_type === 'movie');
	const tvCredits = (credits?.cast || []).filter((c: any) => c.media_type === 'tv');
	const images = data.images?.profiles || [];

	let lightboxOpen = $state(false);
	let currentIndex = $state(0);

	function openLightbox(i: number) {
		currentIndex = i;
		lightboxOpen = true;
	}

	function closeLightbox() {
		lightboxOpen = false;
	}

	function prevImage() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
	}

	function nextImage() {
		currentIndex = (currentIndex + 1) % images.length;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === 'Escape') closeLightbox();
		if (e.key === 'ArrowLeft') prevImage();
		if (e.key === 'ArrowRight') nextImage();
	}

	// SEO Configuration
	const seoDescription = details.biography || `Learn more about ${details.name}, ${details.known_for_department || "actor"} known for their work in movies and TV shows.`;
	const seoImage = profileUrl || "";
	const seoKeywords = [
		details.name,
		details.known_for_department || "actor",
		"movies",
		"TV shows",
		"entertainment",
		...(details.place_of_birth ? [details.place_of_birth] : [])
	];

	const seoConfig = generateSEOTags({
		title: `${details.name}${details.known_for_department ? ` - ${details.known_for_department}` : ""}`,
		description: seoDescription.substring(0, 160),
		image: seoImage,
		url: $page.url.pathname,
		keywords: seoKeywords
	});

	const structuredData = generateStructuredData({
		type: "Person",
		data: details
	});

	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: "People", url: "/people" },
		{ name: details.name, url: $page.url.pathname }
	];
	const breadcrumbData = generateStructuredData({
		type: "BreadcrumbList",
		data: breadcrumbs
	});
</script>

<svelte:head>
	<title>{seoConfig.title} | TVDom</title>
	<meta name="description" content={seoConfig.description} />
	<meta name="keywords" content={seoConfig.keywords} />
	
	<!-- Open Graph -->
	<meta property="og:title" content={seoConfig.title} />
	<meta property="og:description" content={seoConfig.description} />
	<meta property="og:image" content={seoConfig.image} />
	<meta property="og:url" content={seoConfig.url} />
	<meta property="og:type" content="profile" />
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={seoConfig.title} />
	<meta name="twitter:description" content={seoConfig.description} />
	<meta name="twitter:image" content={seoConfig.image} />
	
	<!-- Canonical URL -->
	<link rel="canonical" href={seoConfig.url} />
	
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbData)}</script>`}
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen">
	<!-- Hero Section -->
	<section class="relative h-[60vh] md:h-[70vh] w-full overflow-hidden bg-muted">
		{#if profileUrl}
			<img src={profileUrl} alt={details.name} class="w-full h-full object-center object-cover" />
		{:else}
			<div class="w-full h-full flex items-center justify-center">
				<Users class="w-20 h-20 text-muted-foreground" />
			</div>
		{/if}

		<div class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/30"></div>
		<div class="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent"></div>

		<div class="absolute inset-x-0 bottom-0 container mx-auto px-4 md:px-8 pb-12 md:pb-16">
			<div class="max-w-3xl space-y-6">
				<h1 class="text-5xl md:text-6xl font-bold text-foreground drop-shadow-lg">
					{details.name}
				</h1>

				<div class="flex flex-wrap items-center gap-3">
					{#if details.known_for_department}
						<Badge variant="secondary" class="bg-card/80 backdrop-blur text-base px-4 py-2">
							{details.known_for_department}
						</Badge>
					{/if}

					{#if details.birthday}
						<Badge variant="outline" class="bg-card/50 backdrop-blur px-4 py-2 flex items-center gap-2">
							<Calendar class="w-4 h-4" />
							{details.birthday}
						</Badge>
					{/if}

					{#if details.place_of_birth}
						<Badge variant="outline" class="bg-card/50 backdrop-blur px-4 py-2">
							{details.place_of_birth}
						</Badge>
					{/if}
				</div>

				{#if details.biography}
					<p class="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-4">
						{details.biography}
					</p>
				{/if}
			</div>
		</div>
	</section>

	<main class="container mx-auto px-4 md:px-8 py-12">
		{#if images.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
						<Users class="w-8 h-8" />
						Photo Gallery
					</h2>
				</div>

				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-4">
						{#each images as img, i}
							<button
								type="button"
								onclick={() => openLightbox(i)}
								class="flex-shrink-0 w-[200px] h-[280px] overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary"
							>
								<img 
									src={`https://image.tmdb.org/t/p/w300${img.file_path}`} 
									alt={details.name} 
									class="w-full h-full object-cover object-center" 
									loading="lazy" 
								/>
							</button>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		{#if lightboxOpen}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
				<button 
					type="button" 
					class="absolute inset-0" 
					onclick={closeLightbox} 
					aria-label="Close lightbox"
				></button>
				
				<div class="relative z-10 max-w-6xl w-full mx-4">
					<!-- Previous Button -->
					<button 
						type="button"
						class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110" 
						onclick={prevImage} 
						aria-label="Previous image"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
						</svg>
					</button>

					<!-- Image -->
					<div class="bg-muted/20 rounded-xl overflow-hidden shadow-2xl">
						<img 
							src={`https://image.tmdb.org/t/p/original${images[currentIndex].file_path}`} 
							alt={details.name} 
							class="w-full h-auto max-h-[85vh] object-contain" 
						/>
					</div>

					<!-- Next Button -->
					<button 
						type="button"
						class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110" 
						onclick={nextImage} 
						aria-label="Next image"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					</button>

					<!-- Close Button -->
					<button 
						type="button"
						class="absolute right-4 top-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 hover:scale-110" 
						onclick={closeLightbox} 
						aria-label="Close"
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>

					<!-- Image Counter -->
					<div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
						{currentIndex + 1} / {images.length}
					</div>
				</div>
			</div>
		{/if}
		{#if movieCredits.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
						<Film class="w-8 h-8" />
						Movie Credits
					</h2>
				</div>

				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-4">
						{#each movieCredits.slice(0, 20) as credit}
							<div class="flex-shrink-0 w-[280px]">
								<MediaCard media={credit} type="movie" />
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		{#if tvCredits.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
						<Tv class="w-8 h-8" />
						TV Credits
					</h2>
				</div>

				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-4">
						{#each tvCredits.slice(0, 20) as credit}
							<div class="flex-shrink-0 w-[280px]">
								<MediaCard media={credit} type="tv" />
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</main>
</div>

<style>
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
		scroll-behavior: smooth;
	}
	
	.overflow-x-auto {
		scroll-snap-type: x proximity;
	}
	
	.flex-shrink-0 {
		scroll-snap-align: start;
	}
</style>


