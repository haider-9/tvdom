import {
	getDetails,
	getCredits,
	getVideos,
	getSimilar,
	getImages,
	getWatchProviders,
	getReleaseDates,
	getContentRatings,
	getReviews,
	getKeywords,
	getRecommendations
} from '$lib/tmdb';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const { type, id } = params;

	if (type !== 'movie' && type !== 'tv') {
		throw error(404, 'Invalid media type');
	}

	try {
		const mediaId = parseInt(id);
		const [
			details,
			credits,
			videos,
			similar,
			images,
			watchProviders,
			reviews,
			keywords,
			recommendations,
			releaseOrContentRatings
		] = await Promise.all([
			getDetails(type, mediaId),
			getCredits(type, mediaId),
			getVideos(type, mediaId),
			getSimilar(type, mediaId),
			getImages(type, mediaId),
			getWatchProviders(type, mediaId),
			getReviews(type, mediaId),
			getKeywords(type, mediaId),
			getRecommendations(type, mediaId),
			type === 'movie' ? getReleaseDates(mediaId) : getContentRatings(mediaId)
		]);

		const releaseInfo = type === 'movie' ? releaseOrContentRatings : null;
		const contentRatings = type === 'tv' ? releaseOrContentRatings : null;

		return {
			details,
			credits,
			videos,
			similar,
			images,
			watchProviders,
			reviews,
			keywords,
			recommendations,
			releaseInfo,
			contentRatings,
			type
		};
	} catch (err) {
		console.error('Error loading details:', err);
		throw error(404, 'Media not found');
	}
};
