import { getPopular, getGenres, getTrending, getTopRated, getUpcoming, getNowPlaying, discoverByGenre } from '$lib/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const section = url.searchParams.get('section') || 'popular';
	const genre = parseInt(url.searchParams.get('genre') || '0') || null;

	try {
		const genresData = await getGenres('movie');

		let mainData;
		if (genre) {
			mainData = await discoverByGenre('movie', genre, page);
		} else {
			switch (section) {
				case 'trending':
					mainData = await getTrending('movie', 'week');
					break;
				case 'top_rated':
					mainData = await getTopRated('movie', page);
					break;
				case 'upcoming':
					mainData = await getUpcoming(page);
					break;
				case 'now_playing':
					mainData = await getNowPlaying(page);
					break;
				default:
					mainData = await getPopular('movie', page);
			}
		}

		return {
			movies: mainData.results || [],
			genres: genresData.genres || [],
			currentPage: page,
			totalPages: mainData.total_pages || 0,
			currentSection: section,
			currentGenre: genre
		};
	} catch (error) {
		console.error('Error loading movies:', error);
		return {
			movies: [],
			genres: [],
			currentPage: 1,
			totalPages: 0,
			currentSection: section,
			currentGenre: null
		};
	}
};
