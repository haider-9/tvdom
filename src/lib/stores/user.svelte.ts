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
      const response = await apiRequest("/api/auth/login", {
        method: "POST",
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
        // Store user data in localStorage
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(this.#authState.user),
        );

        // Also store session data for server-side detection
        const sessionData = {
          userId: this.#authState.user.id || this.#authState.user._id,
          user: this.#authState.user,
          timestamp: Date.now(),
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

        // Set cookies for server-side authentication
        document.cookie = `tvdom_user=${encodeURIComponent(JSON.stringify(this.#authState.user))}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
        document.cookie = `tvdom_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
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

      const createResponse = await apiRequest("/api/users", {
        method: "POST",
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
        // Store user data in localStorage
        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(this.#authState.user),
        );

        // Store session data
        const sessionData = {
          userId: this.#authState.user.id || this.#authState.user._id,
          user: this.#authState.user,
          timestamp: Date.now(),
        };

        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));

        // Set cookies for server-side authentication
        document.cookie = `tvdom_user=${encodeURIComponent(JSON.stringify(this.#authState.user))}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
        document.cookie = `tvdom_session=${encodeURIComponent(JSON.stringify(sessionData))}; path=/; max-age=${30 * 24 * 60 * 60}; samesite=lax`;
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

    // Clear notifications as well
    if (browser) {
      try {
        const { notificationStore } = await import("./notification.svelte.js");
        notificationStore.clear();
      } catch (error) {
        console.warn("Failed to clear notifications:", error);
      }
    }

    if (browser) {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(SESSION_STORAGE_KEY);

      // Clear cookies
      document.cookie =
        "tvdom_user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "tvdom_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  // Profile management
  async updateProfile(data: UserUpdateData): Promise<void> {
    if (!this.#authState.user) return;

    this.#authState.isLoading = true;
    try {
      const userId = this.getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await apiRequest("/api/users", {
        method: "PUT",
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
      console.error("Error updating profile:", error);
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
        throw new Error("User ID not found");
      }

      // Upload to Cloudinary
      const uploadResult = await uploadUserAvatar(file);

      // Update user avatar in database
      await apiRequest("/api/users", {
        method: "PUT",
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
        throw new Error("User ID not found");
      }

      // Upload to Cloudinary
      const uploadResult = await uploadUserBanner(file);

      // Update user banner in database
      await apiRequest("/api/users", {
        method: "PUT",
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
        throw new Error("User ID not found");
      }

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

      // Update local state
      const existingRatingIndex = this.#userRatings.findIndex(
        (r) => r.mediaId === mediaId,
      );

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
      console.error("Error adding rating:", error);
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

    const ratingToDelete = this.#userRatings.find((r) => r.id === ratingId);
    if (!ratingToDelete) return;

    try {
      const userId = this.getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      await apiRequest(
        `/api/ratings?userId=${userId}&mediaId=${ratingToDelete.mediaId}`,
        {
          method: "DELETE",
        },
      );

      // Remove from local state
      const index = this.#userRatings.findIndex((r) => r.id === ratingId);
      if (index !== -1) {
        this.#userRatings.splice(index, 1);
        this.#authState.user.totalRatings--;
      }

      // Update average rating
      const userResponse = await apiRequest(`/api/users?userId=${userId}`);
      this.#authState.user.averageRating = userResponse.user.averageRating;
    } catch (error) {
      console.error("Error deleting rating:", error);
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
        throw new Error("User ID not found");
      }

      const addResponse = await apiRequest("/api/watchlist", {
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
      console.error("Error adding to watchlist:", error);
      throw error;
    }
  }

  async removeFromWatchlist(mediaId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      await apiRequest(`/api/watchlist?userId=${userId}&mediaId=${mediaId}`, {
        method: "DELETE",
      });

      // Remove from local state
      const index = this.#userWatchlist.findIndex(
        (item) => item.mediaId === mediaId,
      );
      if (index !== -1) {
        this.#userWatchlist.splice(index, 1);
        this.#authState.user.watchlistCount--;
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
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
        throw new Error("User ID not found");
      }

      const watchedResponse = await apiRequest("/api/watched", {
        method: "POST",
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
      const watchlistIndex = this.#userWatchlist.findIndex(
        (item) => item.mediaId === mediaId,
      );
      if (watchlistIndex !== -1) {
        this.#userWatchlist.splice(watchlistIndex, 1);
        this.#authState.user.watchlistCount--;
      }
    } catch (error) {
      console.error("Error marking as watched:", error);
      throw error;
    }
  }

  // Person ratings and favorites
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

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await apiRequest("/api/person-ratings", {
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

      // Update local state
      const existingIndex = this.#userPersonRatings.findIndex(
        (r) => r.personId === personId,
      );
      const newRating = {
        id: response.rating._id,
        userId: response.rating.userId,
        personId: response.rating.personId,
        rating: response.rating.rating,
        review: response.rating.review,
        personName: response.rating.personName,
        personImage: response.rating.personImage,
        createdAt: new Date(response.rating.createdAt),
        updatedAt: new Date(response.rating.updatedAt),
      };

      if (existingIndex >= 0) {
        this.#userPersonRatings[existingIndex] = newRating;
      } else {
        this.#userPersonRatings.push(newRating);
      }
    } catch (error) {
      console.error("Error adding person rating:", error);
      throw error;
    }
  }

  async deletePersonRating(personId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      await apiRequest(
        `/api/person-ratings?userId=${userId}&personId=${personId}`,
        {
          method: "DELETE",
        },
      );

      // Update local state
      this.#userPersonRatings = this.#userPersonRatings.filter(
        (r) => r.personId !== personId,
      );
    } catch (error) {
      console.error("Error deleting person rating:", error);
      throw error;
    }
  }

  async addPersonToFavorites(
    personId: string,
    personName: string,
    personImage?: string,
    personKnownFor?: string,
  ): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const response = await apiRequest("/api/person-favorites", {
        method: "POST",
        body: JSON.stringify({
          userId,
          personId,
          personName,
          personImage,
          personKnownFor,
        }),
      });

      // Update local state
      const newFavorite = {
        id: response.favorite._id,
        userId: response.favorite.userId,
        personId: response.favorite.personId,
        personName: response.favorite.personName,
        personImage: response.favorite.personImage,
        personKnownFor: response.favorite.personKnownFor,
        addedAt: new Date(response.favorite.addedAt),
      };

      this.#userPersonFavorites.push(newFavorite);
    } catch (error) {
      console.error("Error adding person to favorites:", error);
      throw error;
    }
  }

  async removePersonFromFavorites(personId: string): Promise<void> {
    if (!this.#authState.user) return;

    try {
      const userId = this.getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      await apiRequest(
        `/api/person-favorites?userId=${userId}&personId=${personId}`,
        {
          method: "DELETE",
        },
      );

      // Update local state
      this.#userPersonFavorites = this.#userPersonFavorites.filter(
        (f) => f.personId !== personId,
      );
    } catch (error) {
      console.error("Error removing person from favorites:", error);
      throw error;
    }
  }

  // Follow functionality
  async followUser(followingId: string): Promise<void> {
    if (!this.#authState.user && !browser) return;

    try {
      const followerId = this.getUserId();

      if (!followerId) {
        throw new Error("User ID not found");
      }

      console.log(`Following user: ${followerId} -> ${followingId}`);

      const response = await apiRequest("/api/follows", {
        method: "POST",
        body: JSON.stringify({
          followerId,
          followingId,
        }),
      });

      console.log("Follow response:", response);

      if (response.success && response.follow) {
        // Update local state
        const newFollow = {
          id: response.follow._id,
          followerId: response.follow.followerId,
          followingId: response.follow.followingId,
          createdAt: new Date(response.follow.createdAt),
          follower: this.#authState.user!,
          following: {
            id: followingId,
            username: "unknown",
            displayName: "Unknown User",
            avatar: undefined,
          },
        };

        this.#userFollows.push(newFollow);
        console.log("Added to local follows:", this.#userFollows.length);

        // Clear cache for this follow relationship
        const cacheKey = `${followerId}-${followingId}`;
        this.#followStatusCache.delete(cacheKey);

        // Update user's following count
        if (this.#authState.user) {
          this.#authState.user.followingCount =
            (this.#authState.user.followingCount || 0) + 1;
        }

        // Refresh notifications to show any new follow-related notifications
        if (browser) {
          try {
            const { notificationStore } =
              await import("./notification.svelte.js");
            notificationStore.fetchNotifications();
          } catch (notifError) {
            console.warn("Failed to refresh notifications:", notifError);
          }
        }
      } else {
        console.error("Follow response missing success or follow data");
        throw new Error("Failed to follow user - invalid response");
      }
    } catch (error) {
      console.error("Error following user:", error);
      throw error;
    }
  }

  async unfollowUser(followingId: string): Promise<void> {
    if (!this.#authState.user && !browser) return;

    try {
      const followerId = this.getUserId();

      if (!followerId) {
        throw new Error("User ID not found");
      }

      console.log(`Unfollowing user: ${followerId} -> ${followingId}`);

      const response = await apiRequest(
        `/api/follows?followerId=${followerId}&followingId=${followingId}`,
        {
          method: "DELETE",
        },
      );

      console.log("Unfollow response:", response);

      if (response.success) {
        // Update local state
        const beforeCount = this.#userFollows.length;
        this.#userFollows = this.#userFollows.filter((f) => {
          const targetId = f.followingId;
          return (
            targetId !== followingId && targetId?.toString() !== followingId
          );
        });

        console.log(
          `Removed from local follows: ${beforeCount} -> ${this.#userFollows.length}`,
        );

        // Clear cache for this follow relationship
        const cacheKey = `${followerId}-${followingId}`;
        this.#followStatusCache.delete(cacheKey);

        // Update user's following count
        if (this.#authState.user) {
          this.#authState.user.followingCount = Math.max(
            0,
            (this.#authState.user.followingCount || 0) - 1,
          );
        }

        // Refresh notifications
        if (browser) {
          try {
            const { notificationStore } =
              await import("./notification.svelte.js");
            notificationStore.fetchNotifications();
          } catch (notifError) {
            console.warn("Failed to refresh notifications:", notifError);
          }
        }
      } else {
        console.error("Unfollow response missing success");
        throw new Error("Failed to unfollow user - invalid response");
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
      throw error;
    }
  }

  // Cache for follow status checks to prevent repeated API calls
  #followStatusCache = new Map<string, { result: boolean; timestamp: number }>();

  async checkIfFollowing(followingId: string): Promise<boolean> {
    if (!this.#authState.user && !browser) return false;

    try {
      const followerId = this.getUserId();

      if (!followerId) {
        console.warn("No user ID found for follow check");
        return false;
      }

      // Check cache first (cache for 30 seconds)
      const cacheKey = `${followerId}-${followingId}`;
      const cached = this.#followStatusCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 30000) {
        console.log("Returning cached follow status:", cached.result);
        return cached.result;
      }

      console.log(`Checking if ${followerId} follows ${followingId}`);

      // First check local state
      const localFollow = this.#userFollows.find((f) => {
        const targetId = f.followingId;
        return targetId === followingId || targetId.toString() === followingId;
      });
      if (localFollow) {
        console.log("Found follow in local state");
        const result = true;
        this.#followStatusCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
      }

      // If not found locally, check with server
      const response = await apiRequest(
        `/api/follows?userId=${followerId}&type=following`,
      );

      console.log("Server follow response:", response);

      if (!response.follows || response.follows.length === 0) {
        console.log("No follows found on server");
        const result = false;
        this.#followStatusCache.set(cacheKey, { result, timestamp: Date.now() });
        return result;
      }

      const isFollowing = response.follows.some((follow: any) => {
        const targetId =
          follow.followingId?._id ||
          follow.followingId?.id ||
          follow.followingId;
        const matches =
          targetId === followingId || targetId?.toString() === followingId;
        console.log(
          `Comparing server follow: ${targetId} with target: ${followingId} = ${matches}`,
        );
        return matches;
      });

      console.log(`Final follow status: ${isFollowing}`);

      // Update local state if we found follows on server (but only if we don't have any local follows yet)
      if (response.follows.length > 0 && this.#userFollows.length === 0) {
        this.#userFollows = response.follows.map((follow: any) => ({
          id: follow._id,
          followerId: follow.followerId._id || follow.followerId,
          followingId:
            follow.followingId._id ||
            follow.followingId.id ||
            follow.followingId,
          createdAt: new Date(follow.createdAt),
          follower: follow.followerId,
          following: follow.followingId,
        }));
      }

      // Cache the result
      this.#followStatusCache.set(cacheKey, { result: isFollowing, timestamp: Date.now() });

      return isFollowing;
    } catch (error) {
      console.error("Error checking follow status:", error);
      return false;
    }
  }
  async createCollection(
    name: string,
    description?: string,
    isPublic: boolean = true,
  ): Promise<Collection> {
    if (!this.#authState.user) throw new Error("Not authenticated");

    const userId = this.getUserId();

    if (!userId) {
      throw new Error("User ID not found");
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
    const userId = this.#authState.user._id || this.#authState.user.id;
    if (userId) {
      console.log("Got user ID from store:", userId);
      return userId;
    }

    // Fallback: try to get from localStorage
    if (browser) {
      try {
        const userData = localStorage.getItem("tvdom_user");
        if (userData) {
          const user = JSON.parse(userData);
          const fallbackId = user._id || user.id;
          if (fallbackId) {
            console.log("Got user ID from localStorage fallback:", fallbackId);
            return fallbackId;
          }
        }
      } catch (error) {
        console.warn("Failed to get user ID from localStorage:", error);
      }
    }

    console.warn("No user ID found in store or localStorage");
    return null;
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
        throw new Error("User ID not found");
      }

      // Load user data from database
      const [
        watchlistResponse,
        ratingsResponse,
        watchedResponse,
        personRatingsResponse,
        personFavoritesResponse,
      ] = await Promise.all([
        apiRequest(`/api/watchlist?userId=${userId}`),
        apiRequest(`/api/ratings?userId=${userId}`),
        apiRequest(`/api/watched?userId=${userId}`),
        apiRequest(`/api/person-ratings?userId=${userId}`),
        apiRequest(`/api/person-favorites?userId=${userId}`),
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
        watchedDate: rating.watchedDate
          ? new Date(rating.watchedDate)
          : undefined,
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
        lastRewatchedAt: item.lastRewatchedAt
          ? new Date(item.lastRewatchedAt)
          : undefined,
        mediaTitle: item.mediaTitle,
        mediaPoster: item.mediaPoster,
        seasonNumber: item.seasonNumber,
        episodeNumber: item.episodeNumber,
        progress: item.progress,
      }));

      this.#userPersonRatings = personRatingsResponse.ratings.map(
        (rating: any) => ({
          id: rating._id,
          userId: rating.userId,
          personId: rating.personId,
          rating: rating.rating,
          review: rating.review,
          personName: rating.personName,
          personImage: rating.personImage,
          createdAt: new Date(rating.createdAt),
          updatedAt: new Date(rating.updatedAt),
        }),
      );

      this.#userPersonFavorites = personFavoritesResponse.favorites.map(
        (favorite: any) => ({
          id: favorite._id,
          userId: favorite.userId,
          personId: favorite.personId,
          personName: favorite.personName,
          personImage: favorite.personImage,
          personKnownFor: favorite.personKnownFor,
          addedAt: new Date(favorite.addedAt),
        }),
      );

      // Load follows data - both following and followers
      try {
        const [followingResponse, followersResponse] = await Promise.all([
          apiRequest(`/api/follows?userId=${userId}&type=following`),
          apiRequest(`/api/follows?userId=${userId}&type=followers`),
        ]);

        this.#userFollows =
          followingResponse.follows?.map((follow: any) => ({
            id: follow._id,
            followerId: follow.followerId._id || follow.followerId,
            followingId: follow.followingId._id || follow.followingId,
            createdAt: new Date(follow.createdAt),
            follower: follow.followerId,
            following: follow.followingId,
          })) || [];

        this.#userFollowers =
          followersResponse.follows?.map((follow: any) => ({
            id: follow._id,
            followerId: follow.followerId._id || follow.followerId,
            followingId: follow.followingId._id || follow.followingId,
            createdAt: new Date(follow.createdAt),
            follower: follow.followerId,
            following: follow.followingId,
          })) || [];

        console.log(
          `Loaded ${this.#userFollows.length} following, ${this.#userFollowers.length} followers`,
        );
      } catch (error) {
        console.warn("Failed to load follows:", error);
        this.#userFollows = [];
        this.#userFollowers = [];
      }

      // Mock notifications for now
      this.#userNotifications = [
        {
          id: "1",
          userId,
          type: "follow",
          title: "Welcome to TVDom!",
          message:
            "Start building your watchlist and rating movies and TV shows",
          isRead: false,
          createdAt: new Date(),
        },
      ];
    } catch (error) {
      console.error("Error loading user data:", error);
      // Fall back to empty arrays if API fails
      this.#userWatchlist = [];
      this.#userRatings = [];
      this.#userWatched = [];
      this.#userPersonRatings = [];
      this.#userPersonFavorites = [];
      this.#userNotifications = [];
    }
  }
}

// Create and export the store instance
export const userStore = new UserStore();
