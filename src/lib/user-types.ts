export interface User {
  _id?: string; // Optional for new users, required for database users
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: Date;
  lastActiveAt: Date;
  isVerified: boolean;
  isPrivate: boolean;
  followerCount: number;
  followingCount: number;
  totalRatings: number;
  averageRating: number;
  favoriteGenres: string[];
  watchlistCount: number;
  watchedCount: number;
}

export interface UserProfile extends User {
  socialLinks: {
    twitter?: string;
    instagram?: string;
    letterboxd?: string;
    imdb?: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    showAdultContent: boolean;
    spoilerFilter: boolean;
  };
  statistics: {
    totalWatchTime: number; // in minutes
    favoriteDecade: string;
    mostWatchedGenre: string;
    watchingStreak: number;
    longestWatchingStreak: number;
  };
}

export interface Rating {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  rating: number; // 1-10
  review?: string;
  isSpoiler: boolean;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  tags: string[];
  rewatched: boolean;
  watchedDate?: Date;
}

export interface Review extends Rating {
  title: string;
  content: string;
  mediaTitle: string;
  mediaPoster?: string;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar' | 'isVerified'>;
  comments: Comment[];
  isRecommended: boolean;
}

export interface Comment {
  id: string;
  userId: string;
  reviewId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  replies: Comment[];
  parentCommentId?: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  addedAt: Date;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  reminderDate?: Date;
  mediaTitle: string;
  mediaPoster?: string;
  mediaYear?: number;
  mediaGenres: string[];
}

export interface WatchedItem {
  id: string;
  userId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  watchedAt: Date;
  rating?: number;
  isFavorite: boolean;
  rewatchCount: number;
  lastRewatchedAt?: Date;
  mediaTitle: string;
  mediaPoster?: string;
  seasonNumber?: number; // for TV shows
  episodeNumber?: number; // for TV shows
  progress?: number; // percentage watched (0-100)
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  items: CollectionItem[];
  followerCount: number;
  tags: string[];
  coverImage?: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  addedAt: Date;
  order: number;
  notes?: string;
  mediaTitle: string;
  mediaPoster?: string;
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  following: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
}

export interface Activity {
  id: string;
  userId: string;
  type: 'rating' | 'review' | 'watchlist_add' | 'watched' | 'collection_create' | 'follow' | 'like';
  targetId: string; // ID of the rated/reviewed/watched item
  targetType: 'movie' | 'tv' | 'user' | 'review' | 'collection';
  createdAt: Date;
  metadata: Record<string, any>;
  user: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  isPublic: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastUsedAt: Date;
  userAgent?: string;
  ipAddress?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  session: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface UserSearch {
  query: string;
  filters?: {
    verified?: boolean;
    hasAvatar?: boolean;
    joinedAfter?: Date;
    minRatings?: number;
  };
  sort?: 'newest' | 'oldest' | 'most_ratings' | 'most_followers' | 'alphabetical';
  limit?: number;
  offset?: number;
}

export interface UserUpdateData {
  displayName?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: Partial<UserProfile['socialLinks']>;
  preferences?: Partial<UserProfile['preferences']>;
  isPrivate?: boolean;
}

export interface AvatarUpload {
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface BannerUpload {
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'follow' | 'like' | 'comment' | 'review_mention' | 'collection_follow' | 'new_review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
  relatedUserId?: string;
  relatedUser?: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  metadata?: Record<string, any>;
}

// User statistics and achievements
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteria: Record<string, any>;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  achievement: Achievement;
}

// Export/Import user data
export interface UserDataExport {
  user: UserProfile;
  ratings: Rating[];
  reviews: Review[];
  watchlist: WatchlistItem[];
  watched: WatchedItem[];
  collections: Collection[];
  follows: Follow[];
  achievements: UserAchievement[];
  exportedAt: Date;
  version: string;
}
