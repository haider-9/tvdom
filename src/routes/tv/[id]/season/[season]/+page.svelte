<script lang="ts">
	import { Calendar, Clock, Users, Film, ArrowLeft, Tv2 } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const { show, season, credits } = data;

	const backdropUrl = show.backdrop_path
		? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
		: '';
	const posterUrl = season.poster_path
		? `https://image.tmdb.org/t/p/w500${season.poster_path}`
		: '';

	const episodes = season.episodes || [];
	const cast = credits?.cast?.slice(0, 12) || [];
	const crew = credits?.crew?.slice(0, 8) || [];
	const totalRuntime = episodes.reduce((sum: number, ep: any) => sum + (ep.runtime || 0), 0);

	const seasonTitle = season.name || `Season ${season.season_number}`;
	const heroTitle = `${show.name} • ${seasonTitle}`;

	function formatDate(value?: string) {
		return value ? new Date(value).toLocaleDateString() : 'TBA';
	}
</script>

<svelte:head>
	<title>{heroTitle} - TVDom</title>
</svelte:head>

<div class="min-h-screen">
	<div class="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
		{#if backdropUrl}
			<img src={backdropUrl} alt={heroTitle} class="w-full h-full object-cover" />
			<div class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-transparent"></div>
		{/if}
	</div>

	<div class="container mx-auto px-4 -mt-32 relative z-10 pb-16 space-y-12">
		<div class="flex flex-col lg:flex-row gap-8 items-start">
			<div class="flex-shrink-0 w-48 md:w-60">
				<img src={posterUrl || '/placeholder.svg'} alt={seasonTitle} class="rounded-2xl shadow-2xl border-4 border-card/50" />
			</div>

			<div class="flex-1 space-y-6">
				<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
					<a href={`/tv/${show.id}`} class="inline-flex items-center gap-2 text-primary hover:underline">
						<ArrowLeft class="w-4 h-4" /> Back to series
					</a>
					<span>Season {season.season_number}</span>
					{#if season.air_date}
						<span>Premiered {formatDate(season.air_date)}</span>
					{/if}
				</div>

				<div>
					<h1 class="text-4xl md:text-5xl font-bold text-foreground mb-2">{heroTitle}</h1>
					{#if season.overview}
						<p class="text-lg text-muted-foreground leading-relaxed">{season.overview}</p>
					{:else}
						<p class="text-lg text-muted-foreground leading-relaxed">No synopsis yet — check back later.</p>
					{/if}
				</div>

				<div class="flex flex-wrap gap-3">
					<Badge variant="secondary" class="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
						<Film class="w-4 h-4" />
						<span>{episodes.length} episode{episodes.length === 1 ? '' : 's'}</span>
					</Badge>
					{#if season.air_date}
						<Badge variant="secondary" class="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
							<Calendar class="w-4 h-4" />
							<span>{new Date(season.air_date).getFullYear()}</span>
						</Badge>
					{/if}
					{#if totalRuntime > 0}
						<Badge variant="secondary" class="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur">
							<Clock class="w-4 h-4" />
							<span>{Math.round(totalRuntime / 60)}h {totalRuntime % 60}m total</span>
						</Badge>
					{/if}
				</div>
			</div>
		</div>

		{#if episodes.length}
			<section class="space-y-6">
				<div class="flex items-center justify-between gap-4">
					<div>
						<h2 class="text-3xl font-bold flex items-center gap-2">
							<Tv2 class="w-6 h-6" />
							Episodes
						</h2>
						<p class="text-sm text-muted-foreground">Dive into each chapter of the season.</p>
					</div>
				</div>

				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each episodes as episode}
						<a
							href={`/tv/${show.id}/season/${season.season_number}/episode/${episode.episode_number}`}
							class="group block"
						>
							<Card.Root class="relative overflow-hidden rounded-3xl bg-card/40 border border-border/60 transition-colors duration-300 h-full">
								<div class="relative h-60">
									{#if episode.still_path}
										<img
											src={`https://image.tmdb.org/t/p/w780${episode.still_path}`}
											alt={episode.name}
											class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
											loading="lazy"
										/>
									{:else}
										<div class="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
											<Tv2 class="w-10 h-10" />
										</div>
									{/if}
									<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
									<div class="absolute top-4 left-4 flex items-center gap-2 text-xs text-white">
										<Badge class="bg-white/10 text-white px-3 py-1 uppercase tracking-wide">
											E{episode.episode_number}
										</Badge>
										{#if episode.runtime}
											<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50">
												<Clock class="w-3 h-3" />
												{episode.runtime}m
											</span>
										{/if}
										{#if episode.vote_average}
											<span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50">
												⭐ {episode.vote_average.toFixed(1)}
											</span>
										{/if}
									</div>
									<div class="absolute inset-x-0 bottom-0 p-5 space-y-2 text-white">
										<h3 class="text-xl font-semibold drop-shadow line-clamp-2">{episode.name}</h3>
										<p class="text-sm text-white/70">
											Aired {formatDate(episode.air_date)}
										</p>
										<p class="text-sm text-white/70 leading-relaxed line-clamp-3">
											{episode.overview || 'No overview yet.'}
										</p>
									</div>
								</div>
							</Card.Root>
						</a>
					{/each}
				</div>
			</section>
		{/if}

		<div class="grid lg:grid-cols-2 gap-6">
			<Card.Root class="p-6 space-y-4">
				<h3 class="text-xl font-bold flex items-center gap-2">
					<Users class="w-5 h-5" />
					Main cast
				</h3>
				{#if cast.length}
					<div class="grid grid-cols-2 gap-4">
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
					<div class="grid grid-cols-2 gap-4">
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

		<Button variant="secondary" class="gap-2" onclick={() => history.back()}>
			<ArrowLeft class="w-4 h-4" />
			Back
		</Button>
	</div>
</div>

