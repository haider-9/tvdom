export interface SEOConfig {
	title?: string;
	description?: string;
	image?: string;
	type?: 'website' | 'article' | 'video.movie' | 'video.tv_show';
	url?: string;
	keywords?: string[];
	author?: string;
	publishedTime?: string;
	modifiedTime?: string;
}

const SITE_NAME = 'TVDom';
const SITE_URL = 'https://tvdom.vercel.app'; // Update with your actual domain
const DEFAULT_DESCRIPTION = 'Discover and explore movies, TV shows, and the people who make them. Browse trending content, read reviews, and find your next favorite watch.';
const DEFAULT_IMAGE = '/placeholder.svg';

export function generateSEOTags(config: SEOConfig = {}) {
	const {
		title = `${SITE_NAME} - Your Ultimate TV & Movie Destination`,
		description = DEFAULT_DESCRIPTION,
		image = DEFAULT_IMAGE,
		type = 'website',
		url = SITE_URL,
		keywords = ['movies', 'TV shows', 'entertainment', 'streaming', 'reviews'],
		author = SITE_NAME,
		publishedTime,
		modifiedTime
	} = config;

	const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
	const fullImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
	const fullUrl = url.startsWith('http') ? url : `${SITE_URL}${url}`;

	return {
		title: fullTitle,
		description,
		keywords: keywords.join(', '),
		image: fullImage,
		url: fullUrl,
		type,
		author,
		publishedTime,
		modifiedTime
	};
}

export function generateStructuredData(config: {
	type: 'Movie' | 'TVSeries' | 'Episode' | 'Person' | 'WebSite' | 'BreadcrumbList';
	data: any;
}) {
	const { type, data } = config;
	const baseUrl = SITE_URL;

	switch (type) {
		case 'Movie': {
			return {
				'@context': 'https://schema.org',
				'@type': 'Movie',
				name: data.title,
				description: data.overview,
				image: data.poster_path
					? `https://image.tmdb.org/t/p/w500${data.poster_path}`
					: undefined,
				datePublished: data.release_date,
				duration: data.runtime ? `PT${data.runtime}M` : undefined,
				aggregateRating: data.vote_average
					? {
							'@type': 'AggregateRating',
							ratingValue: data.vote_average,
							bestRating: 10,
							worstRating: 0,
							ratingCount: data.vote_count || 0
						}
					: undefined,
				genre: data.genres?.map((g: any) => g.name),
				director: data.credits?.crew
					?.filter((c: any) => c.job === 'Director')
					.map((c: any) => ({
						'@type': 'Person',
						name: c.name
					})),
				actor: data.credits?.cast?.slice(0, 5).map((a: any) => ({
					'@type': 'Person',
					name: a.name,
					characterName: a.character
				}))
			};
		}

		case 'TVSeries': {
			return {
				'@context': 'https://schema.org',
				'@type': 'TVSeries',
				name: data.name,
				description: data.overview,
				image: data.poster_path
					? `https://image.tmdb.org/t/p/w500${data.poster_path}`
					: undefined,
				datePublished: data.first_air_date,
				numberOfSeasons: data.number_of_seasons,
				numberOfEpisodes: data.number_of_episodes,
				aggregateRating: data.vote_average
					? {
							'@type': 'AggregateRating',
							ratingValue: data.vote_average,
							bestRating: 10,
							worstRating: 0,
							ratingCount: data.vote_count || 0
						}
					: undefined,
				genre: data.genres?.map((g: any) => g.name),
				actor: data.credits?.cast?.slice(0, 5).map((a: any) => ({
					'@type': 'Person',
					name: a.name,
					characterName: a.character
				}))
			};
		}

		case 'Episode': {
			return {
				'@context': 'https://schema.org',
				'@type': 'TVEpisode',
				name: data.name,
				description: data.overview,
				image: data.still_path
					? `https://image.tmdb.org/t/p/w500${data.still_path}`
					: undefined,
				episodeNumber: data.episode_number,
				partOfSeason: {
					'@type': 'TVSeason',
					seasonNumber: data.season_number
				},
				datePublished: data.air_date,
				duration: data.runtime ? `PT${data.runtime}M` : undefined
			};
		}

		case 'Person': {
			return {
				'@context': 'https://schema.org',
				'@type': 'Person',
				name: data.name,
				description: data.biography,
				image: data.profile_path
					? `https://image.tmdb.org/t/p/w500${data.profile_path}`
					: undefined,
				birthDate: data.birthday,
				birthPlace: data.place_of_birth,
				jobTitle: data.known_for_department
			};
		}

		case 'WebSite': {
			return {
				'@context': 'https://schema.org',
				'@type': 'WebSite',
				name: SITE_NAME,
				description: DEFAULT_DESCRIPTION,
				url: baseUrl,
				potentialAction: {
					'@type': 'SearchAction',
					target: {
						'@type': 'EntryPoint',
						urlTemplate: `${baseUrl}/search?q={search_term_string}`
					},
					'query-input': 'required name=search_term_string'
				}
			};
		}

		case 'BreadcrumbList': {
			return {
				'@context': 'https://schema.org',
				'@type': 'BreadcrumbList',
				itemListElement: data.map((item: any, index: number) => ({
					'@type': 'ListItem',
					position: index + 1,
					name: item.name,
					item: `${baseUrl}${item.url}`
				}))
			};
		}

		default:
			return null;
	}
}

