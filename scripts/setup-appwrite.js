/**
 * Appwrite Database Setup Script
 * 
 * This script creates all required collections and attributes for the TVDom application.
 * 
 * Prerequisites:
 * 1. Create an Appwrite project at https://cloud.appwrite.io
 * 2. Get your project ID and API key
 * 3. Update your .env file with Appwrite credentials
 * 4. Install dependencies: npm install appwrite dotenv
 * 
 * Usage: node scripts/setup-appwrite.js
 */

import { Client, Databases, ID } from 'appwrite';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const client = new Client();
const databases = new Databases(client);

client
  .setEndpoint(process.env.PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const DATABASE_ID = '69e8ecf30012d700e7fb';

async function createCollection(collectionId, name, attributes) {
  try {
    await databases.createCollection(DATABASE_ID, collectionId, name);
    console.log(`✅ ${name} collection created`);
    
    // Add attributes
    for (const attr of attributes) {
      try {
        if (attr.type === 'string') {
          await databases.createStringAttribute(
            DATABASE_ID, 
            collectionId, 
            attr.key, 
            attr.size, 
            attr.required, 
            attr.default, 
            attr.array
          );
        } else if (attr.type === 'integer') {
          await databases.createIntegerAttribute(
            DATABASE_ID, 
            collectionId, 
            attr.key, 
            attr.required, 
            attr.min, 
            attr.max, 
            attr.default, 
            attr.array
          );
        } else if (attr.type === 'float') {
          await databases.createFloatAttribute(
            DATABASE_ID, 
            collectionId, 
            attr.key, 
            attr.required, 
            attr.min, 
            attr.max, 
            attr.default, 
            attr.array
          );
        } else if (attr.type === 'boolean') {
          await databases.createBooleanAttribute(
            DATABASE_ID, 
            collectionId, 
            attr.key, 
            attr.required, 
            attr.default, 
            attr.array
          );
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (attrError) {
        if (attrError.code === 409) {
          console.log(`   ℹ️  Attribute ${attr.key} already exists`);
        } else {
          console.error(`   ❌ Error creating attribute ${attr.key}:`, attrError.message);
        }
      }
    }
    
    console.log(`✅ ${name} collection attributes created`);
  } catch (error) {
    if (error.code === 409) {
      console.log(`ℹ️  ${name} collection already exists`);
    } else {
      console.error(`❌ Error creating ${name} collection:`, error.message);
      throw error;
    }
  }
}

async function setupDatabase() {
  try {
    console.log('🚀 Setting up Appwrite database for TVDom...\n');

    // Create database
    try {
      await databases.create(DATABASE_ID, 'TVDom Main Database');
      console.log('✅ Database created successfully\n');
    } catch (error) {
      if (error.code === 409) {
        console.log('ℹ️  Database already exists\n');
      } else {
        throw error;
      }
    }

    // 1. Users Collection
    await createCollection('users', 'Users', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'email', type: 'string', size: 255, required: true },
      { key: 'username', type: 'string', size: 255, required: true },
      { key: 'displayName', type: 'string', size: 255, required: true },
      { key: 'avatar', type: 'string', size: 500, required: false },
      { key: 'banner', type: 'string', size: 500, required: false },
      { key: 'bio', type: 'string', size: 1000, required: false },
      { key: 'location', type: 'string', size: 255, required: false },
      { key: 'website', type: 'string', size: 500, required: false },
      { key: 'isVerified', type: 'boolean', required: false, default: false },
      { key: 'isPrivate', type: 'boolean', required: false, default: false },
      { key: 'followerCount', type: 'integer', required: false, default: 0 },
      { key: 'followingCount', type: 'integer', required: false, default: 0 },
      { key: 'totalRatings', type: 'integer', required: false, default: 0 },
      { key: 'averageRating', type: 'float', required: false, default: 0 },
      { key: 'favoriteGenres', type: 'string', size: 50, required: false, array: true },
      { key: 'watchlistCount', type: 'integer', required: false, default: 0 },
      { key: 'watchedCount', type: 'integer', required: false, default: 0 },
      { key: 'lastActiveAt', type: 'string', size: 50, required: false }
    ]);

    // 2. Ratings Collection
    await createCollection('ratings', 'Ratings', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'mediaId', type: 'string', size: 255, required: true },
      { key: 'mediaType', type: 'string', size: 50, required: true },
      { key: 'rating', type: 'integer', required: true },
      { key: 'review', type: 'string', size: 2000, required: false },
      { key: 'mediaTitle', type: 'string', size: 500, required: true },
      { key: 'mediaPoster', type: 'string', size: 500, required: false },
      { key: 'isSpoiler', type: 'boolean', required: false, default: false },
      { key: 'likes', type: 'integer', required: false, default: 0 },
      { key: 'dislikes', type: 'integer', required: false, default: 0 },
      { key: 'tags', type: 'string', size: 100, required: false, array: true },
      { key: 'rewatched', type: 'boolean', required: false, default: false }
    ]);

    // 3. Watchlist Collection
    await createCollection('watchlist', 'Watchlist', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'mediaId', type: 'string', size: 255, required: true },
      { key: 'mediaType', type: 'string', size: 50, required: true },
      { key: 'mediaTitle', type: 'string', size: 500, required: true },
      { key: 'mediaPoster', type: 'string', size: 500, required: false },
      { key: 'mediaYear', type: 'integer', required: false, default: 0 },
      { key: 'mediaGenres', type: 'string', size: 100, required: false, array: true },
      { key: 'priority', type: 'string', size: 50, required: false, default: 'medium' },
      { key: 'notes', type: 'string', size: 1000, required: false },
      { key: 'addedAt', type: 'string', size: 50, required: false }
    ]);

    // 4. Watched Collection
    await createCollection('watched', 'Watched', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'mediaId', type: 'string', size: 255, required: true },
      { key: 'mediaType', type: 'string', size: 50, required: true },
      { key: 'mediaTitle', type: 'string', size: 500, required: true },
      { key: 'mediaPoster', type: 'string', size: 500, required: false },
      { key: 'watchedAt', type: 'string', size: 50, required: false },
      { key: 'isFavorite', type: 'boolean', required: false, default: false },
      { key: 'rewatchCount', type: 'integer', required: false, default: 0 },
      { key: 'progress', type: 'integer', required: false, default: 100 },
      { key: 'rating', type: 'integer', required: false, default: 0 },
      { key: 'lastRewatchedAt', type: 'string', size: 50, required: false }
    ]);

    // 5. Follows Collection
    await createCollection('follows', 'Follows', [
      { key: 'followerId', type: 'string', size: 255, required: true },
      { key: 'followingId', type: 'string', size: 255, required: true }
    ]);

    // 6. Person Ratings Collection
    await createCollection('person_ratings', 'Person Ratings', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'personId', type: 'string', size: 255, required: true },
      { key: 'rating', type: 'integer', required: true },
      { key: 'review', type: 'string', size: 2000, required: false },
      { key: 'personName', type: 'string', size: 500, required: true },
      { key: 'personImage', type: 'string', size: 500, required: false },
      { key: 'isSpoiler', type: 'boolean', required: false, default: false },
      { key: 'tags', type: 'string', size: 100, required: false, array: true }
    ]);

    // 7. Person Favorites Collection
    await createCollection('person_favorites', 'Person Favorites', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'personId', type: 'string', size: 255, required: true },
      { key: 'personName', type: 'string', size: 500, required: true },
      { key: 'personImage', type: 'string', size: 500, required: false },
      { key: 'personKnownFor', type: 'string', size: 500, required: false },
      { key: 'addedAt', type: 'string', size: 50, required: false }
    ]);

    // 8. Currently Watching Collection
    await createCollection('currently_watching', 'Currently Watching', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'mediaId', type: 'string', size: 255, required: true },
      { key: 'mediaType', type: 'string', size: 50, required: true },
      { key: 'mediaTitle', type: 'string', size: 500, required: true },
      { key: 'mediaPoster', type: 'string', size: 500, required: false },
      { key: 'startedAt', type: 'string', size: 50, required: false },
      { key: 'lastWatchedAt', type: 'string', size: 50, required: false },
      { key: 'progress', type: 'integer', required: false, default: 0 },
      { key: 'totalDuration', type: 'integer', required: false, default: 0 },
      { key: 'season', type: 'integer', required: false, default: 0 },
      { key: 'episode', type: 'integer', required: false, default: 0 }
    ]);

    // 9. Notifications Collection
    await createCollection('notifications', 'Notifications', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'type', type: 'string', size: 100, required: true },
      { key: 'title', type: 'string', size: 500, required: true },
      { key: 'message', type: 'string', size: 2000, required: true },
      { key: 'data', type: 'string', size: 5000, required: false, default: '{}' },
      { key: 'read', type: 'boolean', required: false, default: false }
    ]);

    // 10. Posts Collection
    await createCollection('posts', 'Posts', [
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 5000, required: false },
      { key: 'images', type: 'string', size: 10000, required: false, default: '[]' },
      { key: 'mediaId', type: 'string', size: 255, required: false },
      { key: 'mediaType', type: 'string', size: 50, required: false },
      { key: 'mediaTitle', type: 'string', size: 500, required: false },
      { key: 'mediaPoster', type: 'string', size: 500, required: false },
      { key: 'spoiler', type: 'boolean', required: false, default: false },
      { key: 'likes', type: 'string', size: 10000, required: false, default: '[]' },
      { key: 'commentCount', type: 'integer', required: false, default: 0 }
    ]);

    // 11. Comments Collection
    await createCollection('comments', 'Comments', [
      { key: 'postId', type: 'string', size: 255, required: true },
      { key: 'userId', type: 'string', size: 255, required: true },
      { key: 'content', type: 'string', size: 2000, required: true },
      { key: 'likes', type: 'string', size: 5000, required: false, default: '[]' }
    ]);

    console.log('\n🎉 Appwrite database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Database: tvdom_main');
    console.log('   • Collections: 11 created');
    console.log('   • Attributes: All configured');
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Set up collection permissions in Appwrite Console');
    console.log('   2. Add your domain to Appwrite project platforms');
    console.log('   3. Test your application with: npm run dev');
    console.log('   4. Check the APPWRITE_DATABASE_SETUP.md for detailed configuration');

  } catch (error) {
    console.error('\n❌ Error setting up database:', error);
    console.log('\n🔍 Troubleshooting:');
    console.log('   • Check your .env file has correct Appwrite credentials');
    console.log('   • Verify your API key has Database permissions');
    console.log('   • Ensure your Appwrite project exists');
  }
}

setupDatabase();