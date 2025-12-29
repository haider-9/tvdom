import { browser } from "$app/environment";
import { uploadUserAvatar, uploadUserBanner } from "../utils/cloudinary.js";
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

// Mock API delay for demo purposes
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// API helper functions
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
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
      // This would normally come from the media data
      // For now, we'll use mock data
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

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<void> {
    this.#authState.isLoading = true;
    this.#authState.error = null;

    try {
      // Call backend auth endpoint for real email/password validation
      const response = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
      });

      const user: User = response.user;

      // Convert database user to local format
      this.#authState.user = {
        _id: (user as any)._id?.toString(),
        id: (user as any)._id?.toString() || (user as any).id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        avatar: (user as any).avatar,
        banner: (user as any).banner,
        bio: (user as any).bio,
        location: (user as any).location,
        website: (user as any).website,
        joinedAt: new Date((user as any).joinedAt),
        lastActiveAt: new Date((user as any).lastActiveAt),
        isVerified: (user as any).isVerified,
        isPrivate: (user as any).isPrivate,
        followerCount: (user as any).followerCount,
        followingCount: (user as any).followingCount,
        totalRatings: (user as any).totalRatings,
        averageRating: (user as any).averageRating,
        favoriteGenres: (user as any).favoriteGenres,
        watchlistCount: (user as any).watchlistCount,
        watchedCount: (user as any).watchedCount,
      };

      this.#authState.isAuthenticated = true;

      if (browser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.#authState.user));
      }

      await this.loadUserData();
    } catch (error) {
      this.#authState.error =
        error instanceof Error ? error.message : "Login failed";
      throw error; // Re-throw for toast handling
    } finally {
      this.#authState.isLoading = false;
    }
  }

  async register(data: RegisterData): Promise<void> {
    this.#authState.isLoading = true;
    this.#authState.error = null;

    try {
      await delay(1000); // Simulate API call

      // Mock registration validation
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Create new user in database, passing password so it can be stored
      const newUserData = {
        username: data.username,
        email: data.email,
        displayName: data.displayName,
        isVerified: false,
        isPrivate: false,
        followerCount: 0,
        followingCount: 0,
        totalRatings: 0,
        averageRating: 0,
        favoriteGenres: [],
        watchlistCount: 0,
        watchedCount: 0,
        password: data.password,
      };

      const createResponse = await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUserData),
      });

      const createdUser = createResponse.user;

      // Convert database user to local format
      this.#authState.user = {
        _id: createdUser._id.toString(),
        id: createdUser._id.toString(),
        username: createdUser.username,
        email: createdUser.email,
        displayName: createdUser.displayName,
        avatar: createdUser.avatar,
        banner: createdUser.banner,
        bio: createdUser.bio,
        location: createdUser.location,
        website: createdUser.website,
        joinedAt: new Date(createdUser.joinedAt),
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
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(this.#authState.user));
      }

      await this.loadUserData();
    } catch (error) {
      this.#authState.error =
        error instanceof Error ? error.message : "Registration failed";
      throw error; // Re-throw for toast handling
    } finally {
      this.#authState.isLoading = false;
    }
  }

  async logout(): Promise<void> {
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

  // Profile management
  async updateProfile(data: UserUpdateData): Promise<void> {
    if (!this.#authState.user) return;

    this.#authState.isLoading = true;
    try {
      const userId = this.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await apiRequest('/api/users', {
        method: 'PUT',
        body: JSON.stringify({
          userId,
          ...data,
        }),
      });

      // Update local user object
      this.#authState.user = {
        ...this.#authState.user,
        ...data,
        displayName: data.displayName || this.#authState.user.displayName,
      };

      if (browser) {
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(this.#authState.user),
        );
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      this.#authState.isLoading = false;
    }
  }

  async uploadAvatar(file: File): Promise<void> {
    if (!this.#authState.user) return;

    this.#authState.isLoading = true;
    try {
      const userId = this.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Upload to Cloudinary
      const uploadResult = await uploadUserAvatar(file);

      // Update user avatar in database
      await apiRequest('/api/users', {
        method: 'PUT',
        body: JSON.stringify({
          userId,
          avatar: uploadResult.secure_url,
        }),
      });

      // Update local state
      this.#authState.user.avatar = uploadResult.secure_url;

      if (browser) {
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(this.#authState.user),
        );
      }
    } catch (error) {
      this.#authState.error =
        error instanceof Error ? error.message : "Avatar upload failed";
      throw error;
    } finally {
      this.#authState.isLoading = false;
    }
  }

  async uploadBanner(file: File): Promise<void> {
    if (!this.#authState.user) return;

    this.#authState.isLoading = true;
    try {
      const userId = this.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Upload to Cloudinary
      const uploadResult = await uploadUserBanner(file);

      // Update user banner in database
      await apiRequest('/api/users', {
        method: 'PUT',
        body: JSON.stringify({
          userId,
          banner: uploadResult.secure_url,
        }),
      });

      // Update local state
      this.#authState.user.banner = uploadResult.secure_url;

      if (browser) {
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(this.#authState.user),
        );
      }
    } catch (error) {
      this.#authState.error =
        error instanceof Error ? error.message : "Banner upload failed";
      throw error;
    } finally {
      this.#authState.isLoading = false;
    }
  }

  // Ratings and Reviews
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
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await apiRequest('/api/ratings', {
        method: 'POST',
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

      // Update local state
      const existingRatingIndex = this.#userRatings.findIndex(r => r.mediaId === mediaId);
      
      const ratingItem: Rating = {
        id: response.rating._id,
        userId,
        mediaId,
        mediaType,
        rating,
        review,
        isSpoiler: response.rating.isSpoiler,
        createdAt: new Date(response.rating.createdAt),
        updatedAt: new Date(response.rating.updatedAt),
        likes: response.rating.likes,
        dislikes: response.rating.dislikes,
        tags: response.rating.tags,
        rewatched: response.rating.rewatched,
      };

      if (existingRatingIndex !== -1) {
        this.#userRatings[existingRatingIndex] = ratingItem;
      } else {
        this.#userRatings.unshift(ratingItem);
        this.#authState.user.totalRatings++;
      }

      // Update average rating from server response
      const userResponse = await apiRequest(`/api/users?userId=${userId}`);
      this.#authState.user.averageRating = userResponse.user.averageRating;
    } catch (error) {
      console.error('Error adding rating:', error);
      throw error;
    }
  }

  async updateRating(
    ratingId: string,
    rating: number,
    review?: string,
  ): Promise<void> {
    // This will be handled by addRating since it updates existing ratings
    const existingRating = this.#userRatings.find((r) => r.id === ratingId);
    if (existingRating) {
      await this.addRating(
        existingRating.mediaId,
        existingRating.mediaType,
        rating,
        review,
      );
    }
  }

  async deleteRating(ratingId: string): Promise<void> {
    if (!this.#authState.user) return;

    const ratingToDelete = this.#userRatings.find(r => r.id === ratingId);
    if (!ratingToDelete) return;

    try {
      const userId = this.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      await apiRequest(`/api/ratings?userId=${userId}&mediaId=${ratingToDelete.mediaId}`, {
        method: 'DELETE',
      });

      // Remove from local state
      const index = this.#userRatings.findIndex(r => r.id === ratingId);
      if (index !== -1) {
        this.#userRatings.splice(index, 1);
        this.#authState.user.totalRatings--;
      }

      // Update average rating
      const userResponse = await apiRequest(`/api/users?userId=${userId}`);
      this.#authState.user.averageRating = userResponse.user.averageRating;
    } catch (error) {
      console.error('Error deleting rating:', error);
      throw error;
    }
  }

  // Watchlist management
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
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const addResponse = await apiRequest('/api/watchlist', {
        method: 'POST',
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

      // Add to local state
      const watchlistItem: WatchlistItem = {
        id: addResponse.item._id,
        userId,
        mediaId,
        mediaType,
        addedAt: new Date(addResponse.item.addedAt),
        priority: addResponse.item.priority,
        mediaTitle,
        mediaPoster,
        mediaYear,
        mediaGenres: mediaGenres || [],
      };

      this.#userWatchlist.unshift(watchlistItem);
      this.#authState.user.watchlistCount++;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(mediaId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      await apiRequest(`/api/watchlist?userId=${userId}&mediaId=${mediaId}`, {
        method: 'DELETE',
      });

      // Remove from local state
      const index = this.#userWatchlist.findIndex(item => item.mediaId === mediaId);
      if (index !== -1) {
        this.#userWatchlist.splice(index, 1);
        this.#authState.user.watchlistCount--;
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  async markAsWatched(
    mediaId: string,
    mediaType: "movie" | "tv",
    mediaTitle: string,
    mediaPoster?: string,
  ): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const watchedResponse = await apiRequest('/api/watched', {
        method: 'POST',
        body: JSON.stringify({
          userId,
          mediaId,
          mediaType,
          mediaTitle,
          mediaPoster,
        }),
      });

      // Add to local watched state
      const watchedItem: WatchedItem = {
        id: watchedResponse.item._id,
        userId,
        mediaId,
        mediaType,
        watchedAt: new Date(watchedResponse.item.watchedAt),
        isFavorite: watchedResponse.item.isFavorite,
        rewatchCount: watchedResponse.item.rewatchCount,
        mediaTitle,
        mediaPoster,
        progress: 100,
      };

      this.#userWatched.unshift(watchedItem);
      this.#authState.user.watchedCount++;

      // Remove from watchlist if it exists
      const watchlistIndex = this.#userWatchlist.findIndex(item => item.mediaId === mediaId);
      if (watchlistIndex !== -1) {
        this.#userWatchlist.splice(watchlistIndex, 1);
        this.#authState.user.watchlistCount--;
      }
    } catch (error) {
      console.error('Error marking as watched:', error);
      throw error;
    }
  }

  // Collections
  async createCollection(
    name: string,
    description?: string,
    isPublic: boolean = true,
  ): Promise<Collection> {
    if (!this.#authState.user) throw new Error("Not authenticated");

    const userId = this.getUserId();
    
    if (!userId) {
      throw new Error('User ID not found');
    }

    const collection: Collection = {
      id: Date.now().toString(),
      userId,
      name,
      description,
      isPublic,
      createdAt: new Date(),
      updatedAt: new Date(),
      items: [],
      followerCount: 0,
      tags: [],
    };

    this.#userCollections.unshift(collection);
    return collection;
  }

  // Notifications
  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notification = this.#userNotifications.find(
      (n) => n.id === notificationId,
    );
    if (notification) {
      notification.isRead = true;
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    this.#userNotifications.forEach((notification) => {
      notification.isRead = true;
    });
  }

  // UI state management
  openProfileModal(): void {
    this.#isProfileModalOpen = true;
  }

  closeProfileModal(): void {
    this.#isProfileModalOpen = false;
  }

  openLoginModal(): void {
    this.#isLoginModalOpen = true;
    this.#isRegisterModalOpen = false;
  }

  closeLoginModal(): void {
    this.#isLoginModalOpen = false;
  }

  openRegisterModal(): void {
    this.#isRegisterModalOpen = true;
    this.#isLoginModalOpen = false;
  }

  closeRegisterModal(): void {
    this.#isRegisterModalOpen = false;
  }

  setActiveTab(
    tab: "profile" | "ratings" | "reviews" | "watchlist" | "collections",
  ): void {
    this.#activeTab = tab;
  }

  // Private methods
  private getUserId(): string | null {
    if (!this.#authState.user) return null;
    return this.#authState.user._id || this.#authState.user.id || null;
  }

  private initializeFromStorage(): void {
    try {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.#authState.user = user;
        this.#authState.isAuthenticated = true;
        this.loadUserData();
      }
    } catch (error) {
      console.error("Failed to load user from storage:", error);
    }
  }

  private async loadUserData(): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Load user data from database
      const [watchlistResponse, ratingsResponse, watchedResponse] = await Promise.all([
        apiRequest(`/api/watchlist?userId=${userId}`),
        apiRequest(`/api/ratings?userId=${userId}`),
        apiRequest(`/api/watched?userId=${userId}`),
      ]);

      // Convert database items to local format
      this.#userWatchlist = watchlistResponse.watchlist.map((item: any) => ({
        id: item._id,
        userId: item.userId,
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        addedAt: new Date(item.addedAt),
        priority: item.priority,
        notes: item.notes,
        mediaTitle: item.mediaTitle,
        mediaPoster: item.mediaPoster,
        mediaYear: item.mediaYear,
        mediaGenres: item.mediaGenres,
      }));

      this.#userRatings = ratingsResponse.ratings.map((rating: any) => ({
        id: rating._id,
        userId: rating.userId,
        mediaId: rating.mediaId,
        mediaType: rating.mediaType,
        rating: rating.rating,
        review: rating.review,
        isSpoiler: rating.isSpoiler,
        createdAt: new Date(rating.createdAt),
        updatedAt: new Date(rating.updatedAt),
        likes: rating.likes,
        dislikes: rating.dislikes,
        tags: rating.tags,
        rewatched: rating.rewatched,
        watchedDate: rating.watchedDate ? new Date(rating.watchedDate) : undefined,
      }));

      this.#userWatched = watchedResponse.watched.map((item: any) => ({
        id: item._id,
        userId: item.userId,
        mediaId: item.mediaId,
        mediaType: item.mediaType,
        watchedAt: new Date(item.watchedAt),
        rating: item.rating,
        isFavorite: item.isFavorite,
        rewatchCount: item.rewatchCount,
        lastRewatchedAt: item.lastRewatchedAt ? new Date(item.lastRewatchedAt) : undefined,
        mediaTitle: item.mediaTitle,
        mediaPoster: item.mediaPoster,
        seasonNumber: item.seasonNumber,
        episodeNumber: item.episodeNumber,
        progress: item.progress,
      }));

      // Mock notifications for now
      this.#userNotifications = [
        {
          id: "1",
          userId,
          type: "follow",
          title: "Welcome to TVDom!",
          message: "Start building your watchlist and rating movies and TV shows",
          isRead: false,
          createdAt: new Date(),
        },
      ];
    } catch (error) {
      console.error('Error loading user data:', error);
      // Fall back to empty arrays if API fails
      this.#userWatchlist = [];
      this.#userRatings = [];
      this.#userWatched = [];
      this.#userNotifications = [];
    }
  }
}

// Create and export the store instance
export const userStore = new UserStore();
