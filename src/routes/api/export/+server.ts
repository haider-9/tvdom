import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { databases, DATABASE_ID, COLLECTIONS } from '$lib/appwrite.js';
import { Query } from 'appwrite';

export const GET: RequestHandler = async ({ url }) => {
  try {
    const userId = url.searchParams.get('userId');
    const format = url.searchParams.get('format') || 'json';
    const dataType = url.searchParams.get('type') || 'all';
    
    if (!userId) {
      return json({ error: 'User ID is required' }, { status: 400 });
    }

    const exportData: any = {
      exportedAt: new Date().toISOString(),
      userId,
      format,
      dataType
    };

    // Export watchlist
    if (dataType === 'all' || dataType === 'watchlist') {
      try {
        const watchlist = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.WATCHLIST,
          [Query.equal('userId', userId), Query.limit(1000)]
        );
        exportData.watchlist = watchlist.documents;
      } catch (error) {
        console.error('Error exporting watchlist:', error);
        exportData.watchlist = [];
      }
    }

    // Export ratings
    if (dataType === 'all' || dataType === 'ratings') {
      try {
        const ratings = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.RATINGS,
          [Query.equal('userId', userId), Query.limit(1000)]
        );
        exportData.ratings = ratings.documents;
      } catch (error) {
        console.error('Error exporting ratings:', error);
        exportData.ratings = [];
      }
    }

    // Export person ratings
    if (dataType === 'all' || dataType === 'person-ratings') {
      try {
        const personRatings = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PERSON_RATINGS,
          [Query.equal('userId', userId), Query.limit(1000)]
        );
        exportData.personRatings = personRatings.documents;
      } catch (error) {
        console.error('Error exporting person ratings:', error);
        exportData.personRatings = [];
      }
    }

    // Export person favorites
    if (dataType === 'all' || dataType === 'person-favorites') {
      try {
        const personFavorites = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.PERSON_FAVORITES,
          [Query.equal('userId', userId), Query.limit(1000)]
        );
        exportData.personFavorites = personFavorites.documents;
      } catch (error) {
        console.error('Error exporting person favorites:', error);
        exportData.personFavorites = [];
      }
    }

    // Export posts
    if (dataType === 'all' || dataType === 'posts') {
      try {
        const posts = await databases.listDocuments(
          DATABASE_ID,
          'posts',
          [Query.equal('userId', userId), Query.limit(1000)]
        );
        exportData.posts = posts.documents;
      } catch (error) {
        console.error('Error exporting posts:', error);
        exportData.posts = [];
      }
    }

    // Export follows
    if (dataType === 'all' || dataType === 'follows') {
      try {
        const follows = await databases.listDocuments(
          DATABASE_ID,
          COLLECTIONS.FOLLOWS,
          [Query.equal('followerId', userId), Query.limit(1000)]
        );
        exportData.follows = follows.documents;
      } catch (error) {
        console.error('Error exporting follows:', error);
        exportData.follows = [];
      }
    }

    // Return different formats
    if (format === 'csv') {
      return new Response(convertToCSV(exportData), {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="tvdom-export-${userId}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Default JSON format
    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tvdom-export-${userId}-${new Date().toISOString().split('T')[0]}.json"`
      }
    });

  } catch (error) {
    console.error('Error exporting user data:', error);
    return json({ error: 'Failed to export user data' }, { status: 500 });
  }
};

function convertToCSV(data: any): string {
  let csv = '';
  
  // Export watchlist as CSV
  if (data.watchlist && data.watchlist.length > 0) {
    csv += 'WATCHLIST\n';
    csv += 'Title,Type,Year,Priority,Added Date,Notes\n';
    
    data.watchlist.forEach((item: any) => {
      csv += `"${item.mediaTitle}","${item.mediaType}","${item.mediaYear || ''}","${item.priority}","${item.addedAt}","${item.notes || ''}"\n`;
    });
    csv += '\n';
  }

  // Export ratings as CSV
  if (data.ratings && data.ratings.length > 0) {
    csv += 'RATINGS\n';
    csv += 'Title,Type,Rating,Review,Created Date,Spoiler,Tags\n';
    
    data.ratings.forEach((rating: any) => {
      const tags = Array.isArray(rating.tags) ? rating.tags.join('; ') : '';
      csv += `"${rating.mediaTitle}","${rating.mediaType}","${rating.rating}","${rating.review || ''}","${rating.createdAt}","${rating.isSpoiler || false}","${tags}"\n`;
    });
    csv += '\n';
  }

  // Export person ratings as CSV
  if (data.personRatings && data.personRatings.length > 0) {
    csv += 'PERSON RATINGS\n';
    csv += 'Person Name,Rating,Review,Created Date,Spoiler,Tags\n';
    
    data.personRatings.forEach((rating: any) => {
      const tags = Array.isArray(rating.tags) ? rating.tags.join('; ') : '';
      csv += `"${rating.personName}","${rating.rating}","${rating.review || ''}","${rating.createdAt}","${rating.isSpoiler || false}","${tags}"\n`;
    });
    csv += '\n';
  }

  return csv;
}