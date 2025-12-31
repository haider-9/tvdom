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
  id: string;
  userId: string;
  type: "follow" | "unfollow" | "rating" | "review" | "system" | "api_change";
  title: string;
  message: string;
  data?: {
    actorId?: string;
    actorName?: string;
    actorAvatar?: string;
    mediaId?: string;
    mediaTitle?: string;
    mediaType?: "movie" | "tv";
    rating?: number;
    followId?: string;
  };
  read: boolean;
  createdAt: Date;
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
    // Poll for new notifications every 30 seconds
    this.#pollInterval = setInterval(() => {
      this.fetchNotifications(false);
      this.fetchRecentActivities();
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
        this.#notifications = response.notifications.map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
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
          createdAt: new Date(a.createdAt),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
    }
  }

  async markAsRead(notificationId: string) {
    if (!browser) return;

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
      const notification = this.#notifications.find(
        (n) => n.id === notificationId,
      );
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
