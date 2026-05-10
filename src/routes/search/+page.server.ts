import { searchMulti, getGenres } from '$lib/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const genre = parseInt(url.searchParams.get('genre') || '0') || null;

	try {
		// Always load genres for the filter strip
		const [movieGenresData, tvGenresData] = await Promise.all([
			getGenres('movie'),
			getGenres('tv')
		]);

		// Merge and deduplicate genres by id
		const allGenres = [...(movieGenresData.genres || []), ...(tvGenresData.genres || [])];
		const seen = new Set<number>();
		const genres = allGenres.filter(g => {
			if (seen.has(g.id)) return false;
			seen.add(g.id);
			return true;
		}).sort((a, b) => a.name.localeCompare(b.name));

		if (!query) {
			return { results: [], query: '', totalPages: 0, currentPage: 1, genres, currentGenre: genre };
		}

		const data = await searchMulti(query, page);
		return {
			results: data.results || [],
			query,
			totalPages: data.total_pages || 0,
			currentPage: page,
			genres,
			currentGenre: genre
		};
	} catch (error) {
		console.error('Search error:', error);
		return { results: [], query, totalPages: 0, currentPage: 1, genres: [], currentGenre: null };
	}
};
