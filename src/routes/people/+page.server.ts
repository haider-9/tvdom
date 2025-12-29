import { getPopularPeople } from '$lib/tmdb';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');

	try {
		const data = await getPopularPeople(page);

		return {
			people: data.results || [],
			currentPage: page,
			totalPages: data.total_pages || 0
		};
	} catch (error) {
		console.error('Error loading people:', error);
		return {
			people: [],
			currentPage: 1,
			totalPages: 0
		};
	}
};




