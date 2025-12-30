<script lang="ts">
	import { Star, Calendar } from 'lucide-svelte';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';

	interface Props {
		media: any;
		type: 'movie' | 'tv';
	}

	let { media, type }: Props = $props();

	const title = type === 'movie' ? media.title : media.name;
	const releaseDate = type === 'movie' ? media.release_date : media.first_air_date;
	const imageUrl = media.poster_path
		? `https://image.tmdb.org/t/p/w500${media.poster_path}`
		: '/placeholder.svg';
	const backdropUrl = media.backdrop_path
		? `https://image.tmdb.org/t/p/w780${media.backdrop_path}`
		: imageUrl;

	function handleCardClick() {
		goto(`/${type}/${media.id}`);
	}
</script>

<button class="group block cursor-pointer w-full text-left" onclick={handleCardClick}>
	<Card.Root class="relative overflow-hidden rounded-2xl md:rounded-3xl w-full bg-card/40 border border-border/60 transition-colors duration-300">
		<!-- Full-card image -->
		<div class="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full">
			<img
				src={backdropUrl}
				alt={title}
				class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
				loading="lazy"
			/>

			<!-- Soft gradient overlay to make text readable -->
			<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

			<!-- Floating content block (title, description, meta) -->
			<div class="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5 lg:p-6">
				<div class="space-y-2 sm:space-y-3">
					<!-- Badges / meta row -->
					<div class="flex items-center gap-1.5 sm:gap-2 text-xs">
						<Badge class="bg-white/10 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 uppercase tracking-wide text-[0.65rem] sm:text-[0.7rem] md:text-xs">
							{type}
						</Badge>

						{#if releaseDate}
							<span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-gray-200">
								<Calendar class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
								{new Date(releaseDate).getFullYear()}
							</span>
						{/if}

						{#if media.vote_average}
							<span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-gray-200 ml-auto">
								<Star class="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
								<span class="font-semibold">{media.vote_average.toFixed(1)}</span>
							</span>
						{/if}
					</div>

					<!-- Title -->
					<Card.Title class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-sm line-clamp-2 group-hover:text-primary transition-colors">
						{title}
					</Card.Title>

					<!-- Description -->
					{#if media.overview}
						<p class="text-xs sm:text-sm text-gray-200/90 leading-relaxed line-clamp-2 sm:line-clamp-3">
							{media.overview}
						</p>
					{/if}
				</div>
			</div>
		</div>
	</Card.Root>
</button>
