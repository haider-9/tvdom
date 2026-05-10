<script lang="ts">
	import { Star, Calendar } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		media: any;
		type: 'movie' | 'tv';
		/** Use poster (portrait) layout instead of backdrop (landscape). Default: false */
		poster?: boolean;
	}

	let { media, type, poster = false }: Props = $props();

	const title = type === 'movie' ? media.title : media.name;
	const releaseDate = type === 'movie' ? media.release_date : media.first_air_date;

	// Poster mode: portrait image, backdrop mode: landscape image
	const imageUrl = poster
		? (media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '/placeholder.svg')
		: (media.backdrop_path
			? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
			: (media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '/placeholder.svg'));

	function handleCardClick() {
		goto(`/${type}/${media.id}`);
	}
</script>

{#if poster}
	<!-- Poster (portrait) layout -->
	<button class="group block cursor-pointer w-full text-left" onclick={handleCardClick}>
		<div class="relative overflow-hidden rounded-xl border border-border/60 bg-card/40 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
			<!-- Poster image -->
			<div class="relative aspect-[2/3] w-full overflow-hidden">
				<img
					src={imageUrl}
					alt={title}
					class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
					loading="lazy"
				/>
				<!-- Rating badge top-right -->
				{#if media.vote_average}
					<div class="absolute top-2 right-2">
						<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur text-xs text-white font-semibold">
							<Star class="w-3 h-3 fill-yellow-400 text-yellow-400" />
							{media.vote_average.toFixed(1)}
						</span>
					</div>
				{/if}
			</div>
			<!-- Title + year below image -->
			<div class="p-3 space-y-0.5">
				<p class="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
					{title}
				</p>
				{#if releaseDate}
					<p class="text-xs text-muted-foreground">{new Date(releaseDate).getFullYear()}</p>
				{/if}
			</div>
		</div>
	</button>
{:else}
	<!-- Backdrop (landscape) layout — original style -->
	<button class="group block cursor-pointer w-full text-left" onclick={handleCardClick}>
		<Card.Root class="relative overflow-hidden rounded-2xl md:rounded-3xl w-full bg-card/40 border border-border/60 transition-colors duration-300">
			<div class="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full">
				<img
					src={imageUrl}
					alt={title}
					class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
					loading="lazy"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>
				<div class="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5 lg:p-6">
					<div class="space-y-2 sm:space-y-3">
						<div class="flex items-center gap-1.5 sm:gap-2 text-xs">
							<Badge class="bg-white/10 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 uppercase tracking-wide text-[0.65rem] sm:text-[0.7rem] md:text-xs">
								{type}
							</Badge>
							{#if releaseDate}
								<span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-white/90">
									<Calendar class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
									{new Date(releaseDate).getFullYear()}
								</span>
							{/if}
							{#if media.vote_average}
								<span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-white/90 ml-auto">
									<Star class="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
									<span class="font-semibold">{media.vote_average.toFixed(1)}</span>
								</span>
							{/if}
						</div>
						<Card.Title class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-sm line-clamp-2 group-hover:text-primary transition-colors">
							{title}
						</Card.Title>
						{#if media.overview}
							<p class="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2 sm:line-clamp-3">
								{media.overview}
							</p>
						{/if}
					</div>
				</div>
			</div>
		</Card.Root>
	</button>
{/if}
