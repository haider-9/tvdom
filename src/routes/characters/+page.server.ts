import type { PageServerLoad } from './$types';
import { TMDB_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ fetch, url }) => {
  const page = parseInt(url.searchParams.get('page') || '1');
  
  try {
    // Get diverse content including anime, cartoons, and all forms of shows
    const iconicMediaIds = {
      movies: [
        550, // Fight Club
        13, // Forrest Gump
        155, // The Dark Knight
        122, // The Lord of the Rings: The Return of the King
        680, // Pulp Fiction
        27205, // Inception
        278, // The Shawshank Redemption
        238, // The Godfather
        424, // Schindler's List
        389, // 12 Angry Men
        129, // Spirited Away (Anime)
        19404, // Dilwale Dulhania Le Jayenge
        372058, // Your Name (Anime)
        14836, // Coraline (Animation)
        12477, // Grave of the Fireflies (Anime)
        508442, // Soul (Animation)
        508943, // Luca (Animation)
        438631, // Dune
        299534, // Avengers: Endgame
        299536, // Avengers: Infinity War
        181808, // Star Wars: The Last Jedi
        140607, // Star Wars: The Force Awakens
        16869, // Inglourious Basterds
        49026, // The Dark Knight Rises
        157336 // Interstellar
      ],
      tv: [
        1399, // Game of Thrones
        60735, // The Flash
        1396, // Breaking Bad
        46648, // Squid Game
        85271, // WandaVision
        88396, // The Falcon and the Winter Soldier
        71712, // The Good Place
        1418, // The Big Bang Theory
        1408, // House
        456, // The Simpsons (Animation)
        60059, // Better Call Saul
        82856, // The Mandalorian
        94605, // Arcane (Animation)
        119051, // Wednesday
        100088, // The Last of Us
        1429, // Attack on Titan (Anime)
        85937, // Demon Slayer (Anime)
        95557, // Invincible (Animation)
        63174, // Lucifer
        2316, // The Office
        1668, // Friends
        4614, // NCIS
        1622, // Supernatural
        1390, // American Horror Story
        18165, // The Vampire Diaries
        31917, // Pretty Little Liars
        37680, // Suits
        1412, // Arrow
        69050, // Riverdale
        76479, // The Boys
        83867, // Star Wars: The Mandalorian
        110492, // Heartstopper
        84958, // Loki
        91363, // What If...? (Animation)
        92685, // The Owl House (Animation)
        79460, // She-Ra and the Princesses of Power (Animation)
        60625, // Rick and Morty (Animation)
        1434, // Family Guy (Animation)
        615, // Futurama (Animation)
        2190, // South Park (Animation)
        60572, // BoJack Horseman (Animation)
        63926, // Steven Universe (Animation)
        67915, // Gravity Falls (Animation)
        62017, // Avatar: The Last Airbender (Animation)
        92783, // Avatar: The Legend of Korra (Animation)
        1402, // The Walking Dead
        69740, // Euphoria
        66732, // Stranger Things
        1399, // Game of Thrones
        103768 // The Witcher
      ]
    };

    // Get credits for these specific shows/movies
    const allMediaIds = [
      ...iconicMediaIds.movies.map(id => ({ id, type: 'movie' })),
      ...iconicMediaIds.tv.map(id => ({ id, type: 'tv' }))
    ];

    // Shuffle and paginate
    const startIndex = (page - 1) * 8;
    const endIndex = startIndex + 8;
    const paginatedMedia = allMediaIds.slice(startIndex, endIndex);

    const characterPromises = paginatedMedia.map(async ({ id, type }) => {
      try {
        const [detailsResponse, creditsResponse] = await Promise.all([
          fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=${TMDB_API_KEY}`),
          fetch(`https://api.themoviedb.org/3/${type}/${id}/credits?api_key=${TMDB_API_KEY}`)
        ]);
        
        if (detailsResponse.ok && creditsResponse.ok) {
          const details = await detailsResponse.json();
          const credits = await creditsResponse.json();
          
          // Get top 6 characters with the most interesting character names
          const topCharacters = credits.cast
            ?.filter((actor: any) => 
              actor.character && 
              actor.character.length > 2 && 
              !actor.character.includes('uncredited') &&
              !actor.character.includes('Self') &&
              !actor.character.includes('Narrator') &&
              !actor.character.includes('Voice') &&
              actor.profile_path
            )
            ?.slice(0, 6)
            ?.map((actor: any) => ({
              ...actor,
              media: details,
              mediaType: type,
              mediaTitle: details.title || details.name,
              mediaYear: new Date(details.release_date || details.first_air_date || '').getFullYear(),
              mediaRating: details.vote_average,
              // Add genre information to help identify anime/animation
              genres: details.genres || [],
              isAnimation: details.genres?.some((g: any) => 
                g.name === 'Animation' || 
                g.name === 'Family'
              ) || details.origin_country?.includes('JP') || details.original_language === 'ja',
              // Enhanced media type for better badges
              displayMediaType: (() => {
                if (details.genres?.some((g: any) => g.name === 'Animation')) {
                  if (details.origin_country?.includes('JP') || details.original_language === 'ja') {
                    return 'Anime';
                  }
                  return type === 'movie' ? 'Animated Film' : 'Animation';
                }
                return type === 'movie' ? 'Movie' : 'TV Show';
              })()
            })) || [];
            
          return topCharacters;
        }
      } catch (error) {
        console.error(`Error fetching ${type} ${id}:`, error);
      }
      return [];
    });

    const characterArrays = await Promise.all(characterPromises);
    const allCharacters = characterArrays.flat();
    
    // Sort by media popularity and character prominence, with some randomization for variety
    const sortedCharacters = allCharacters
      .sort((a, b) => {
        // Prioritize by media rating and character order, with some variety
        const aScore = (a.mediaRating || 0) * 10 + (10 - a.order) + Math.random() * 2;
        const bScore = (b.mediaRating || 0) * 10 + (10 - b.order) + Math.random() * 2;
        return bScore - aScore;
      });

    return {
      characters: sortedCharacters,
      currentPage: page,
      totalPages: Math.ceil(allMediaIds.length / 8)
    };
  } catch (error) {
    console.error('Error loading characters:', error);
    return {
      characters: [],
      currentPage: 1,
      totalPages: 1
    };
  }
};