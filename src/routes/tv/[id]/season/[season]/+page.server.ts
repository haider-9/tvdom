import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getDetails, getSeasonCredits, getSeasonDetails } from '$lib/tmdb';

export const load: PageServerLoad = async ({ params }) => {
	const tvId = Number(params.id);
	const seasonNumber = Number(params.season);

	if (Number.isNaN(tvId) || Number.isNaN(seasonNumber)) {
		throw error(404, 'Season not found');
	}

	try {
		const [show, season, credits] = await Promise.all([
			getDetails('tv', tvId),
			getSeasonDetails(tvId, seasonNumber),
			getSeasonCredits(tvId, seasonNumber)
		]);

		return { show, season, credits };
	} catch (err) {
		console.error('Error loading season details:', err);
		throw error(404, 'Season not found');
	}
};


