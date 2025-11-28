import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	getDetails,
	getEpisodeCredits,
	getEpisodeDetails,
	getEpisodeImages,
	getSeasonDetails
} from '$lib/tmdb';

export const load: PageServerLoad = async ({ params }) => {
	const tvId = Number(params.id);
	const seasonNumber = Number(params.season);
	const episodeNumber = Number(params.episode);

	if (Number.isNaN(tvId) || Number.isNaN(seasonNumber) || Number.isNaN(episodeNumber)) {
		throw error(404, 'Episode not found');
	}

	try {
		const [show, season, episode, credits, images] = await Promise.all([
			getDetails('tv', tvId),
			getSeasonDetails(tvId, seasonNumber),
			getEpisodeDetails(tvId, seasonNumber, episodeNumber),
			getEpisodeCredits(tvId, seasonNumber, episodeNumber),
			getEpisodeImages(tvId, seasonNumber, episodeNumber)
		]);

		return { show, season, episode, credits, images };
	} catch (err) {
		console.error('Error loading episode details:', err);
		throw error(404, 'Episode not found');
	}
};


