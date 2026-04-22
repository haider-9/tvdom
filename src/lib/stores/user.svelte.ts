import { browser } from "$app/environment";
import { account } from "$lib/appwrite.js";
import type {
  User,
  UserProfile,
  AuthState,
  LoginCredentials,
  RegisterData,
  UserUpdateData,
  Rating,
  Review,
  WatchlistItem,
  WatchedItem,
  Collection,
  Activity,
  Notification,
  Follow,
} from "../user-types.js";

// Storage keys for session persistence
const USER_STORAGE_KEY = "tvdom_user";
const SESSION_STORAGE_KEY = "tvdom_session";

// API helper functions
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "API request failed");
  }

  return response.json();
}

// Create reactive user state using Svelte 5 runes
class UserStore {
  // Core authentication state
  #authState = $state<AuthState>({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  });

  // Initialization state
  #initialized = $state(false);

  // User data state
  #userProfile = $state<UserProfile | null>(null);
  #userRatings = $state<Rating[]>([]);
  #userReviews = $state<Review[]>([]);
  #userWatchlist = $state<WatchlistItem[]>([]);
  #userWatched = $state<WatchedItem[]>([]);
  #userCollections = $state<Collection[]>([]);
  #userFollows = $state<Follow[]>([]);
  #userFollowers = $state<Follow[]>([]);
  #userActivities = $state<Activity[]>([]);
  #userNotifications = $state<Notification[]>([]);
  #userPersonRatings = $state<any[]>([]);
  #userPersonFavorites = $state<any[]>([]);

  // UI state
  #isProfileModalOpen = $state(false);
  #isLoginModalOpen = $state(false);
  #isRegisterModalOpen = $state(false);
  #activeTab = $state<
    "profile" | "ratings" | "reviews" | "watchlist" | "collections"
  >("profile");

  constructor() {
    if (browser) {
      this.initializeFromStorage();
      this.#initialized = true;
    }
  }

  // Getters (computed values using $derived)
  get authState() {
    return this.#authState;
  }
  get user() {
    return this.#authState.user;
  }
  get isAuthenticated() {
    return this.#authState.isAuthenticated;
  }

  get initialized() {
    return this.#initialized;
  }
  get isLoading() {
    return this.#authState.isLoading;
  }
  get error() {
    return this.#authState.error;
  }

  get userProfile() {
    return this.#userProfile;
  }
  get userRatings() {
    return this.#userRatings;
  }
  get userPersonRatings() {
    return this.#userPersonRatings;
  }
  get userPersonFavorites() {
    return this.#userPersonFavorites;
  }
  get userReviews() {
    return this.#userReviews;
  }
  get userWatchlist() {
    return this.#userWatchlist;
  }
  get userWatched() {
    return this.#userWatched;
  }
  get userCollections() {
    return this.#userCollections;
  }
  get userFollows() {
    return this.#userFollows;
  }
  get userFollowers() {
    return this.#userFollowers;
  }
  get userActivities() {
    return this.#userActivities;
  }
  get userNotifications() {
    return this.#userNotifications;
  }

  get isProfileModalOpen() {
    return this.#isProfileModalOpen;
  }
  get isLoginModalOpen() {
    return this.#isLoginModalOpen;
  }
  get isRegisterModalOpen() {
    return this.#isRegisterModalOpen;
  }
  get activeTab() {
    return this.#activeTab;
  }

