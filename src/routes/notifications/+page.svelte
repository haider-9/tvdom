<script lang="ts">
    import { onMount } from "svelte";
    import {
        Bell,
        Check,
        CheckCheck,
        Trash2,
        Filter,
        User,
        Star,
        Heart,
        Eye,
        Clock,
        Globe,
    } from "lucide-svelte";
    import { Card } from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { notificationStore } from "$lib/stores/notification.svelte.js";
    import { userStore } from "$lib/stores/user.svelte.js";
    import { goto } from "$app/navigation";
    // import { formatDistanceToNow } from "date-fns";

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

    const notifications = $derived(notificationStore.notifications);
    const unreadCount = $derived(notificationStore.unreadCount);
    const isLoading = $derived(notificationStore.isLoading);

    let selectedType = $state<string>("all");
    let showUnreadOnly = $state(false);

    const notificationTypes = [
        { value: "all", label: "All", icon: Bell },
        { value: "follow", label: "Follows", icon: User },
        { value: "rating", label: "Ratings", icon: Star },
        { value: "review", label: "Reviews", icon: Star },
        { value: "system", label: "System", icon: Globe },
        { value: "api_change", label: "Updates", icon: Globe },
    ];

    const filteredNotifications = $derived.by(() => {
        let filtered = notifications;

        if (selectedType !== "all") {
            filtered = filtered.filter((n) => n.type === selectedType);
        }

        if (showUnreadOnly) {
            filtered = filtered.filter((n) => !n.read);
        }

        return filtered;
    });

    function getNotificationIcon(type: string) {
        switch (type) {
            case "follow":
            case "unfollow":
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
                return Globe;
            default:
                return Bell;
        }
    }

    function getNotificationColor(type: string) {
        switch (type) {
            case "follow":
            case "unfollow":
                return "bg-blue-500/10 text-blue-500";
            case "rating":
            case "review":
                return "bg-yellow-500/10 text-yellow-500";
            case "watchlist_add":
                return "bg-red-500/10 text-red-500";
            case "watched_add":
                return "bg-green-500/10 text-green-500";
            case "system":
                return "bg-purple-500/10 text-purple-500";
            case "api_change":
                return "bg-orange-500/10 text-orange-500";
            default:
                return "bg-gray-500/10 text-gray-500";
        }
    }

    function getTypeLabel(type: string) {
        switch (type) {
            case "follow":
                return "New Follower";
            case "unfollow":
                return "Unfollowed";
            case "rating":
                return "New Rating";
            case "review":
                return "New Review";
            case "watchlist_add":
                return "Watchlist";
            case "watched_add":
                return "Watched";
            case "system":
                return "System";
            case "api_change":
                return "Update";
            default:
                return "Notification";
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

    function handleNotificationClick(notification: any) {
        // Mark as read when clicked
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Navigate based on notification type
        switch (notification.type) {
            case "follow":
            case "unfollow":
                if (notification.data?.actorId) {
                    goto(`/user/${notification.data.actorId}`);
                }
                break;
            case "rating":
            case "review":
                if (notification.data?.mediaId) {
                    const mediaType = notification.data.mediaType || "movie";
                    goto(`/${mediaType}/${notification.data.mediaId}`);
                }
                break;
        }
    }

    onMount(() => {
        if (!userStore.isAuthenticated) {
            goto("/login");
            return;
        }

        // Load notifications
        notificationStore.fetchNotifications(true);
    });
</script>

<svelte:head>
    <title>Notifications - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h1 class="text-3xl font-bold text-foreground">
                        Notifications
                    </h1>
                    <p class="text-muted-foreground">
                        {#if unreadCount > 0}
                            You have {unreadCount} unread notification{unreadCount ===
                            1
                                ? ""
                                : "s"}
                        {:else}
                            You're all caught up!
                        {/if}
                    </p>
                </div>

                {#if unreadCount > 0}
                    <Button
                        onclick={markAllAsRead}
                        variant="outline"
                        class="gap-2"
                    >
                        <CheckCheck class="w-4 h-4" />
                        Mark all as read
                    </Button>
                {/if}
            </div>

            <!-- Filters -->
            <Card class="p-4">
                <div class="flex flex-wrap items-center gap-4">
                    <!-- Type Filter -->
                    <div class="flex items-center gap-2">
                        <Filter class="w-4 h-4 text-muted-foreground" />
                        <span class="text-sm font-medium text-foreground"
                            >Filter by:</span
                        >
                        <div class="flex flex-wrap gap-2">
                            {#each notificationTypes as type}
                                {@const IconComponent = type.icon}
                                <Button
                                    variant={selectedType === type.value
                                        ? "default"
                                        : "outline"}
                                    size="sm"
                                    onclick={() => (selectedType = type.value)}
                                    class="gap-1"
                                >
                                    <IconComponent class="w-3 h-3" />
                                    {type.label}
                                </Button>
                            {/each}
                        </div>
                    </div>

                    <!-- Unread Only Toggle -->
                    <div class="flex items-center gap-2 ml-auto">
                        <Button
                            variant={showUnreadOnly ? "default" : "outline"}
                            size="sm"
                            onclick={() => (showUnreadOnly = !showUnreadOnly)}
                            class="gap-2"
                        >
                            <Bell class="w-3 h-3" />
                            Unread only
                        </Button>
                    </div>
                </div>
            </Card>
        </div>

        <!-- Notifications List -->
        {#if isLoading && notifications.length === 0}
            <div class="flex items-center justify-center py-12">
                <div class="text-center">
                    <div
                        class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"
                    ></div>
                    <p class="text-muted-foreground">
                        Loading notifications...
                    </p>
                </div>
            </div>
        {:else if filteredNotifications.length === 0}
            <Card class="p-12 text-center">
                <Bell class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 class="text-2xl font-bold mb-2 text-foreground">
                    {notifications.length === 0
                        ? "No notifications yet"
                        : "No matching notifications"}
                </h2>
                <p class="text-muted-foreground">
                    {notifications.length === 0
                        ? "When you get notifications, they'll appear here"
                        : "Try adjusting your filters to see more notifications"}
                </p>
            </Card>
        {:else}
            <div class="space-y-4">
                {#each filteredNotifications as notification (notification.id)}
                    <Card
                        class="p-4 transition-all duration-200 hover:shadow-md cursor-pointer {!notification.read
                            ? 'border-l-4 border-l-primary bg-primary/5'
                            : ''}"
                        onclick={() => handleNotificationClick(notification)}
                    >
                        <div class="flex items-start gap-4">
                            <!-- Icon/Avatar -->
                            <div class="flex-shrink-0 mt-1">
                                {#if notification.data?.actorAvatar}
                                    <div class="relative">
                                        <img
                                            src={notification.data.actorAvatar}
                                            alt={notification.data.actorName}
                                            class="w-12 h-12 rounded-full object-cover"
                                        />
                                        {#if !notification.read}
                                            <div
                                                class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                                            ></div>
                                        {/if}
                                    </div>
                                {:else}
                                    {@const IconComponent = getNotificationIcon(
                                        notification.type,
                                    )}
                                    <div
                                        class="relative w-12 h-12 rounded-full {getNotificationColor(
                                            notification.type,
                                        )} flex items-center justify-center"
                                    >
                                        <IconComponent class="w-6 h-6" />
                                        {#if !notification.read}
                                            <div
                                                class="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"
                                            ></div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>

                            <!-- Content -->
                            <div class="flex-1 min-w-0">
                                <div
                                    class="flex items-start justify-between gap-4"
                                >
                                    <div class="flex-1">
                                        <!-- Title and Type Badge -->
                                        <div
                                            class="flex items-center gap-2 mb-2"
                                        >
                                            <h3
                                                class="font-semibold text-foreground {!notification.read
                                                    ? 'font-bold'
                                                    : ''}"
                                            >
                                                {notification.title}
                                            </h3>
                                            <Badge
                                                variant="secondary"
                                                class="text-xs"
                                            >
                                                {getTypeLabel(
                                                    notification.type,
                                                )}
                                            </Badge>
                                            {#if !notification.read}
                                                <div
                                                    class="w-2 h-2 bg-primary rounded-full"
                                                ></div>
                                            {/if}
                                        </div>

                                        <!-- Message -->
                                        <p
                                            class="text-sm text-muted-foreground mb-3 {!notification.read
                                                ? 'font-medium text-foreground/80'
                                                : ''}"
                                        >
                                            {notification.message}
                                        </p>

                                        <!-- Additional Data -->
                                        {#if notification.data?.mediaTitle}
                                            <div
                                                class="flex items-center gap-4 text-xs text-muted-foreground mb-2"
                                            >
                                                <div
                                                    class="flex items-center gap-1"
                                                >
                                                    {#if notification.data.mediaType === "movie"}
                                                        <Clock
                                                            class="w-3 h-3"
                                                        />
                                                        <span>Movie</span>
                                                    {:else}
                                                        <Clock
                                                            class="w-3 h-3"
                                                        />
                                                        <span>TV Show</span>
                                                    {/if}
                                                </div>
                                                <span class="font-medium"
                                                    >"{notification.data
                                                        .mediaTitle}"</span
                                                >
                                                {#if notification.data.rating}
                                                    <div
                                                        class="flex items-center gap-1"
                                                    >
                                                        <Star class="w-3 h-3" />
                                                        <span
                                                            >{notification.data
                                                                .rating}/10</span
                                                        >
                                                    </div>
                                                {/if}
                                            </div>
                                        {/if}

                                        <!-- Timestamp -->
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
                                    <div class="flex items-center gap-1">
                                        {#if !notification.read}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onclick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notification.id);
                                                }}
                                                class="h-8 w-8 p-0"
                                                title="Mark as read"
                                            >
                                                <Check class="w-4 h-4" />
                                            </Button>
                                        {/if}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onclick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(
                                                    notification.id,
                                                );
                                            }}
                                            class="h-8 w-8 p-0 text-muted-foreground hover:text-red-500"
                                            title="Delete notification"
                                        >
                                            <Trash2 class="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                {/each}
            </div>
        {/if}

        <!-- Load More Button (if needed) -->
        {#if filteredNotifications.length >= 20}
            <div class="mt-8 text-center">
                <Button
                    variant="outline"
                    onclick={() => notificationStore.fetchNotifications()}
                    disabled={isLoading}
                >
                    {#if isLoading}
                        <div
                            class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"
                        ></div>
                    {/if}
                    Load more notifications
                </Button>
            </div>
        {/if}
    </div>
</div>
