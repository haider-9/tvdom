<script lang="ts">
	import {
		Star,
		Calendar,
		Clock,
		Play,
		Users,
		Film,
		Image,
		Plus,
		Heart,
		Check,
		Bookmark,
	} from "lucide-svelte";
	import * as Card from "$lib/components/ui/card";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import { Badge } from "$lib/components/ui/badge";
	import { Button } from "$lib/components/ui/button";
	import { toast } from "$lib/components/ui/toast";
	import { userStore } from "$lib/stores/user.svelte.js";
	import MediaCard from "$lib/components/MediaCard.svelte";
	import type { PageData } from "./$types";

	let { data }: { data: PageData } = $props();

	const { details, credits, videos, similar, images, type } = data;
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

	let lightboxOpen = $state(false);
	let currentIndex = $state(0);

	// User interaction states
	let isInWatchlist = $derived(
		userStore.userWatchlist.some(item => item.mediaId === details.id.toString())
	);

	let isWatched = $derived(
		userStore.userWatched.some(item => item.mediaId === details.id.toString())
	);

	let userRating = $derived(
		userStore.userRatings.find(rating => rating.mediaId === details.id.toString())
	);

	// User actions
	async function addToWatchlist() {
		if (!userStore.isAuthenticated) {
			toast.error("Please sign in to add to watchlist");
			return;
		}

		const promise = userStore.addToWatchlist(
			details.id.toString(),
			mediaType,
			title,
			posterUrl
		);

		toast.promise(promise, {
			loading: "Adding to watchlist...",
			success: `Added "${title}" to your watchlist!`,
			error: "Failed to add to watchlist"
		});
	}

	async function removeFromWatchlist() {
		const promise = userStore.removeFromWatchlist(details.id.toString());

		toast.promise(promise, {
			loading: "Removing from watchlist...",
			success: `Removed "${title}" from your watchlist`,
			error: "Failed to remove from watchlist"
		});
	}

	async function markAsWatched() {
		if (!userStore.isAuthenticated) {
			toast.error("Please sign in to mark as watched");
			return;
		}

		const promise = userStore.markAsWatched(
			details.id.toString(),
			mediaType,
			title
		);

		toast.promise(promise, {
			loading: "Marking as watched...",
			success: `Marked "${title}" as watched!`,
			error: "Failed to mark as watched"
		});
	}

	async function rateMedia(rating: number) {
		if (!userStore.isAuthenticated) {
			toast.error("Please sign in to rate");
			return;
		}

		const promise = userStore.addRating(
			details.id.toString(),
			mediaType,
			rating
		);

		toast.promise(promise, {
			loading: "Adding rating...",
			success: `Rated "${title}" ${rating}/10!`,
			error: "Failed to add rating"
		});
	}

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
</script>

