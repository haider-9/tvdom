import { getPopular, getGenres, getTrending, getTopRated, getAiringToday, discoverByGenre } from '$lib/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const section = url.searchParams.get('section') || 'popular';
	const genre = parseInt(url.searchParams.get('genre') || '0') || null;

	try {
		const genresData = await getGenres('tv');

		let mainData;
		if (genre) {
			mainData = await discoverByGenre('tv', genre, page);
		} else {
			switch (section) {
				case 'trending':
					mainData = await getTrending('tv', 'week');
					break;
				case 'top_rated':
					mainData = await getTopRated('tv', page);
					break;
				case 'airing_today':
					mainData = await getAiringToday(page);
					break;
				default:
					mainData = await getPopular('tv', page);
			}
		}

		return {
			shows: mainData.results || [],
			genres: genresData.genres || [],
			currentPage: page,
			totalPages: mainData.total_pages || 0,
			currentSection: section,
			currentGenre: genre
		};
	} catch (error) {
		console.error('Error loading TV shows:', error);
		return {
			shows: [],
			genres: [],
			currentPage: 1,
			totalPages: 0,
			currentSection: section,
			currentGenre: null
		};
	}
};