  // Computed statistics using proper $derived placement
  #unreadNotificationCount = $derived(
    this.#userNotifications.filter((n) => !n.isRead).length,
  );
  #favoriteGenreStats = $derived(() => {
    const genreCounts: Record<string, number> = {};
    this.#userRatings.forEach((rating) => {
      const mockGenres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi"];
      const randomGenre =
        mockGenres[Math.floor(Math.random() * mockGenres.length)];
      genreCounts[randomGenre] = (genreCounts[randomGenre] || 0) + 1;
    });
    return Object.entries(genreCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  });
  #averageRating = $derived(() => {
    if (this.#userRatings.length === 0) return 0;
    const sum = this.#userRatings.reduce(
      (acc, rating) => acc + rating.rating,
      0,
    );
    return Math.round((sum / this.#userRatings.length) * 10) / 10;
  });

  // Getters for computed values
  get unreadNotificationCount() {
    return this.#unreadNotificationCount;
  }
  get favoriteGenreStats() {
    return this.#favoriteGenreStats;
  }
  get averageRating() {
    return this.#averageRating;
  }

  // Authentication methods using Appwrite
  async login(credentials: LoginCredentials): Promise<void> {
    this.#authState.isLoading = true;
    this.#authState.error = null;

    try {
      // Use Appwrite authentication
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const user: User = response.user;

      // Convert to local format
      this.#authState.user = {
        _id: user._id || user.id,
        id: user.id || user._id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: user.avatar,
        banner: user.banner,
        bio: user.bio,
        location: user.location,
        website: user.website,
        joinedAt: new Date(user.joinedAt),
        lastActiveAt: new Date(user.lastActiveAt),
        isVerified: user.isVerified,
        isPrivate: user.isPrivate,
        followerCount: user.followerCount,
        followingCount: user.followingCount,
        totalRatings: user.totalRatings,
        averageRating: user.averageRating,
        favoriteGenres: user.favoriteGenres,
        watchlistCount: user.watchlistCount,
        watchedCount: user.watchedCount,
      };

      this.#authState.isAuthenticated = true;

      if (browser) {
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(this.#authState.user),
        );

        const sessionData = {
          userId: this.#authState.user.id || this.#authState.user._id,
          user: this.#authState.user,
          timestamp: Date.now(),
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      }

      await this.loadUserData();
    } catch (error) {
      this.#authState.error =
        error instanceof Error ? error.message : "Login failed";
      throw error;
    } finally {
      this.#authState.isLoading = false;
    }
  }

  async register(data: RegisterData): Promise<void> {
    this.#authState.isLoading = true;
    this.#authState.error = null;

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (data.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const newUserData = {
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        password: data.password,
      };

      const createResponse = await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(newUserData),
      });

      const createdUser = createResponse.user;

      this.#authState.user = {
        _id: createdUser.$id,
        id: createdUser.$id,
        username: createdUser.username,
        email: createdUser.email,
        displayName: createdUser.displayName,
        avatar: createdUser.avatar,
        banner: createdUser.banner,
        bio: createdUser.bio,
        location: createdUser.location,
        website: createdUser.website,
        joinedAt: new Date(createdUser.$createdAt),
        lastActiveAt: new Date(createdUser.lastActiveAt),
        isVerified: createdUser.isVerified,
        isPrivate: createdUser.isPrivate,
        followerCount: createdUser.followerCount,
        followingCount: createdUser.followingCount,
        totalRatings: createdUser.totalRatings,
        averageRating: createdUser.averageRating,
        favoriteGenres: createdUser.favoriteGenres,
        watchlistCount: createdUser.watchlistCount,
        watchedCount: createdUser.watchedCount,
      };

      this.#authState.isAuthenticated = true;

      if (browser) {
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(this.#authState.user),
        );

        const sessionData = {
          userId: this.#authState.user.id || this.#authState.user._id,
          user: this.#authState.user,
          timestamp: Date.now(),
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
      }

      await this.loadUserData();
    } catch (error) {
      this.#authState.error =
        error instanceof Error ? error.message : "Registration failed";
      throw error;
    } finally {
      this.#authState.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    // Since we're using custom auth, just clear local state
    this.#authState.user = null;
    this.#authState.session = null;
    this.#authState.isAuthenticated = false;

    // Clear all user data
    this.#userProfile = null;
    this.#userRatings = [];
    this.#userReviews = [];
    this.#userWatchlist = [];
    this.#userWatched = [];
    this.#userCollections = [];
    this.#userFollows = [];
    this.#userFollowers = [];
    this.#userActivities = [];
    this.#userNotifications = [];

    if (browser) {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  // Helper method to get user ID
  getUserId(): string | null {
    return this.#authState.user?.id || this.#authState.user?._id || null;
  }

  // Initialize from storage
  initializeFromStorage(): void {
    if (!browser) return;

    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        this.#authState.user = JSON.parse(storedUser);
        this.#authState.isAuthenticated = true;
        this.loadUserData();
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }

  // Load user data
  async loadUserData(): Promise<void> {
    if (!this.#authState.user) return;

    const userId = this.getUserId();
    if (!userId) return;

    try {
      // Load user ratings
      const ratingsResponse = await apiRequest(`/api/ratings?userId=${userId}`);
      this.#userRatings = ratingsResponse.ratings || [];

      // Load user watchlist
      const watchlistResponse = await apiRequest(`/api/watchlist?userId=${userId}`);
      this.#userWatchlist = watchlistResponse.watchlist || [];

      // Load user watched items
      const watchedResponse = await apiRequest(`/api/watched?userId=${userId}`);
      this.#userWatched = watchedResponse.watched || [];

      // Load user follows
      const followsResponse = await apiRequest(`/api/follows?userId=${userId}`);
      this.#userFollows = followsResponse.follows || [];

      // Load person ratings
      const personRatingsResponse = await apiRequest(`/api/person-ratings?userId=${userId}`);
      this.#userPersonRatings = personRatingsResponse.ratings || [];

      // Load person favorites
      const personFavoritesResponse = await apiRequest(`/api/person-favorites?userId=${userId}`);
      this.#userPersonFavorites = personFavoritesResponse.favorites || [];

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  // Rating methods
  async addRating(
    mediaId: string,
    mediaType: "movie" | "tv",
    rating: number,
    review?: string,
    mediaTitle?: string,
    mediaPoster?: string,
  ): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      const response = await apiRequest("/api/ratings", {
        method: "POST",
        body: JSON.stringify({
          userId,
          mediaId,
          mediaType,
          rating,
          review,
          mediaTitle: mediaTitle || `${mediaType} ${mediaId}`,
          mediaPoster,
        }),
      });

      // Reload ratings
      await this.loadUserData();
    } catch (error) {
      console.error("Error adding rating:", error);
      throw error;
    }
  }

  async deleteRating(mediaId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest(`/api/ratings?userId=${userId}&mediaId=${mediaId}`, {
        method: "DELETE",
      });

      // Reload ratings
      await this.loadUserData();
    } catch (error) {
      console.error("Error deleting rating:", error);
      throw error;
    }
  }

  // Watchlist methods
  async addToWatchlist(
    mediaId: string,
    mediaType: "movie" | "tv",
    mediaTitle: string,
    mediaPoster?: string,
    mediaYear?: number,
    mediaGenres?: string[],
  ): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest("/api/watchlist", {
        method: "POST",
        body: JSON.stringify({
          userId,
          mediaId,
          mediaType,
          mediaTitle,
          mediaPoster,
          mediaYear,
          mediaGenres,
        }),
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error adding to watchlist:", error);
      throw error;
    }
  }

  async removeFromWatchlist(mediaId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest(`/api/watchlist?userId=${userId}&mediaId=${mediaId}`, {
        method: "DELETE",
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error removing from watchlist:", error);
      throw error;
    }
  }

  // Watched methods
  async markAsWatched(
    mediaId: string,
    mediaType: "movie" | "tv",
    mediaTitle: string,
    mediaPoster?: string,
  ): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest("/api/watched", {
        method: "POST",
        body: JSON.stringify({
          userId,
          mediaId,
          mediaType,
          mediaTitle,
          mediaPoster,
        }),
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error marking as watched:", error);
      throw error;
    }
  }

  // Person rating methods
  async addPersonRating(
    personId: string,
    rating: number,
    review?: string,
    personName?: string,
    personImage?: string,
  ): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest("/api/person-ratings", {
        method: "POST",
        body: JSON.stringify({
          userId,
          personId,
          rating,
          review,
          personName: personName || `Person ${personId}`,
          personImage,
        }),
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error adding person rating:", error);
      throw error;
    }
  }

  async deletePersonRating(personId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest(`/api/person-ratings?userId=${userId}&personId=${personId}`, {
        method: "DELETE",
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error deleting person rating:", error);
      throw error;
    }
  }

  // Person favorites methods
  async addPersonToFavorites(
    personId: string,
    personName: string,
    personImage?: string,
    personKnownFor?: string,
  ): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest("/api/person-favorites", {
        method: "POST",
        body: JSON.stringify({
          userId,
          personId,
          personName,
          personImage,
          personKnownFor,
        }),
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error adding person to favorites:", error);
      throw error;
    }
  }

  async removePersonFromFavorites(personId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      await apiRequest(`/api/person-favorites?userId=${userId}&personId=${personId}`, {
        method: "DELETE",
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error removing person from favorites:", error);
      throw error;
    }
  }

  // Follow methods
  async followUser(followingId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const followerId = this.getUserId();
      if (!followerId) throw new Error("User ID not found");

      await apiRequest("/api/follows", {
        method: "POST",
        body: JSON.stringify({
          followerId,
          followingId,
        }),
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  }

  async unfollowUser(followingId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const followerId = this.getUserId();
      if (!followerId) throw new Error("User ID not found");

      await apiRequest(`/api/follows?followerId=${followerId}&followingId=${followingId}`, {
        method: "DELETE",
      });

      // Reload data
      await this.loadUserData();
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  }

  // Image upload methods using Appwrite Storage directly
  async uploadAvatar(file: File): Promise<string> {
    if (!file) throw new Error("No file provided");

    try {
      // Import Appwrite services dynamically
      const { storage, ID } = await import("$lib/appwrite.js");
      
      const BUCKET_ID = '69e8ff9f0028fa5accf6';
      const fileId = ID.unique();

      // Upload file to Appwrite Storage
      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        fileId,
        file
      );

      console.log('Uploaded file:', uploadedFile); // Debug log

      // Get file URL using the uploaded file's $id and ensure it's a string
      const fileUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);
      const urlString = String(fileUrl); // Ensure it's a string
      console.log('Generated URL:', urlString); // Debug log
      console.log('URL type:', typeof urlString); // Debug log
      
      return urlString;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      throw error;
    }
  }

  async uploadBanner(file: File): Promise<string> {
    if (!file) throw new Error("No file provided");

    try {
      // Import Appwrite services dynamically
      const { storage, ID } = await import("$lib/appwrite.js");
      
      const BUCKET_ID = '69e8ff9f0028fa5accf6';
      const fileId = ID.unique();

      // Upload file to Appwrite Storage
      const uploadedFile = await storage.createFile(
        BUCKET_ID,
        fileId,
        file
      );

      console.log('Uploaded file:', uploadedFile); // Debug log

      // Get file URL using the uploaded file's $id and ensure it's a string
      const fileUrl = storage.getFileView(BUCKET_ID, uploadedFile.$id);
      const urlString = String(fileUrl); // Ensure it's a string
      console.log('Generated URL:', urlString); // Debug log
      console.log('URL type:', typeof urlString); // Debug log
      
      return urlString;
    } catch (error) {
      console.error("Error uploading banner:", error);
      throw error;
    }
  }

  // Profile update method - handle directly with users table
  async updateProfile(updateData: UserUpdateData): Promise<void> {
    if (!this.#authState.user) throw new Error("User not authenticated");

    try {
      const userId = this.getUserId();
      if (!userId) throw new Error("User ID not found");

      console.log('Updating profile with data:', updateData); // Debug log
      console.log('User ID:', userId); // Debug log

      // Update user profile via API
      const response = await apiRequest(`/api/users?userId=${userId}`, {
        method: "PATCH",
        body: JSON.stringify(updateData),
      });

      console.log('Profile update response:', response); // Debug log

      // Update local user state
      if (this.#authState.user && response.user) {
        this.#authState.user = {
          ...this.#authState.user,
          ...response.user,
        };

        // Update localStorage
        if (browser) {
          localStorage.setItem(
            USER_STORAGE_KEY,
            JSON.stringify(this.#authState.user)
          );
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // UI state methods
  openProfileModal() {
    this.#isProfileModalOpen = true;
  }

  closeProfileModal() {
    this.#isProfileModalOpen = false;
  }

  openLoginModal() {
    this.#isLoginModalOpen = true;
  }

  closeLoginModal() {
    this.#isLoginModalOpen = false;
  }

  openRegisterModal() {
    this.#isRegisterModalOpen = true;
  }

  closeRegisterModal() {
    this.#isRegisterModalOpen = false;
  }

  setActiveTab(tab: "profile" | "ratings" | "reviews" | "watchlist" | "collections") {
    this.#activeTab = tab;
  }
}

// Create and export the store instance
export const userStore = new UserStore();