<svelte:head>
	<title>{title} - TVDom</title>
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

				<!-- User Actions -->
				<div class="flex flex-wrap gap-4">
					<!-- Watchlist Button -->
					{#if isInWatchlist}
						<Button
							variant="secondary"
							class="gap-2 px-6 py-3 text-base"
							onclick={removeFromWatchlist}
						>
							<Check class="w-5 h-5" />
							In Watchlist
						</Button>
					{:else}
						<Button
							variant="outline"
							class="gap-2 px-6 py-3 text-base"
							onclick={addToWatchlist}
						>
							<Plus class="w-5 h-5" />
							Add to Watchlist
						</Button>
					{/if}

					<!-- Watched Button -->
					{#if isWatched}
						<Button
							variant="secondary"
							class="gap-2 px-6 py-3 text-base"
							disabled
						>
							<Heart class="w-5 h-5 fill-current" />
							Watched
						</Button>
					{:else}
						<Button
							variant="outline"
							class="gap-2 px-6 py-3 text-base"
							onclick={markAsWatched}
						>
							<Heart class="w-5 h-5" />
							Mark as Watched
						</Button>
					{/if}

					<!-- Rating Dropdown -->
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button
								variant={userRating ? "secondary" : "outline"}
								class="gap-2 px-6 py-3 text-base"
							>
								<Star class="w-5 h-5 {userRating ? 'fill-yellow-400 text-yellow-400' : ''}" />
								{userRating ? `${userRating.rating}/10` : 'Rate'}
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="w-48">
							<DropdownMenu.Item class="font-medium text-xs text-muted-foreground">
								{#snippet children()}
									Rate this {mediaType}
								{/snippet}
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							{#each [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as rating}
								<DropdownMenu.Item 
									onclick={() => rateMedia(rating)}
									class="flex items-center justify-between"
								>
									{#snippet children()}
										<span>{rating}/10</span>
										<div class="flex">
											{#each Array(Math.ceil(rating/2)) as _}
												<Star class="h-3 w-3 fill-yellow-400 text-yellow-400" />
											{/each}
										</div>
									{/snippet}
								</DropdownMenu.Item>
							{/each}
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>

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
		<section class="mb-16">
			<div class="grid md:grid-cols-2 gap-8">
				{#if type === "tv"}
					<Card.Root class="p-6">
						<h3 class="text-xl font-bold mb-4">TV Show Info</h3>
						<div class="space-y-2 text-sm">
							{#if details.number_of_seasons}
								<div class="flex justify-between">
									<span class="text-muted-foreground"
										>Seasons:</span
									>
									<span class="font-semibold"
										>{details.number_of_seasons}</span
									>
								</div>
							{/if}
							{#if details.number_of_episodes}
								<div class="flex justify-between">
									<span class="text-muted-foreground"
										>Episodes:</span
									>
									<span class="font-semibold"
										>{details.number_of_episodes}</span
									>
								</div>
							{/if}
							{#if details.status}
								<div class="flex justify-between">
									<span class="text-muted-foreground"
										>Status:</span
									>
									<span class="font-semibold"
										>{details.status}</span
									>
								</div>
							{/if}
						</div>
					</Card.Root>
				{:else}
					<Card.Root class="p-6">
						<h3 class="text-xl font-bold mb-4">Movie Info</h3>
						<div class="space-y-2 text-sm">
							{#if details.budget}
								<div class="flex justify-between">
									<span class="text-muted-foreground"
										>Budget:</span
									>
									<span class="font-semibold"
										>${(details.budget / 1000000).toFixed(
											1,
										)}M</span
									>
								</div>
							{/if}
							{#if details.revenue}
								<div class="flex justify-between">
									<span class="text-muted-foreground"
										>Revenue:</span
									>
									<span class="font-semibold"
										>${(details.revenue / 1000000).toFixed(
											1,
										)}M</span
									>
								</div>
							{/if}
							{#if details.status}
								<div class="flex justify-between">
									<span class="text-muted-foreground"
										>Status:</span
									>
									<span class="font-semibold"
										>{details.status}</span
									>
								</div>
							{/if}
						</div>
					</Card.Root>
				{/if}

				{#if details.production_companies && details.production_companies.length > 0}
					<Card.Root class="p-6">
						<h3 class="text-xl font-bold mb-4">Production</h3>
						<div class="flex flex-wrap gap-4">
							{#each details.production_companies.slice(0, 4) as company}
								<div class="flex items-center gap-2">
									{#if company.logo_path}
										<img
											src="https://image.tmdb.org/t/p/w200{company.logo_path}"
											alt={company.name}
											class="h-6 object-contain"
										/>
									{:else}
										<span
											class="text-sm text-muted-foreground"
											>{company.name}</span
										>
									{/if}
								</div>
							{/each}
						</div>
					</Card.Root>
				{/if}
			</div>
		</section>

		<!-- Similar Content -->
		{#if similar?.results && similar.results.length > 0}
			<section class="mb-16">
				<div class="mb-8">
					<h2 class="text-3xl md:text-4xl font-bold">
						More Like This
					</h2>
				</div>
				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-16 px-4 md:px-0 pb-4">
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
