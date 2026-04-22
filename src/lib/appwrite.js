import { Client, Account, Databases, Storage, ID } from "appwrite";
import {
  PUBLIC_APPWRITE_ENDPOINT,
  PUBLIC_APPWRITE_PROJECT_ID,
} from "$env/static/public";
import { browser } from "$app/environment";

// Initialize Appwrite client
export const client = new Client();

// Configure client
client.setEndpoint(PUBLIC_APPWRITE_ENDPOINT);
client.setProject(PUBLIC_APPWRITE_PROJECT_ID);

// For server-side operations, we'll set the API key in the API routes directly
// This avoids the async import issue at module level

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// Helper function to create server client with API key
export function createServerClient() {
  if (browser) {
    throw new Error('Server client should only be used on server-side');
  }
  
  const serverClient = new Client();
  serverClient.setEndpoint(PUBLIC_APPWRITE_ENDPOINT);
  serverClient.setProject(PUBLIC_APPWRITE_PROJECT_ID);
    
  return serverClient;
}

// Export ID utility
export { ID };

// Database and collection configuration
export const DATABASE_ID = "69e8ecf30012d700e7fb";
export const COLLECTIONS = {
  USERS: "users",
  RATINGS: "ratings",
  WATCHLIST: "watchlist",
  WATCHED: "watched",
  FOLLOWS: "follows",
  PERSON_RATINGS: "person_ratings",
  PERSON_FAVORITES: "person_favorites",
  CURRENTLY_WATCHING: "currently_watching",
  NOTIFICATIONS: "notifications",
  ACTIVITIES: "activities",
  POSTS: "posts",
  COMMENTS: "comments",
};
