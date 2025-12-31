import type { PageServerLoad } from './$types';
import { TMDB_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ url, fetch }) => {
  const query = url.searchParams.get('q');
  const page = parseInt(url.searchParams.get('page') || '1');

  try {
    let apiUrl: string;
    
    if (query) {
      // Search for people
      apiUrl = `https://api.themoviedb.org/3/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
    } else {
      // Get popular people
      apiUrl = `https://api.themoviedb.org/3/person/popular?api_key=${TMDB_API_KEY}&page=${page}`;
    }

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      people: data.results || [],
      currentPage: page,
      totalPages: data.total_pages || 1,
      totalResults: data.total_results || 0,
      query: query || null
    };
  } catch (error) {
    console.error('Error fetching people:', error);
    
    return {
      people: [],
      currentPage: 1,
      totalPages: 1,
      totalResults: 0,
      query: query || null
    };
  }
};