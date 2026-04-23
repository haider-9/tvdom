import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

const ANILIST_URL = 'https://graphql.anilist.co';
const JIKAN_URL = 'https://api.jikan.moe/v4';

const CHARACTER_QUERY = `
  query ($id: Int) {
    Character(id: $id) {
      id
      name {
        full
        native
        alternative
      }
      image {
        large
      }
      description(asHtml: false)
      gender
      age
      dateOfBirth {
        year
        month
        day
      }
      favourites
      media(perPage: 12, sort: [POPULARITY_DESC]) {
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
          bannerImage
          averageScore
          startDate {
            year
          }
          genres
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
  const json = await res.json();
  if (!res.ok || json.errors) {
    const msg = json.errors?.[0]?.message ?? `AniList error: ${res.status}`;
    console.error('AniList GraphQL errors:', JSON.stringify(json.errors));
    throw new Error(msg);
  }
  return json.data;
}

// Search Jikan for a character by name, return MAL ID if found
async function findJikanCharacterId(name: string): Promise<number | null> {
  try {
    const res = await fetch(
      `${JIKAN_URL}/characters?q=${encodeURIComponent(name)}&limit=5`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const nameLower = name.toLowerCase();
    const match = (json.data as any[])?.find(
      (c: any) =>
        c.name?.toLowerCase() === nameLower ||
        c.name_kanji?.toLowerCase() === nameLower ||
        c.nicknames?.some((n: string) => n.toLowerCase() === nameLower)
    ) ?? json.data?.[0];
    return match?.mal_id ?? null;
  } catch {
    return null;
  }
}

// Fetch character pictures from Jikan by MAL ID
async function fetchJikanPictures(malId: number): Promise<string[]> {
  try {
    const res = await fetch(`${JIKAN_URL}/characters/${malId}/pictures`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data as any[])
      ?.map((p: any) => p.jpg?.large_image_url || p.jpg?.image_url)
      .filter(Boolean) ?? [];
  } catch {
    return [];
  }
}

// Fetch images from Reddit public JSON — CLIENT SIDE ONLY
// Reddit blocks server/datacenter IPs; this must run in the browser
async function fetchRedditImages(characterName: string): Promise<string[]> {
  // This function is intentionally left empty on the server.
  // Reddit image fetching is handled client-side via /api/character-images
  return [];
}

export const load: PageServerLoad = async ({ params }) => {
  const { credit_id } = params;
  const id = parseInt(credit_id);

  if (isNaN(id)) {
    throw error(404, 'Character not found. Character pages now use AniList IDs.');
  }

  try {
    const data = await queryAniList(CHARACTER_QUERY, { id });
    const c = data.Character;

    if (!c) throw error(404, 'Character not found');

    const characterName: string = c.name.full;

    // Fetch Jikan pictures — sequential to respect rate limits, with timeout
    let jikanPictures: string[] = [];
    try {
      const malId = await Promise.race([
        findJikanCharacterId(characterName),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
      ]);
      if (malId) {
        jikanPictures = await Promise.race([
          fetchJikanPictures(malId),
          new Promise<string[]>((resolve) => setTimeout(() => resolve([]), 4000)),
        ]);
      }
    } catch {
      // Jikan unavailable — continue without it
    }

    // Reddit images are fetched client-side (server IPs are blocked by Reddit)
    const redditImages: string[] = [];

    // Build gallery: AniList image first, then Jikan — deduplicated
    const anilistImage: string | null = c.image?.large ?? null;
    const allPictures: string[] = [];
    if (anilistImage) allPictures.push(anilistImage);
    for (const url of jikanPictures) {
      if (!allPictures.includes(url)) allPictures.push(url);
    }

    const character = {
      id: c.id,
      name: characterName,
      nameNative: c.name.native ?? null,
      nameAlternative: (c.name.alternative as string[])?.filter(Boolean) ?? [],
      image: anilistImage,
      gallery: allPictures,
      description: c.description ?? null,
      gender: c.gender ?? null,
      age: c.age ?? null,
      dateOfBirth: c.dateOfBirth ?? null,
      favourites: c.favourites ?? 0,
      media: (c.media?.nodes ?? []).map((m: any) => ({
        id: m.id,
        title: m.title.english || m.title.romaji,
        type: m.type as string,
        format: m.format as string,
        cover: m.coverImage?.large ?? null,
        banner: m.bannerImage ?? null,
        score: m.averageScore ?? null,
        year: m.startDate?.year ?? null,
        genres: (m.genres as string[]) ?? [],
      })),
    };

    return { character };
  } catch (err: any) {
    if (err?.status) throw err;
    console.error('AniList character fetch error:', err);
    throw error(500, 'Failed to load character');
  }
};
