<script lang="ts">
    import {
        Bell,
        X,
        Check,
        CheckCheck,
        Trash2,
        User,
        Star,
        Heart,
        Eye,
        Clock,
    } from "lucide-svelte";
    import { notificationStore } from "$lib/stores/notification.svelte.js";
    import { userStore } from "$lib/stores/user.svelte.js";
    import { onMount } from "svelte";
    // Simple time formatting function
    function formatDistanceToNow(
        date: Date,
        options?: { addSuffix?: boolean },
    ): string {
        const now = new Date();
        const diffInMs = now.getTime() - date.getTime();
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMinutes < 1) {
            return options?.addSuffix ? "just now" : "now";
        } else if (diffInMinutes < 60) {
            return options?.addSuffix
                ? `${diffInMinutes} minutes ago`
                : `${diffInMinutes}m`;
        } else if (diffInHours < 24) {
            return options?.addSuffix
                ? `${diffInHours} hours ago`
                : `${diffInHours}h`;
        } else {
            return options?.addSuffix
                ? `${diffInDays} days ago`
                : `${diffInDays}d`;
        }
    }

    let showDropdown = $state(false);
    let dropdownRef: HTMLDivElement;

    const notifications = $derived(notificationStore.notifications);
    const unreadCount = $derived(notificationStore.unreadCount);
    const isLoading = $derived(notificationStore.isLoading);

    function toggleDropdown() {
        showDropdown = !showDropdown;
        if (showDropdown) {
            // Fetch latest notifications when opening
            notificationStore.fetchNotifications();
        }
    }

    function closeDropdown() {
        showDropdown = false;
    }

    function handleClickOutside(event: MouseEvent) {
        if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
            closeDropdown();
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            closeDropdown();
        }
    }

    async function markAsRead(notificationId: string) {
        await notificationStore.markAsRead(notificationId);
    }

    async function markAllAsRead() {
        await notificationStore.markAllAsRead();
    }

    async function deleteNotification(notificationId: string) {
        await notificationStore.deleteNotification(notificationId);
    }

    function getNotificationIcon(type: string) {
        switch (type) {
            case "follow":
                return User;
            case "rating":
            case "review":
                return Star;
            case "watchlist_add":
                return Heart;
            case "watched_add":
                return Eye;
            case "system":
            case "api_change":
                return Bell;
            default:
                return Bell;
        }
    }

    function getNotificationColor(type: string) {
        switch (type) {
            case "follow":
                return "text-blue-500";
            case "rating":
            case "review":
                return "text-yellow-500";
            case "watchlist_add":
                return "text-red-500";
            case "watched_add":
                return "text-green-500";
            case "system":
                return "text-purple-500";
            case "api_change":
                return "text-orange-500";
            default:
                return "text-gray-500";
        }
    }

    onMount(() => {
        document.addEventListener("click", handleClickOutside);
        document.addEventListener("keydown", handleKeydown);

        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("keydown", handleKeydown);
        };
    });
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative" bind:this={dropdownRef}>
    <!-- Notification Bell Button -->
    <button
        onclick={toggleDropdown}
        class="relative p-2 rounded-lg hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Notifications"
    >
        <Bell class="w-5 h-5 text-foreground" />

        <!-- Unread Badge -->
        {#if unreadCount > 0}
            <span
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
            >
                {unreadCount > 99 ? "99+" : unreadCount}
            </span>
        {/if}
    </button>

    <!-- Dropdown -->
    {#if showDropdown}
        <!-- Click outside overlay -->
        <button
            class="fixed inset-0 z-[70]"
            onclick={closeDropdown}
            aria-label="Close notifications"
            tabindex="-1"
        ></button>

        <div
            class="absolute right-0 top-full mt-2 w-96 bg-background border border-border rounded-lg shadow-lg z-[75] max-h-[80vh] overflow-hidden"
        >
            <!-- Header -->
            <div class="px-4 py-3 border-b border-border bg-muted/20">
                <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold text-foreground">
                        Notifications
                    </h3>
                    <div class="flex items-center gap-2">
                        {#if unreadCount > 0}
                            <button
                                onclick={markAllAsRead}
                                class="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                                title="Mark all as read"
                            >
                                <CheckCheck class="w-4 h-4" />
                                Mark all read
                            </button>
                        {/if}
                        <button
                            onclick={closeDropdown}
                            class="p-1 hover:bg-accent/10 rounded transition-colors"
                            aria-label="Close"
                        >
                            <X class="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <!-- Content -->
            <div class="max-h-[60vh] overflow-y-auto">
                {#if isLoading && notifications.length === 0}
                    <div class="flex items-center justify-center py-8">
                        <div
                            class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
                        ></div>
                    </div>
                {:else if notifications.length === 0}
                    <div
                        class="flex flex-col items-center justify-center py-12 px-4"
                    >
                        <Bell class="w-12 h-12 text-muted-foreground mb-3" />
                        <h4 class="text-lg font-medium text-foreground mb-1">
                            No notifications
                        </h4>
                        <p class="text-sm text-muted-foreground text-center">
                            When you get notifications, they'll appear here
                        </p>
                    </div>
                {:else}
                    <div class="divide-y divide-border">
                        {#each notifications as notification (notification.id)}
                            <div
                                class="p-4 hover:bg-muted/20 transition-colors {!notification.read
                                    ? 'bg-primary/5 border-l-4 border-l-primary'
                                    : ''}"
                            >
                                <div class="flex items-start gap-3">
                                    <!-- Icon -->
                                    <div class="flex-shrink-0 mt-1">
                                        {#if notification.data?.actorAvatar}
                                            <img
                                                src={notification.data
                                                    .actorAvatar}
                                                alt={notification.data
                                                    .actorName}
                                                class="w-8 h-8 rounded-full object-cover"
                                            />
                                        {:else}
                                            {@const IconComponent =
                                                getNotificationIcon(
                                                    notification.type,
                                                )}
                                            <div
                                                class="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                                            >
                                                <IconComponent
                                                    class="w-4 h-4 {getNotificationColor(
                                                        notification.type,
                                                    )}"
                                                />
                                            </div>
                                        {/if}
                                    </div>

                                    <!-- Content -->
                                    <div class="flex-1 min-w-0">
                                        <div
                                            class="flex items-start justify-between gap-2"
                                        >
                                            <div class="flex-1">
                                                <h4
                                                    class="text-sm font-medium text-foreground mb-1"
                                                >
                                                    {notification.title}
                                                </h4>
                                                <p
                                                    class="text-sm text-muted-foreground mb-2"
                                                >
                                                    {notification.message}
                                                </p>

                                                <!-- Additional data -->
                                                {#if notification.data?.mediaTitle}
                                                    <div
                                                        class="flex items-center gap-2 text-xs text-muted-foreground"
                                                    >
                                                        {#if notification.data.mediaType === "movie"}
                                                            <span
                                                                class="inline-flex items-center gap-1"
                                                            >
                                                                <Clock
                                                                    class="w-3 h-3"
                                                                />
                                                                Movie
                                                            </span>
                                                        {:else}
                                                            <span
                                                                class="inline-flex items-center gap-1"
                                                            >
                                                                <Clock
                                                                    class="w-3 h-3"
                                                                />
                                                                TV Show
                                                            </span>
                                                        {/if}
                                                        {#if notification.data.rating}
                                                            <span
                                                                class="inline-flex items-center gap-1"
                                                            >
                                                                <Star
                                                                    class="w-3 h-3"
                                                                />
                                                                {notification
                                                                    .data
                                                                    .rating}/10
                                                            </span>
                                                        {/if}
                                                    </div>
                                                {/if}

                                                <time
                                                    class="text-xs text-muted-foreground"
                                                >
                                                    {formatDistanceToNow(
                                                        notification.createdAt,
                                                        { addSuffix: true },
                                                    )}
                                                </time>
                                            </div>

                                            <!-- Actions -->
                                            <div
                                                class="flex items-center gap-1"
                                            >
                                                {#if !notification.read}
                                                    <button
                                                        onclick={() =>
                                                            markAsRead(
                                                                notification.id,
                                                            )}
                                                        class="p-1 text-muted-foreground hover:text-primary rounded transition-colors"
                                                        title="Mark as read"
                                                    >
                                                        <Check
                                                            class="w-4 h-4"
                                                        />
                                                    </button>
                                                {/if}
                                                <button
                                                    onclick={() =>
                                                        deleteNotification(
                                                            notification.id,
                                                        )}
                                                    class="p-1 text-muted-foreground hover:text-red-500 rounded transition-colors"
                                                    title="Delete notification"
                                                >
                                                    <Trash2 class="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>

            <!-- Footer -->
            {#if notifications.length > 0}
                <div class="px-4 py-3 border-t border-border bg-muted/20">
                    <a
                        href="/notifications"
                        class="text-sm text-primary hover:text-primary/80 font-medium block text-center"
                    >
                        View all notifications
                    </a>
                </div>
            {/if}
        </div>
    {/if}
</div>
