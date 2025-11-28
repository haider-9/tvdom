import { getPopular, getGenres, getTrending, getTopRated, getAiringToday } from '$lib/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url, setHeaders }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const section = url.searchParams.get('section') || 'popular';
	setHeaders({
		'cache-control': 'no-store, no-cache, must-revalidate, max-age=0'
	});
	try {
		const [popularData, trendingData, topRatedData, airingTodayData, genresData] = await Promise.all([
			getPopular('tv', 1),
			getTrending('tv', 'week'),
			getTopRated('tv', 1),
			getAiringToday(1),
			getGenres('tv')
		]);

		// Get the main section data based on selection
		let mainData;
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

		return {
			shows: mainData.results || [],
			popular: popularData.results?.slice(0, 10) || [],
			trending: trendingData.results?.slice(0, 10) || [],
			topRated: topRatedData.results?.slice(0, 10) || [],
			airingToday: airingTodayData.results?.slice(0, 10) || [],
			genres: genresData.genres || [],
			currentPage: page,
			totalPages: mainData.total_pages || 0,
			currentSection: section
		};
	} catch (error) {
		console.error('Error loading TV shows:', error);
		return {
			shows: [],
			popular: [],
			trending: [],
			topRated: [],
			airingToday: [],
			genres: [],
			currentPage: 1,
			totalPages: 0,
			currentSection: section
		};
	}
};
