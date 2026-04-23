import type { PageServerLoad } from './$types';

const ANILIST_URL = 'https://graphql.anilist.co';
const PER_PAGE = 24;

const CHARACTERS_QUERY = `
  query ($page: Int, $perPage: Int, $search: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        total
        currentPage
        lastPage
        hasNextPage
      }
      characters(sort: [FAVOURITES_DESC], search: $search) {
        id
        name {
          full
          native
        }
        image {
          large
          medium
        }
        description(asHtml: false)
        favourites
        gender
        age
        media(perPage: 1, sort: [POPULARITY_DESC]) {
          nodes {
            id
            title {
              romaji
              english
            }
            type
            format
            coverImage {
              large
            }
            averageScore
            startDate {
              year
            }
          }
        }
      }
    }
  }
`;

async function queryAniList(query: string, variables: Record<string, any>) {
  const res = await fetch(ANILIST_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`AniList error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0]?.message ?? 'AniList GraphQL error');
  return json.data;
}

export const load: PageServerLoad = async ({ url }) => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
  const search = url.searchParams.get('q')?.trim() || undefined;

  try {
    const data = await queryAniList(CHARACTERS_QUERY, {
      page,
      perPage: PER_PAGE,
      search: search || null,
    });

    const pageInfo = data.Page.pageInfo;
    const characters = (data.Page.characters as any[]).map((c) => {
      const media = c.media?.nodes?.[0];
      return {
        id: c.id,
        name: c.name.full,
        nameNative: c.name.native,
        image: c.image?.large || c.image?.medium || null,
        description: c.description,
        favourites: c.favourites,
        gender: c.gender,
        age: c.age,
        media: media
          ? {
              id: media.id,
              title: media.title.english || media.title.romaji,
              type: media.type,
              format: media.format,
              cover: media.coverImage?.large,
              score: media.averageScore,
              year: media.startDate?.year,
            }
          : null,
      };
    });

    return {
      characters,
      currentPage: pageInfo.currentPage,
      totalPages: pageInfo.lastPage,
      hasNextPage: pageInfo.hasNextPage,
      search: search ?? '',
    };
  } catch (error) {
    console.error('AniList fetch error:', error);
    return { characters: [], currentPage: 1, totalPages: 1, hasNextPage: false, search: search ?? '' };
  }
};
