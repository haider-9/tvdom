import { getPersonCombinedCredits, getPersonDetails, getPersonImages } from '$lib/tmdb';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);

	if (Number.isNaN(id)) {
		throw error(404, 'Invalid person id');
	}

	try {
		const [details, credits, images] = await Promise.all([
			getPersonDetails(id),
			getPersonCombinedCredits(id),
			getPersonImages(id)
		]);

		return {
			details,
			credits,
			images
		};
	} catch (err) {
		console.error('Error loading person details:', err);
		throw error(404, 'Person not found');
	}
};




