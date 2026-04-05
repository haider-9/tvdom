import type { PageServerLoad } from './$types';
import { TMDB_API_KEY } from '$env/static/private';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
  const { credit_id } = params;

  try {
    // Get credit details using credit_id
    const creditResponse = await fetch(
      `https://api.themoviedb.org/3/credit/${credit_id}?api_key=${TMDB_API_KEY}`
    );

    if (!creditResponse.ok) {
      if (creditResponse.status === 404) {
        throw error(404, 'Character not found');
      }
      throw error(500, 'Failed to fetch character details');
    }

    const creditData = await creditResponse.json();
    
    // Get person details
    let personDetails = null;
    if (creditData.person?.id) {
      const personResponse = await fetch(
        `https://api.themoviedb.org/3/person/${creditData.person.id}?api_key=${TMDB_API_KEY}`
      );
      
      if (personResponse.ok) {
        personDetails = await personResponse.json();
      }
    }

    // Get media details (movie or TV show)
    let mediaDetails = null;
    if (creditData.media) {
      const mediaType = creditData.media_type || (creditData.media.title ? 'movie' : 'tv');
      const mediaResponse = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${creditData.media.id}?api_key=${TMDB_API_KEY}`
      );
      
      if (mediaResponse.ok) {
        mediaDetails = await mediaResponse.json();
      }
    }

    // Get other roles by the same actor (if person exists)
    let otherRoles = [];
    if (personDetails?.id) {
      const creditsResponse = await fetch(
        `https://api.themoviedb.org/3/person/${personDetails.id}/combined_credits?api_key=${TMDB_API_KEY}`
      );
      
      if (creditsResponse.ok) {
        const credits = await creditsResponse.json();
        otherRoles = credits.cast
          ?.filter((role: any) => role.character && role.character !== creditData.character)
          ?.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
          ?.slice(0, 12) || [];
      }
    }

    return {
      credit: creditData,
      person: personDetails,
      media: mediaDetails,
      otherRoles,
      mediaType: creditData.media_type || (creditData.media?.title ? 'movie' : 'tv')
    };
  } catch (err) {
    console.error('Error loading character:', err);
    
    if (err instanceof Error && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to load character details');
  }
};