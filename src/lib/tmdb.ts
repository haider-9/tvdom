import { TMDB_ACCESS_TOKEN } from '$env/static/private';

const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
	accept: 'application/json',
	Authorization: `Bearer ${TMDB_ACCESS_TOKEN}`
};

export async function fetchFromTMDB(endpoint: string) {
	const response = await fetch(`${BASE_URL}${endpoint}`, {
		method: 'GET',
		headers
	});

	if (!response.ok) {
		throw new Error(`TMDB API error: ${response.statusText}`);
	}

	return response.json();
}

export async function getTrending(mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'day') {
	return fetchFromTMDB(`/trending/${mediaType}/${timeWindow}`);
}

export async function getPopular(mediaType: 'movie' | 'tv' = 'movie', page: number = 1) {
	return fetchFromTMDB(`/${mediaType}/popular?page=${page}`);
}

export async function getDetails(mediaType: 'movie' | 'tv', id: number) {
	return fetchFromTMDB(`/${mediaType}/${id}`);
}

export async function getCredits(mediaType: 'movie' | 'tv', id: number) {
	return fetchFromTMDB(`/${mediaType}/${id}/credits`);
}

export async function getVideos(mediaType: 'movie' | 'tv', id: number) {
	return fetchFromTMDB(`/${mediaType}/${id}/videos`);
}

export async function getSimilar(mediaType: 'movie' | 'tv', id: number, page: number = 1) {
	return fetchFromTMDB(`/${mediaType}/${id}/similar?page=${page}`);
}

export async function getRecommendations(mediaType: 'movie' | 'tv', id: number, page: number = 1) {
	return fetchFromTMDB(`/${mediaType}/${id}/recommendations?page=${page}`);
}

export async function getWatchProviders(mediaType: 'movie' | 'tv', id: number) {
	return fetchFromTMDB(`/${mediaType}/${id}/watch/providers`);
}

export async function getSeasonDetails(tvId: number, seasonNumber: number) {
	return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getSeasonCredits(tvId: number, seasonNumber: number) {
	return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}/credits`);
}

export async function getEpisodeDetails(tvId: number, seasonNumber: number, episodeNumber: number) {
	return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`);
}

export async function getEpisodeCredits(tvId: number, seasonNumber: number, episodeNumber: number) {
	return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/credits`);
}

export async function getEpisodeImages(tvId: number, seasonNumber: number, episodeNumber: number) {
	return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}/images`);
}

export async function getReleaseDates(id: number) {
	return fetchFromTMDB(`/movie/${id}/release_dates`);
}

export async function getContentRatings(id: number) {
	return fetchFromTMDB(`/tv/${id}/content_ratings`);
}

export async function getReviews(mediaType: 'movie' | 'tv', id: number, page: number = 1) {
	return fetchFromTMDB(`/${mediaType}/${id}/reviews?page=${page}`);
}

export async function getKeywords(mediaType: 'movie' | 'tv', id: number) {
	return fetchFromTMDB(`/${mediaType}/${id}/keywords`);
}

export async function searchMulti(query: string, page: number = 1) {
	return fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`);
}

export async function getGenres(mediaType: 'movie' | 'tv' = 'movie') {
	return fetchFromTMDB(`/genre/${mediaType}/list`);
}

export async function discoverByGenre(mediaType: 'movie' | 'tv', genreId: number, page: number = 1) {
	return fetchFromTMDB(`/discover/${mediaType}?with_genres=${genreId}&page=${page}`);
}

export async function getTopRated(mediaType: 'movie' | 'tv' = 'movie', page: number = 1) {
	return fetchFromTMDB(`/${mediaType}/top_rated?page=${page}`);
}

export async function getUpcoming(page: number = 1) {
	return fetchFromTMDB(`/movie/upcoming?page=${page}`);
}

export async function getAiringToday(page: number = 1) {
	return fetchFromTMDB(`/tv/airing_today?page=${page}`);
}

// People / Characters
export async function getPopularPeople(page: number = 1) {
	return fetchFromTMDB(`/person/popular?page=${page}`);
}

export async function getPersonDetails(id: number) {
	return fetchFromTMDB(`/person/${id}`);
}

export async function getPersonCombinedCredits(id: number) {
	return fetchFromTMDB(`/person/${id}/combined_credits`);
}

export async function getPersonImages(id: number) {
	return fetchFromTMDB(`/person/${id}/images`);
}

export async function getImages(mediaType: 'movie' | 'tv', id: number) {
	return fetchFromTMDB(`/${mediaType}/${id}/images`);
}

export async function getNowPlaying(page: number = 1) {
	return fetchFromTMDB(`/movie/now_playing?page=${page}`);
}
