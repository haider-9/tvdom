<script lang="ts">
	import {
		ArrowLeft,
		Calendar,
		Clock,
		Star,
		Users,
		Clapperboard,
		Film,
		Image
	} from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { show, season, episode, credits, images } = data;

	const stillUrl = episode.still_path
		? `https://image.tmdb.org/t/p/original${episode.still_path}`
		: show.backdrop_path
			? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
			: '';

	const cast = credits?.cast?.slice(0, 10) || [];
	const guestStars = episode.guest_stars?.slice(0, 8) || [];
	const crew = credits?.crew?.slice(0, 8) || [];
	const stills = images?.stills || [];

	const episodeTitle = `${show.name} • S${season.season_number}E${episode.episode_number} — ${episode.name}`;

	function formatDate(value?: string) {
		return value ? new Date(value).toLocaleDateString() : 'TBA';
	}
</script>

<svelte:head>
	<title>{episodeTitle} - TVDom</title>
</svelte:head>

<div class="min-h-screen">
	<div class="relative h-[45vh] md:h-[55vh] w-full overflow-hidden">
		{#if stillUrl}
			<img src={stillUrl} alt={episode.name} class="w-full h-full object-cover" />
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
		{:else}
			<div class="w-full h-full bg-muted"></div>
		{/if}
	</div>

	<div class="container mx-auto px-4 -mt-32 relative z-10 pb-16 space-y-10">
		<div class="flex flex-col lg:flex-row gap-8 items-start">
			<div class="space-y-4 flex-1">
				<div class="flex flex-wrap gap-3 text-sm text-muted-foreground">
					<a href={`/tv/${show.id}`} class="inline-flex items-center gap-2 text-primary hover:underline">
						<ArrowLeft class="w-4 h-4" />
						Back to series
					</a>
					<a
						href={`/tv/${show.id}/season/${season.season_number}`}
						class="inline-flex items-center gap-2 text-primary hover:underline"
					>
						<Clapperboard class="w-4 h-4" />
						Season {season.season_number}
					</a>
				</div>

				<div>
					<p class="text-sm uppercase tracking-wide text-muted-foreground mb-2">
						Season {season.season_number} · Episode {episode.episode_number}
					</p>
					<h1 class="text-4xl md:text-5xl font-bold text-foreground mb-3">{episode.name}</h1>
					<p class="text-lg text-muted-foreground leading-relaxed">
						{episode.overview || 'No synopsis yet — check back later.'}
					</p>
				</div>

				<div class="flex flex-wrap gap-3">
					{#if episode.air_date}
						<Badge variant="secondary" class="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
							<Calendar class="w-4 h-4" />
							<span>{formatDate(episode.air_date)}</span>
						</Badge>
					{/if}
					{#if episode.runtime}
						<Badge variant="secondary" class="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
							<Clock class="w-4 h-4" />
							<span>{episode.runtime} minutes</span>
						</Badge>
					{/if}
					{#if episode.vote_average}
						<Badge variant="secondary" class="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
							<Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
							<span>{episode.vote_average.toFixed(1)} / 10</span>
						</Badge>
					{/if}
				</div>
			</div>
		</div>

		{#if stills.length}
			<section class="space-y-4">
				<div class="flex items-center gap-2">
					<Image class="w-5 h-5" />
					<h2 class="text-2xl font-bold">Episode gallery</h2>
				</div>
				<div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
					<div class="flex gap-4 px-4 md:px-0 pb-2">
						{#each stills.slice(0, 12) as still}
							<div class="flex-shrink-0 w-[260px] h-[150px] rounded-2xl overflow-hidden border border-border/60 bg-muted/40">
								<img
									src={`https://image.tmdb.org/t/p/w780${still.file_path}`}
									alt={`Still from ${episode.name}`}
									class="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<div class="grid lg:grid-cols-3 gap-6">
			<Card.Root class="p-6 space-y-4">
				<h3 class="text-xl font-bold flex items-center gap-2">
					<Film class="w-5 h-5" />
					Episode info
				</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Season</span>
						<span class="font-semibold">{season.name}</span>
					</div>
					{#if episode.production_code}
						<div class="flex justify-between">
							<span class="text-muted-foreground">Production code</span>
							<span class="font-semibold">{episode.production_code}</span>
						</div>
					{/if}
					{#if episode.still_path}
						<div class="flex justify-between">
							<span class="text-muted-foreground">Still</span>
							<span class="font-semibold">Available</span>
						</div>
					{/if}
				</div>
			</Card.Root>

			<Card.Root class="p-6 space-y-4 lg:col-span-2">
				<h3 class="text-xl font-bold flex items-center gap-2">
					<Users class="w-5 h-5" />
					Guest stars
				</h3>
				{#if guestStars.length}
					<div class="grid sm:grid-cols-2 gap-4">
						{#each guestStars as guest}
							<div>
								<p class="font-semibold text-foreground">{guest.name}</p>
								{#if guest.character}
									<p class="text-sm text-muted-foreground">as {guest.character}</p>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">Guest star data not available.</p>
				{/if}
			</Card.Root>
		</div>

		<div class="grid lg:grid-cols-2 gap-6">
			<Card.Root class="p-6 space-y-4">
				<h3 class="text-xl font-bold flex items-center gap-2">
					<Users class="w-5 h-5" />
					Main cast
				</h3>
				{#if cast.length}
					<div class="grid sm:grid-cols-2 gap-4">
						{#each cast as member}
							<div>
								<p class="font-semibold text-foreground">{member.name}</p>
								{#if member.character}
									<p class="text-sm text-muted-foreground">as {member.character}</p>
								{/if}
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">Cast data not available.</p>
				{/if}
			</Card.Root>

			<Card.Root class="p-6 space-y-4">
				<h3 class="text-xl font-bold flex items-center gap-2">
					<Users class="w-5 h-5" />
					Crew
				</h3>
				{#if crew.length}
					<div class="grid sm:grid-cols-2 gap-4">
						{#each crew as member}
							<div>
								<p class="font-semibold text-foreground">{member.name}</p>
								<p class="text-sm text-muted-foreground">{member.job}</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-sm text-muted-foreground">Crew data not available.</p>
				{/if}
			</Card.Root>
		</div>

		<div class="flex flex-wrap gap-3">
			<Button variant="secondary" class="gap-2" onclick={() => history.back()}>
				<ArrowLeft class="w-4 h-4" />
				Back
			</Button>
			<a href={`/tv/${show.id}/season/${season.season_number}`} class="inline-flex">
				<Button class="gap-2">
					<Clapperboard class="w-4 h-4" />
					View season
				</Button>
			</a>
		</div>
	</div>
</div>

