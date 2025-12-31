import type { PageServerLoad } from './$types';
import { TMDB_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { id } = params;

  try {
    // Get person details
    const personResponse = await fetch(
      `https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_API_KEY}`
    );

    if (!personResponse.ok) {
      if (personResponse.status === 404) {
        throw error(404, 'Person not found');
      }
      throw error(500, 'Failed to fetch person details');
    }

    const person = await personResponse.json();

    // Get person's known for (combined credits)
    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${TMDB_API_KEY}`
    );

    let knownFor = [];
    if (creditsResponse.ok) {
      const credits = await creditsResponse.json();
      // Sort by popularity and get top items
      knownFor = credits.cast
        ?.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
        ?.slice(0, 20) || [];
    }

    return {
      person,
      knownFor
    };
  } catch (err) {
    console.error('Error loading person:', err);
    
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to load person details');
  }
};