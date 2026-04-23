import { browser } from "$app/environment";
// Simple API request helper
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

export interface Notification {
  $createdAt: Date;
  id: string;
  userId: string;
  type: 'follow' | 'unfollow' | 'rating' | 'review' | 'system' | 'api_change' | 'new_release' | 'upcoming' | 'trending' | 'activity';
  title: string;
  message: string;
  data?: {
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    mediaId?: string;
    mediaTitle?: string;
    mediaType?: 'movie' | 'tv';
    posterPath?: string;
    rating?: number;
    followId?: string;
  };
  read: boolean;
  createdAt: Date;
  virtual?: boolean;
}

export interface Activity {
  id: string;
  userId: string;
  type: "follow" | "rating" | "review" | "watchlist_add" | "watched_add";
  actorId: string;
  actorName: string;
  actorAvatar?: string;
  mediaId?: string;
  mediaTitle?: string;
  mediaType?: "movie" | "tv";
  rating?: number;
  review?: string;
  createdAt: Date;
}

class NotificationStore {
  #notifications = $state<Notification[]>([]);
  #recentActivities = $state<Activity[]>([]);
  #unreadCount = $state(0);
  #isLoading = $state(false);
  #lastFetch = 0;
  #pollInterval: number | null = null;

  constructor() {
    if (browser) {
      this.startPolling();
    }
  }

  get notifications() {
    return this.#notifications;
  }

  get recentActivities() {
    return this.#recentActivities;
  }

  get unreadCount() {
    return this.#unreadCount;
  }

  get isLoading() {
    return this.#isLoading;
  }

