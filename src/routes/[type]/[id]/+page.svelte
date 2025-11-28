<script lang="ts">
	import {
		Star,
		Calendar,
		Clock,
		Play,
		Users,
		Film,
		Image,
		Ticket,
		Tv2,
		MonitorPlay,
		BadgeCheck,
		ScrollText,
		Globe,
		Clapperboard,
	} from "lucide-svelte";
	import * as Card from "$lib/components/ui/card";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import MediaCard from "$lib/components/MediaCard.svelte";
	import type { PageData } from "./$types";
	import { generateSEOTags, generateStructuredData } from "$lib/seo";
	import { page } from "$app/stores";

	let { data }: { data: PageData } = $props();

	const {
		details,
		credits,
		videos,
		similar,
		images,
		type,
		watchProviders,
		reviews,
		keywords,
		recommendations,
		releaseInfo,
		contentRatings,
	} = data;
	const mediaType = type as "movie" | "tv";
	const title = type === "movie" ? details.title : details.name;
	const releaseDate =
		type === "movie" ? details.release_date : details.first_air_date;
	const backdropUrl = details.backdrop_path
		? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
		: "";
	const posterUrl = details.poster_path
		? `https://image.tmdb.org/t/p/w500${details.poster_path}`
		: "";

	const cast = credits?.cast?.slice(0, 12) || [];
	const crew =
		credits?.crew
			?.filter((c: any) =>
				["Director", "Writer", "Screenplay", "Producer"].includes(
					c.job,
				),
			)
			.slice(0, 6) || [];

	const trailer =
		videos?.results?.find(
			(v: any) => v.type === "Trailer" && v.site === "YouTube",
		) || videos?.results?.[0];

	const backdrops = images?.backdrops || [];
	const posters = images?.posters || [];
	const allImages = [...backdrops, ...posters];
	const reviewList = reviews?.results?.slice(0, 3) || [];
	const keywordList =
		mediaType === "movie" ? keywords?.keywords || [] : keywords?.results || [];
	const seasons = type === "tv" ? details.seasons || [] : [];
	const lastEpisode = type === "tv" ? details.last_episode_to_air : null;
	const nextEpisode = type === "tv" ? details.next_episode_to_air : null;
	const defaultRegion = "US";
	const providerRegionCode = watchProviders?.results?.[defaultRegion]
		? defaultRegion
		: Object.keys(watchProviders?.results || {})[0];
	const providerRegion = providerRegionCode
		? (watchProviders?.results?.[providerRegionCode] as any)
		: null;
	const providerTypes = [
		{ label: "Stream", key: "flatrate" },
		{ label: "Rent", key: "rent" },
		{ label: "Buy", key: "buy" },
		{ label: "Free", key: "free" },
	] as const;
	const providerSections = providerTypes
		.map((section) => ({
			...section,
			items: providerRegion?.[section.key] || [],
		}))
		.filter((section) => section.items.length > 0);
	const primaryCertification =
		type === "movie"
			? releaseInfo?.results
					?.find((entry: any) => entry.iso_3166_1 === defaultRegion)
					?.release_dates?.find((date: any) => date.certification)?.certification ||
			  releaseInfo?.results
					?.flatMap((entry: any) => entry.release_dates)
					?.find((date: any) => date.certification)?.certification
			: contentRatings?.results
					?.find((entry: any) => entry.iso_3166_1 === defaultRegion)?.rating ||
			  contentRatings?.results?.[0]?.rating;
	const usdFormatter = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0,
	});
	const spokenLanguages = details.spoken_languages || [];
	const productionCountries = details.production_countries || [];
	const networks = (details.networks || []).slice(0, 6);
	const productionCompanies = (details.production_companies || []).slice(0, 6);

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
		currentIndex = (currentIndex - 1 + allImages.length) % allImages.length;
	}

	function nextImage() {
		currentIndex = (currentIndex + 1) % allImages.length;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!lightboxOpen) return;
		if (e.key === "Escape") closeLightbox();
		if (e.key === "ArrowLeft") prevImage();
		if (e.key === "ArrowRight") nextImage();
	}

	// SEO Configuration
	const seoDescription = details.overview || `Discover ${title}, a ${type === "movie" ? "movie" : "TV show"} released in ${releaseDate ? new Date(releaseDate).getFullYear() : "various years"}. ${details.genres?.map((g: any) => g.name).join(", ") || ""}`;
	const seoImage = backdropUrl || posterUrl || "";
	const seoKeywords = [
		title,
		...(details.genres?.map((g: any) => g.name) || []),
		...(keywordList.slice(0, 5).map((k: any) => k.name) || []),
		mediaType === "movie" ? "movies" : "TV shows",
		"entertainment"
	];

	const seoConfig = generateSEOTags({
		title: `${title} (${releaseDate ? new Date(releaseDate).getFullYear() : ""})`,
		description: seoDescription.substring(0, 160),
		image: seoImage,
		type: mediaType === "movie" ? "video.movie" : "video.tv_show",
		url: $page.url.pathname,
		keywords: seoKeywords,
		publishedTime: releaseDate || undefined
	});

	const structuredData = generateStructuredData({
		type: mediaType === "movie" ? "Movie" : "TVSeries",
		data: { ...details, credits }
	});

	const breadcrumbs = [
		{ name: "Home", url: "/" },
		{ name: mediaType === "movie" ? "Movies" : "TV Shows", url: `/${mediaType}` },
		{ name: title, url: $page.url.pathname }
	];
	const breadcrumbData = generateStructuredData({
		type: "BreadcrumbList",
		data: breadcrumbs
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
	{#if releaseDate}
		<meta property="og:release_date" content={releaseDate} />
	{/if}
	
	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seoConfig.title} />
	<meta name="twitter:description" content={seoConfig.description} />
	<meta name="twitter:image" content={seoConfig.image} />
	
	<!-- Additional Meta -->
	{#if details.tagline}
		<meta name="tagline" content={details.tagline} />
	{/if}
	{#if details.vote_average}
		<meta name="rating" content={details.vote_average.toFixed(1)} />
	{/if}
	
	<!-- Canonical URL -->
	<link rel="canonical" href={seoConfig.url} />
	
	<!-- Structured Data -->
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbData)}</script>`}
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen">
	<!-- Hero Section with Backdrop -->
	<div class="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
		{#if backdropUrl}
			<img
				src={backdropUrl}
				alt={title}
				class="w-full h-full object-cover"
			/>
			<div
				class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/30"
			></div>
			<div
				class="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent"
			></div>
		{/if}
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 -mt-40 md:-mt-48 relative z-10 pb-12">
		<div class="flex flex-col md:flex-row gap-8 mb-12">
			<!-- Poster -->
			<div class="flex-shrink-0">
				<img
					src={posterUrl}
					alt={title}
					class="w-48 md:w-72 rounded-xl shadow-2xl border-4 border-card/50 backdrop-blur"
				/>
			</div>

			<!-- Main Info -->
			<div class="flex-1 space-y-6">
				<div>
					<h1
						class="text-4xl md:text-6xl font-bold text-foreground mb-3 drop-shadow-lg"
					>
						{title}
					</h1>
					{#if details.tagline}
						<p
							class="text-xl md:text-2xl text-muted-foreground italic"
						>
							{details.tagline}
						</p>
					{/if}
				</div>

				<div class="flex flex-wrap gap-3 items-center">
					<Badge
						variant="secondary"
						class="flex items-center gap-2 px-4 py-2 text-lg bg-card/80 backdrop-blur"
					>
						<Star class="w-5 h-5 fill-yellow-400 text-yellow-400" />
						<span class="font-bold"
							>{details.vote_average?.toFixed(1)}</span
						>
						<span class="text-muted-foreground text-sm">/ 10</span>
					</Badge>

					{#if releaseDate}
						<Badge
							variant="secondary"
							class="flex items-center gap-2 px-4 py-2 text-base bg-card/80 backdrop-blur"
						>
							<Calendar class="w-5 h-5" />
							<span>{new Date(releaseDate).getFullYear()}</span>
						</Badge>
					{/if}

					{#if type === "movie" && details.runtime}
						<Badge
							variant="secondary"
							class="flex items-center gap-2 px-4 py-2 text-base bg-card/80 backdrop-blur"
						>
							<Clock class="w-5 h-5" />
							<span
								>{Math.floor(details.runtime / 60)}h {details.runtime %
									60}m</span
							>
						</Badge>
					{:else if type === "tv" && details.number_of_seasons}
						<Badge
							variant="secondary"
							class="flex items-center gap-2 px-4 py-2 text-base bg-card/80 backdrop-blur"
						>
							<Film class="w-5 h-5" />
							<span
								>{details.number_of_seasons} Season{details.number_of_seasons >
								1
									? "s"
									: ""}</span
							>
						</Badge>
					{/if}
				</div>

				{#if details.genres && details.genres.length > 0}
					<div class="flex flex-wrap gap-2">
						{#each details.genres as genre}
							<Badge
								variant="outline"
								class="px-4 py-1.5 text-sm bg-card/50 backdrop-blur"
							>
								{genre.name}
							</Badge>
						{/each}
					</div>
				{/if}

				{#if trailer}
					<Button
						class="gap-2 px-6 py-6 text-lg"
						onclick={() =>
							window.open(
								`https://www.youtube.com/watch?v=${trailer.key}`,
								"_blank",
							)}
					>
						<Play class="w-5 h-5 fill-current" />
						Watch Trailer
					</Button>
				{/if}

				<div>
					<h2 class="text-2xl font-bold mb-3 flex items-center gap-2">
						<Film class="w-6 h-6" />
						Overview
					</h2>
					<p class="text-muted-foreground leading-relaxed text-lg">
						{details.overview}
					</p>
				</div>

				{#if crew.length > 0}
					<div>
						<h3 class="text-xl font-bold mb-3">Key Crew</h3>
						<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
							{#each crew as member}
								<div>
									<p class="font-semibold text-foreground">
										{member.name}
									</p>
									<p class="text-sm text-muted-foreground">
										{member.job}
									</p>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Image Gallery -->
		{#if allImages.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2
						class="text-3xl md:text-4xl font-bold flex items-center gap-3"
					>
						<Image class="w-8 h-8" />
						Gallery
					</h2>
				</div>
				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-4">
						{#each allImages.slice(0, 20) as img, i}
							<button
								type="button"
								onclick={() => openLightbox(i)}
								class="flex-shrink-0 w-[280px] h-[180px] overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary"
							>
								<img
									src={`https://image.tmdb.org/t/p/w500${img.file_path}`}
									alt={title}
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
			<div
				class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
			>
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
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>

					<!-- Image -->
					<div
						class="bg-muted/20 rounded-xl overflow-hidden shadow-2xl"
					>
						<img
							src={`https://image.tmdb.org/t/p/original${allImages[currentIndex].file_path}`}
							alt={title}
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
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>

					<!-- Close Button -->
					<button
						type="button"
						class="absolute right-4 top-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
						onclick={closeLightbox}
						aria-label="Close"
					>
						<svg
							class="w-6 h-6"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>

					<!-- Image Counter -->
					<div
						class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm"
					>
						{currentIndex + 1} / {allImages.length}
					</div>
				</div>
			</div>
		{/if}

		<!-- Cast Section -->
		{#if cast.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2
						class="text-3xl md:text-4xl font-bold flex items-center gap-3"
					>
						<Users class="w-8 h-8" />
						Cast
					</h2>
				</div>
				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-6 px-4 md:px-0 pb-4">
						{#each cast as actor}
							<a
								href="/person/{actor.id}"
								class="flex-shrink-0 w-80 group block"
							>
								<Card.Root
									class="relative overflow-hidden rounded-3xl bg-card/40 border border-border/60 transition-colors duration-300"
								>
									<div class="relative h-80 md:h-96 w-full">
										{#if actor.profile_path}
											<img
												src="https://image.tmdb.org/t/p/w500{actor.profile_path}"
												alt={actor.name}
												class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
												loading="lazy"
											/>
										{:else}
											<div
												class="w-full h-full flex items-center justify-center bg-muted"
											>
												<Users
													class="w-20 h-20 text-muted-foreground/30"
												/>
											</div>
										{/if}

										<!-- Gradient overlay -->
										<div
											class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"
										></div>

										<!-- Content -->
										<div
											class="absolute inset-x-0 bottom-0 p-5 md:p-6"
										>
											<div class="space-y-3">
												<!-- Badge -->
												<div
													class="flex items-center gap-2"
												>
													<Badge
														class="bg-white/10 backdrop-blur px-3 py-1 uppercase tracking-wide text-[0.7rem] md:text-xs"
													>
														Cast
													</Badge>
												</div>

												<!-- Actor Name -->
												<Card.Title
													class="text-xl md:text-2xl font-bold text-white drop-shadow-sm line-clamp-2 group-hover:text-primary transition-colors"
												>
													{actor.name}
												</Card.Title>

												<!-- Character -->
												{#if actor.character}
													<p
														class="text-xs md:text-sm text-gray-200/90 leading-relaxed line-clamp-2"
													>
														as {actor.character}
													</p>
												{/if}
											</div>
										</div>
									</div>
								</Card.Root>
							</a>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- Additional Info -->
		<section class="mb-16 space-y-8">
			<div class="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
				<Card.Root class="p-6 space-y-4">
					<h3 class="text-xl font-bold flex items-center gap-2">
						<Ticket class="w-5 h-5 text-primary" />
						Quick facts
					</h3>
					<div class="space-y-3 text-sm">
						{#if primaryCertification}
							<div class="flex justify-between">
								<span class="text-muted-foreground">Rating:</span>
								<span class="font-semibold">{primaryCertification}</span>
							</div>
						{/if}
						{#if releaseDate}
							<div class="flex justify-between">
								<span class="text-muted-foreground">Released:</span>
								<span class="font-semibold"
									>{new Date(releaseDate).toLocaleDateString()}</span
								>
							</div>
						{/if}
						{#if details.status}
							<div class="flex justify-between">
								<span class="text-muted-foreground">Status:</span>
								<span class="font-semibold">{details.status}</span>
							</div>
						{/if}
						{#if details.original_language}
							<div class="flex justify-between">
								<span class="text-muted-foreground">Original language:</span>
								<span class="font-semibold text-right"
									>{details.original_language.toUpperCase()}</span
								>
							</div>
						{/if}
						{#if details.popularity}
							<div class="flex justify-between">
								<span class="text-muted-foreground">Popularity:</span>
								<span class="font-semibold"
									>{details.popularity.toFixed(0)}</span
								>
							</div>
						{/if}
						{#if details.homepage}
							<a
								href={details.homepage}
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary text-sm hover:underline block"
								>Official site ↗</a
							>
						{/if}
					</div>
				</Card.Root>

 				<Card.Root class="p-6 space-y-4">
					<h3 class="text-xl font-bold">
						{type === "tv" ? "Series format" : "Film format"}
					</h3>
					<div class="space-y-3 text-sm">
						{#if type === "tv"}
							{#if details.number_of_seasons}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Seasons:</span>
									<span class="font-semibold">{details.number_of_seasons}</span>
								</div>
							{/if}
							{#if details.number_of_episodes}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Episodes:</span>
									<span class="font-semibold">{details.number_of_episodes}</span>
								</div>
							{/if}
							{#if details.episode_run_time?.length}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Episode runtime:</span>
									<span class="font-semibold"
										>{details.episode_run_time[0]} min</span
									>
								</div>
							{/if}
						{:else}
							{#if details.runtime}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Runtime:</span>
									<span class="font-semibold"
										>{Math.floor(details.runtime / 60)}h
										{details.runtime % 60}m</span
									>
								</div>
							{/if}
							{#if details.budget}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Budget:</span>
									<span class="font-semibold">{usdFormatter.format(details.budget)}</span>
								</div>
							{/if}
							{#if details.revenue}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Revenue:</span>
									<span class="font-semibold">{usdFormatter.format(details.revenue)}</span>
								</div>
							{/if}
						{/if}
					</div>
				</Card.Root>

				<Card.Root class="p-6 space-y-4">
					<h3 class="text-xl font-bold flex items-center gap-2">
						<Globe class="w-5 h-5 text-primary" />
						Languages & origin
					</h3>
					<div class="space-y-4 text-sm">
						{#if spokenLanguages.length}
							<div>
								<p class="text-muted-foreground mb-1">Spoken languages</p>
								<div class="flex flex-wrap gap-2">
									{#each spokenLanguages as language}
										<Badge variant="outline" class="bg-card/40"
											>{language.english_name || language.name}</Badge
										>
									{/each}
								</div>
							</div>
						{/if}
						{#if productionCountries.length}
							<div>
								<p class="text-muted-foreground mb-1">Production countries</p>
								<div class="flex flex-wrap gap-2">
									{#each productionCountries as country}
										<Badge variant="secondary" class="bg-card/60"
											>{country.name}</Badge
										>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</Card.Root>
			</div>

			{#if productionCompanies.length || networks.length}
				<Card.Root class="p-6 space-y-6">
					<h3 class="text-xl font-bold">Production & Networks</h3>
					{#if productionCompanies.length}
						<div>
							<p class="text-sm text-muted-foreground mb-3">Studios</p>
							<div class="flex flex-wrap gap-4">
								{#each productionCompanies as company}
									<div class="flex items-center gap-2">
										{#if company.logo_path}
											<img
												src="https://image.tmdb.org/t/p/w200{company.logo_path}"
												alt={company.name}
												class="h-6 object-contain"
											/>
										{:else}
											<span class="text-sm text-muted-foreground">{company.name}</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
					{#if networks.length}
						<div>
							<p class="text-sm text-muted-foreground mb-3">Networks</p>
							<div class="flex flex-wrap gap-4">
								{#each networks as network}
									<div class="flex items-center gap-2">
										{#if network.logo_path}
											<img
												src="https://image.tmdb.org/t/p/w200{network.logo_path}"
												alt={network.name}
												class="h-6 object-contain"
											/>
										{:else}
											<span class="text-sm text-muted-foreground">{network.name}</span>
										{/if}
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</Card.Root>
			{/if}
		</section>

		{#if type === "tv" && (lastEpisode || nextEpisode)}
			<section class="mb-16 space-y-6">
				<div class="flex items-center gap-2">
					<Tv2 class="w-6 h-6" />
					<h2 class="text-3xl font-bold">Episode timeline</h2>
				</div>
				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					{#if lastEpisode}
						<a
							href={`/tv/${details.id}/season/${lastEpisode.season_number}/episode/${lastEpisode.episode_number}`}
							class="group block"
						>
							<Card.Root class="relative overflow-hidden rounded-3xl bg-card/40 border border-border/60">
							<div class="relative h-64">
								{#if lastEpisode.still_path}
									<img
										src={`https://image.tmdb.org/t/p/w780${lastEpisode.still_path}`}
										alt={lastEpisode.name}
										class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
									/>
								{:else}
									<div class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
										<Tv2 class="w-10 h-10" />
									</div>
								{/if}
								<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
								<div class="absolute top-4 left-4">
									<Badge class="bg-white/10 backdrop-blur text-white">Last aired</Badge>
								</div>
								<div class="absolute inset-x-0 bottom-0 p-5 space-y-2 text-white">
									<h3 class="text-xl font-semibold drop-shadow">{lastEpisode.name}</h3>
									<p class="text-sm text-white/80">
										S{lastEpisode.season_number} · E{lastEpisode.episode_number} ·
										{lastEpisode.air_date
											? new Date(lastEpisode.air_date).toLocaleDateString()
											: "TBA"}
									</p>
									<p class="text-sm text-white/70 leading-relaxed line-clamp-3">
										{lastEpisode.overview || "Synopsis not available."}
									</p>
								</div>
							</div>
							</Card.Root>
						</a>
					{/if}

					{#if nextEpisode}
						<a
							href={`/tv/${details.id}/season/${nextEpisode.season_number}/episode/${nextEpisode.episode_number}`}
							class="group block"
						>
							<Card.Root class="relative overflow-hidden rounded-3xl bg-card/40 border border-border/60">
							<div class="relative h-64">
								{#if nextEpisode.still_path}
									<img
										src={`https://image.tmdb.org/t/p/w780${nextEpisode.still_path}`}
										alt={nextEpisode.name}
										class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
									/>
								{:else}
									<div class="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
										<Tv2 class="w-10 h-10" />
									</div>
								{/if}
								<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
								<div class="absolute top-4 left-4">
									<Badge class="bg-primary/90 text-white">Next up</Badge>
								</div>
								<div class="absolute inset-x-0 bottom-0 p-5 space-y-2 text-white">
									<h3 class="text-xl font-semibold drop-shadow">{nextEpisode.name}</h3>
									<p class="text-sm text-white/80">
										S{nextEpisode.season_number} · E{nextEpisode.episode_number} ·
										{nextEpisode.air_date
											? new Date(nextEpisode.air_date).toLocaleDateString()
											: "Date TBA"}
									</p>
									<p class="text-sm text-white/70 leading-relaxed line-clamp-3">
										{nextEpisode.overview || "Synopsis not available."}
									</p>
								</div>
							</div>
							</Card.Root>
						</a>
					{/if}
				</div>
			</section>
		{/if}

		{#if type === "tv" && seasons.length}
			<section class="mb-16">
				<div class="mb-6 flex items-center gap-3">
					<Clapperboard class="w-6 h-6" />
					<h2 class="text-3xl font-bold">Seasons</h2>
				</div>
				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-4">
						{#each seasons as season}
							<a
								href={`/tv/${details.id}/season/${season.season_number}`}
								class="flex-shrink-0 w-[240px] group block"
							>
								<Card.Root class="relative overflow-hidden rounded-3xl bg-card/40 border border-border/60 h-full transition-transform duration-300 group-hover:-translate-y-1">
									<div class="relative h-72">
										{#if season.poster_path}
											<img
												src={`https://image.tmdb.org/t/p/w500${season.poster_path}`}
												alt={season.name}
												class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
												loading="lazy"
											/>
										{:else}
											<div class="w-full h-full flex items-center justify-center text-muted-foreground bg-muted">
												<Clapperboard class="w-10 h-10" />
											</div>
										{/if}
										<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
										<div class="absolute top-4 left-4 flex items-center gap-2 text-xs">
											<Badge class="bg-white/10 text-white px-3 py-1 uppercase tracking-wide">
												Season {season.season_number ?? ""}
											</Badge>
											{#if season.air_date}
												<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/40 text-white/80">
													{new Date(season.air_date).getFullYear()}
												</span>
											{/if}
										</div>
										<div class="absolute inset-x-0 bottom-0 p-4 space-y-2 text-white">
											<h3 class="font-semibold text-lg line-clamp-2 drop-shadow">
												{season.name}
											</h3>
											<p class="text-sm text-white/80">
												{season.episode_count} episode{season.episode_count === 1 ? "" : "s"}
											</p>
											<p class="text-xs text-white/80 leading-relaxed line-clamp-3">
												{season.overview || "No overview yet."}
											</p>
										</div>
									</div>
								</Card.Root>
							</a>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		{#if providerSections.length}
			<section class="mb-16 space-y-6">
				<div class="flex flex-col gap-2">
					<div class="flex items-center gap-2">
						<MonitorPlay class="w-6 h-6" />
						<h2 class="text-3xl font-bold">Where to watch</h2>
					</div>
					{#if providerRegion?.link}
						<a
							href={providerRegion.link}
							target="_blank"
							rel="noopener noreferrer"
							class="text-sm text-primary hover:underline w-fit"
							>Open on JustWatch ↗</a
						>
					{/if}
					{#if providerRegionCode}
						<p class="text-sm text-muted-foreground">
							Showing availability for {providerRegionCode}.
						</p>
					{/if}
				</div>
				<div class="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
					{#each providerSections as section}
						<Card.Root class="p-6 space-y-4">
							<h3 class="text-lg font-semibold">{section.label}</h3>
							<div class="flex flex-wrap gap-3">
								{#each section.items as provider}
									<div class="flex flex-col items-center text-center w-20 gap-2">
										{#if provider.logo_path}
											<img
												src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
												alt={provider.provider_name}
												class="w-12 h-12 rounded-full object-cover border border-border"
												loading="lazy"
											/>
										{:else}
											<div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
												{provider.provider_name}
											</div>
										{/if}
										<p class="text-xs text-muted-foreground">
											{provider.provider_name}
										</p>
									</div>
								{/each}
							</div>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		{#if reviewList.length}
			<section class="mb-16 space-y-6">
				<div class="flex items-center gap-2">
					<BadgeCheck class="w-6 h-6" />
					<h2 class="text-3xl font-bold">Reviews</h2>
				</div>
				<div class="grid gap-6 md:grid-cols-2">
					{#each reviewList as review}
						<Card.Root class="p-6 space-y-4 bg-card/70 backdrop-blur">
							<div class="flex items-center justify-between gap-4">
								<div>
									<p class="font-semibold">{review.author}</p>
									{#if review.author_details?.username}
										<p class="text-xs text-muted-foreground">
											@{review.author_details.username}
										</p>
									{/if}
								</div>
								{#if review.author_details?.rating}
									<Badge variant="secondary" class="px-3 py-1">
										{review.author_details.rating}/10
									</Badge>
								{/if}
							</div>
							<p class="text-sm text-muted-foreground leading-relaxed line-clamp-6">
								{review.content}
							</p>
							<a
								href={review.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-sm text-primary hover:underline"
								>Read full review ↗</a
							>
						</Card.Root>
					{/each}
				</div>
			</section>
		{/if}

		{#if keywordList.length}
			<section class="mb-16 space-y-4">
				<div class="flex items-center gap-2">
					<ScrollText class="w-6 h-6" />
					<h2 class="text-3xl font-bold">Keywords</h2>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each keywordList.slice(0, 16) as keyword}
						<Badge variant="outline" class="bg-card/40">
							{keyword.name}
						</Badge>
					{/each}
				</div>
			</section>
		{/if}

		{#if recommendations?.results && recommendations.results.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2 class="text-3xl md:text-4xl font-bold">
						Recommended for you
					</h2>
				</div>
				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-4">
						{#each recommendations.results.slice(0, 12) as item}
							<div class="flex-shrink-0 w-[280px]">
								<MediaCard media={item} type={mediaType} />
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- Similar Content -->
		{#if similar?.results && similar.results.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2 class="text-3xl md:text-4xl font-bold">
						More Like This
					</h2>
				</div>
				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-4">
						{#each similar.results.slice(0, 12) as item}
							<div class="flex-shrink-0 w-[280px]">
								<MediaCard media={item} type={mediaType} />
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}
	</div>
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
