import { getPopular, getGenres, getTrending, getTopRated, getUpcoming, getNowPlaying } from '$lib/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const section = url.searchParams.get('section') || 'popular';

	// Prevent caching
	setHeaders({
		'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
	});
	try {
		let mainData;
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

		const genresData = await getGenres('movie');

		return {
			movies: mainData.results || [],
			genres: genresData.genres || [],
			currentPage: page,
			totalPages: mainData.total_pages || 0,
			currentSection: section
		};
	} catch (error) {
		console.error('Error loading movies:', error);
		return {
			movies: [],
			genres: [],
			currentPage: 1,
			totalPages: 0,
			currentSection: section
		};
	}
};