  private startPolling() {
    // Only start polling if we have a valid user ID
    const userId = this.getCurrentUserId();
    if (!userId) {
      console.log("No user ID available, skipping notification polling");
      return;
    }

    // Poll for new notifications every 30 seconds
    this.#pollInterval = setInterval(() => {
      const currentUserId = this.getCurrentUserId();
      if (currentUserId) {
        this.fetchNotifications(false);
        this.fetchRecentActivities();
      }
    }, 30000);

    // Initial fetch
    this.fetchNotifications(true);
    this.fetchRecentActivities();
  }

  private stopPolling() {
    if (this.#pollInterval) {
      clearInterval(this.#pollInterval);
      this.#pollInterval = null;
    }
  }

  private readonly SEEN_VIRTUAL_KEY = 'tvdom_seen_virtual_notifs';

  private getSeenVirtualIds(): Set<string> {
    try {
      const raw = localStorage.getItem(this.SEEN_VIRTUAL_KEY);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch { return new Set(); }
  }

  private markVirtualSeen(ids: string[]) {
    try {
      const seen = this.getSeenVirtualIds();
      ids.forEach(id => seen.add(id));
      // Keep only last 200 to avoid unbounded growth
      const trimmed = [...seen].slice(-200);
      localStorage.setItem(this.SEEN_VIRTUAL_KEY, JSON.stringify(trimmed));
    } catch { /* ignore */ }
  }

  async fetchNotifications(showLoading = false) {
    if (!browser) return;

    // Don't fetch if we just fetched recently (avoid spam)
    const now = Date.now();
    if (now - this.#lastFetch < 10000) return; // 10 seconds minimum between fetches

    try {
      if (showLoading) this.#isLoading = true;
      this.#lastFetch = now;

      const response = await apiRequest(
        `/api/notifications?userId=${this.getCurrentUserId()}`,
      );

      if (response.notifications) {
        const seenVirtual = this.getSeenVirtualIds();

        this.#notifications = response.notifications.map((n: any) => ({
          ...n,
          id: n._id || n.id || n.$id,
          createdAt: new Date(n.createdAt || n.$createdAt),
          $createdAt: new Date(n.$createdAt || n.createdAt),
          // Virtual notifications are "read" if their ID is in the seen set
          read: n.virtual ? seenVirtual.has(n.id || n._id || n.$id) : n.read,
        }));

        // Update unread count
        this.#unreadCount = this.#notifications.filter((n) => !n.read).length;
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      if (showLoading) this.#isLoading = false;
    }
  }

  async fetchRecentActivities() {
    if (!browser) return;

    try {
      const response = await apiRequest(
        `/api/activities?userId=${this.getCurrentUserId()}&type=following`,
      );

      if (response.activities) {
        this.#recentActivities = response.activities.map((a: any) => ({
          ...a,
          id: a._id || a.id, // Ensure we have an id field
          createdAt: new Date(a.createdAt),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
    }
  }

  async markAsRead(notificationId: string) {
    if (!browser) return;

    const notification = this.#notifications.find(n => n.id === notificationId);

    // Virtual notifications are tracked in localStorage, not the DB
    if (notification?.virtual) {
      this.markVirtualSeen([notificationId]);
      if (notification && !notification.read) {
        notification.read = true;
        this.#unreadCount = Math.max(0, this.#unreadCount - 1);
      }
      return;
    }

    try {
      await apiRequest("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({
          action: "markRead",
          userId: this.getCurrentUserId(),
          notificationIds: [notificationId],
        }),
      });

      // Update local state
      if (notification && !notification.read) {
        notification.read = true;
        this.#unreadCount = Math.max(0, this.#unreadCount - 1);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async markAllAsRead() {
    if (!browser) return;

    // Mark all virtual ones in localStorage
    const virtualIds = this.#notifications
      .filter(n => n.virtual && !n.read)
      .map(n => n.id);
    if (virtualIds.length > 0) this.markVirtualSeen(virtualIds);

    try {
      await apiRequest("/api/notifications", {
        method: "PATCH",
        body: JSON.stringify({
          action: "markAllRead",
          userId: this.getCurrentUserId(),
        }),
      });

      // Update local state
      this.#notifications.forEach((n) => (n.read = true));
      this.#unreadCount = 0;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }

  async deleteNotification(notificationId: string) {
    if (!browser) return;

    try {
      await apiRequest(
        `/api/notifications?notificationId=${notificationId}&userId=${this.getCurrentUserId()}`,
        {
          method: "DELETE",
        },
      );

      // Update local state
      const notification = this.#notifications.find(
        (n) => n.id === notificationId,
      );
      if (notification && !notification.read) {
        this.#unreadCount = Math.max(0, this.#unreadCount - 1);
      }

      this.#notifications = this.#notifications.filter(
        (n) => n.id !== notificationId,
      );
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }

  async createNotification(
    notification: Omit<Notification, "id" | "createdAt">,
  ) {
    if (!browser) return;

    try {
      const response = await apiRequest("/api/notifications", {
        method: "POST",
        body: JSON.stringify(notification),
      });

      if (response.notification) {
        const newNotification = {
          ...response.notification,
          id: response.notification._id || response.notification.id, // Ensure we have an id field
          createdAt: new Date(response.notification.createdAt),
        };

        this.#notifications.unshift(newNotification);
        if (!newNotification.read) {
          this.#unreadCount++;
        }
      }
    } catch (error) {
      console.error("Failed to create notification:", error);
    }
  }

  // Utility methods for creating specific notification types
  async notifyFollow(
    followerId: string,
    followerName: string,
    followerAvatar?: string,
  ) {
    await this.createNotification({
      userId: followerId, // This would actually be the user being followed
      type: "follow",
      title: "New Follower",
      message: `${followerName} started following you`,
      data: {
        actorId: followerId,
        actorName: followerName,
        actorAvatar: followerAvatar,
      },
      read: false,
    });
  }

  async notifyRating(
    userId: string,
    actorName: string,
    mediaTitle: string,
    mediaType: "movie" | "tv",
    rating: number,
    actorAvatar?: string,
  ) {
    await this.createNotification({
      userId,
      type: "rating",
      title: "New Rating",
      message: `${actorName} rated ${mediaTitle} ${rating}/10`,
      data: {
        actorName,
        actorAvatar,
        mediaTitle,
        mediaType,
        rating,
      },
      read: false,
    });
  }

  async notifySystemUpdate(title: string, message: string) {
    // This would notify all users or specific users about system changes
    await this.createNotification({
      userId: "all", // Special case for system notifications
      type: "system",
      title,
      message,
      read: false,
    });
  }

  async notifyApiChange(title: string, message: string) {
    await this.createNotification({
      userId: "all",
      type: "api_change",
      title,
      message,
      read: false,
    });
  }

  // Helper method to get current user ID
  private getCurrentUserId(): string {
    try {
      // Use the correct localStorage key that TVDom uses
      const userData = localStorage.getItem("tvdom_user");
      if (userData) {
        const user = JSON.parse(userData);
        const userId = user.id || user._id;
        if (userId) {
          console.log("Found user ID:", userId);
          return userId.toString();
        }
      }

      // Fallback: try session storage
      const sessionData = sessionStorage.getItem("tvdom_session");
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const userId = session.userId || session.user?.id || session.user?._id;
        if (userId) {
          console.log("Found user ID from session:", userId);
          return userId.toString();
        }
      }
    } catch (error) {
      console.warn("Failed to get user ID:", error);
    }
    console.warn("No user ID found in localStorage or sessionStorage");
    return "";
  }

  // Clean up when store is destroyed
  destroy() {
    this.stopPolling();
  }

  // Clear all data (for logout)
  clear() {
    this.#notifications = [];
    this.#recentActivities = [];
    this.#unreadCount = 0;
    this.#isLoading = false;
    this.#lastFetch = 0;
  }
}

export const notificationStore = new NotificationStore();
