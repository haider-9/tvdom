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

    // Get person's combined credits with character information
    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${TMDB_API_KEY}`
    );

    let knownFor = [];
    let movieCredits = [];
    let tvCredits = [];
    
    if (creditsResponse.ok) {
      const credits = await creditsResponse.json();
      
      // Process cast credits (acting roles with character names)
      const castCredits = credits.cast || [];
      
      // Sort by popularity and get top items for "known for" section
      knownFor = castCredits
        .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
        .slice(0, 20);
      
      // Separate movie and TV credits with character information
      movieCredits = castCredits
        .filter((c: any) => c.media_type === "movie")
        .sort((a: any, b: any) => {
          const dateA = new Date(a.release_date || '1900-01-01').getTime();
          const dateB = new Date(b.release_date || '1900-01-01').getTime();
          return dateB - dateA; // Most recent first
        });
        
      tvCredits = castCredits
        .filter((c: any) => c.media_type === "tv")
        .sort((a: any, b: any) => {
          const dateA = new Date(a.first_air_date || '1900-01-01').getTime();
          const dateB = new Date(b.first_air_date || '1900-01-01').getTime();
          return dateB - dateA; // Most recent first
        });
    }

    return {
      person,
      knownFor,
      movieCredits,
      tvCredits
    };
  } catch (err) {
    console.error('Error loading person:', err);
    
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to load person details');
  }
};