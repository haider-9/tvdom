import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { TMDB_API_KEY } from '$env/static/private';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { type, id } = params;

	if (type !== 'movie' && type !== 'tv') {
		throw error(404, 'Invalid media type');
	}

	try {
		const detailsResponse = await fetch(
			`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}`
		);

		if (!detailsResponse.ok) {
			throw error(detailsResponse.status, 'Failed to fetch media details');
		}

		const details = await detailsResponse.json();

		// For TV shows, fetch season details to get episode counts
		let seasons = null;
		if (type === 'tv' && details.seasons) {
			seasons = await Promise.all(
				details.seasons
					.filter((s: any) => s.season_number > 0) // Exclude specials (season 0)
					.map(async (season: any) => {
						try {
							const seasonResponse = await fetch(
								`${TMDB_BASE_URL}/tv/${id}/season/${season.season_number}?api_key=${TMDB_API_KEY}`
							);
							if (seasonResponse.ok) {
								const seasonData = await seasonResponse.json();
								return {
									season_number: season.season_number,
									episode_count: seasonData.episodes?.length || 0,
									name: season.name,
									episodes: seasonData.episodes?.map((ep: any) => ({
										episode_number: ep.episode_number,
										name: ep.name,
										overview: ep.overview,
										air_date: ep.air_date
									})) || []
								};
							}
						} catch (err) {
							console.error(`Error fetching season ${season.season_number}:`, err);
						}
						return {
							season_number: season.season_number,
							episode_count: season.episode_count || 0,
							name: season.name,
							episodes: []
						};
					})
			);
		}

		return {
			details,
			type,
			seasons
		};
	} catch (err) {
		console.error('Error loading watch page:', err);
		throw error(500, 'Failed to load streaming page');
	}
};
