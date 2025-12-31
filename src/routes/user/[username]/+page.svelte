<script lang="ts">
    import { userStore } from "$lib/stores/user.svelte.js";
    import { onMount } from "svelte";
    import {
        User,
        Calendar,
        Film,
        Tv,
        Star,
        MapPin,
        Globe,
        Users,
        Heart,
        Clock,
        TrendingUp,
        Lock,
        Eye,
    } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import * as Card from "$lib/components/ui/card";
    import { toast } from "svelte-sonner";
    import { goto } from "$app/navigation";
    import type { PageData } from "./$types";

    let { data }: { data: PageData } = $props();

    const {
        user,
        isPrivate,
        isFollowing: initialFollowStatus,
        ratings,
        watchlist,
        watched,
        personRatings,
        personFavorites,
    } = data;

    let activeTab = $state<
        "overview" | "watchlist" | "watched" | "reviews" | "persons" | "follows"
    >("overview");

    // Helper function to get proper poster URL
    function getPosterUrl(mediaPoster?: string): string {
        if (!mediaPoster) return "";

        // If it's already a full URL, return as-is
        if (mediaPoster.startsWith("http")) {
            return mediaPoster;
        }

        // If it starts with '/', it's a TMDB path, construct the full URL
        if (mediaPoster.startsWith("/")) {
            return `https://image.tmdb.org/t/p/w500${mediaPoster}`;
        }

        // Otherwise, assume it's a path without leading slash
        return `https://image.tmdb.org/t/p/w500/${mediaPoster}`;
    }

    // Check if this is the current user's profile
    const isOwnProfile = $derived(
        userStore.isAuthenticated && userStore.user?.username === user.username,
    );

    // Follow state
    let isFollowing = $state(initialFollowStatus || false);
    let followLoading = $state(false);
    let followerCount = $state(user.followerCount || 0);
    let followStatusChecked = $state(false);
    let followersData = $state<any[]>([]);
    let followingData = $state<any[]>([]);
    let followDataLoading = $state(false);

    // Debug initial follow status
    console.log("Initial follow status:", {
        initialFollowStatus,
        isFollowing,
        userFollowerCount: user.followerCount,
        profileUserId: user._id,
    });

    async function toggleFollow() {
        if (!userStore.isAuthenticated) {
            toast.error("Please sign in to follow users");
            return;
        }

        if (!userStore.user) {
            toast.error("Please wait for authentication to complete");
            return;
        }

        console.log("Toggle follow clicked:", {
            currentState: isFollowing,
            currentUserId: userStore.user.id || userStore.user._id,
            targetUserId: user._id,
            targetUsername: user.username,
        });

        followLoading = true;
        const originalState = isFollowing;

        try {
            if (isFollowing) {
                console.log("Attempting to unfollow...");
                await userStore.unfollowUser(user._id);

                isFollowing = false;
                followerCount = Math.max(0, followerCount - 1);

                toast.success(`Unfollowed ${user.displayName}`);
            } else {
                console.log("Attempting to follow...");
                await userStore.followUser(user._id);

                isFollowing = true;
                followerCount = followerCount + 1;

                toast.success(`Now following ${user.displayName}!`);
            }

            console.log("Follow action completed:", {
                newState: isFollowing,
                newFollowerCount: followerCount,
            });
        } catch (error) {
            console.error("Error toggling follow:", error);

            // Revert state on error
            isFollowing = originalState;

            toast.error(
                `Failed to ${originalState ? "unfollow" : "follow"} ${user.displayName}. Please try again.`,
            );
        } finally {
            followLoading = false;
        }
    }

    // Check follow status on mount if user is authenticated
    onMount(async () => {
        console.log("Profile page mount:", {
            isAuthenticated: userStore.isAuthenticated,
            currentUser: userStore.user?.username,
            currentUserId: userStore.user?.id || userStore.user?._id,
            profileUser: user.username,
            profileUserId: user._id,
            isOwnProfile,
            initialFollowStatus,
        });

        // Wait for user store to initialize
        let retries = 0;
        while (!userStore.initialized && retries < 50) {
            await new Promise((resolve) => setTimeout(resolve, 50));
            retries++;
        }

        if (!userStore.initialized) {
            console.warn("User store failed to initialize after 2.5 seconds");
            followStatusChecked = true;
            return;
        }

        if (
            userStore.isAuthenticated &&
            !isOwnProfile &&
            !followStatusChecked
        ) {
            try {
                console.log(
                    `Checking if following ${user.username} (${user._id})`,
                );

                // Force a fresh check from the server
                const actualFollowStatus = await userStore.checkIfFollowing(
                    user._id,
                );
                console.log(`Follow status result: ${actualFollowStatus}`);

                isFollowing = actualFollowStatus;
                followStatusChecked = true;

                console.log("Follow status updated:", {
                    isFollowing,
                    followStatusChecked,
                });
            } catch (error) {
                console.error("Failed to check follow status:", error);
                followStatusChecked = true;
            }
        } else {
            followStatusChecked = true;
            console.log("Skipping follow check:", {
                reason: !userStore.isAuthenticated
                    ? "not authenticated"
                    : isOwnProfile
                      ? "own profile"
                      : "already checked",
            });
        }
    });

    // Function to load follow data
    async function loadFollowData() {
        if (followDataLoading) return; // Prevent multiple simultaneous calls
        
        followDataLoading = true;
        try {
            const [followersResp, followingResp] = await Promise.all([
                fetch(`/api/follows?userId=${user._id}&type=followers`),
                fetch(`/api/follows?userId=${user._id}&type=following`),
            ]);

            if (followersResp.ok) {
                const followersResponse = await followersResp.json();
                followersData = followersResponse.follows || [];
            }

            if (followingResp.ok) {
                const followingResponse = await followingResp.json();
                followingData = followingResponse.follows || [];
            }
        } catch (error) {
            console.error("Failed to load follow data:", error);
        } finally {
            followDataLoading = false;
        }
    }

    // Track if we've loaded follow data to prevent infinite loops
    let followDataLoaded = $state(false);

    // Watch for tab changes to load follow data (only once)
    $effect(() => {
        if (activeTab === "follows" && !followDataLoaded && !followDataLoading) {
            followDataLoaded = true;
            loadFollowData();
        }
    });
</script>

<svelte:head>
    <title>{user.displayName} (@{user.username}) - TVDom</title>
</svelte:head>

<div class="min-h-screen">
    <!-- Cover/Banner Section -->
    <div
        class="relative h-48 md:h-64 bg-gradient-to-r from-primary via-primary/80 to-accent"
    >
        {#if user.banner}
            <img
                src={user.banner}
                alt="{user.displayName}'s banner"
                class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-foreground/20"></div>
        {/if}
    </div>

    <div class="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <!-- Profile Header -->
        <Card.Root class="p-6 mb-8">
            <div class="flex flex-col md:flex-row md:items-end gap-6">
                <!-- Profile Picture -->
                <div class="flex-shrink-0">
                    <div
                        class="w-32 h-32 rounded-2xl overflow-hidden border-4 border-border shadow-lg"
                    >
                        {#if user.avatar}
                            <img
                                src={user.avatar}
                                alt="{user.displayName}'s avatar"
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            <div
                                class="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                            >
                                <span
                                    class="text-primary-foreground text-3xl font-bold"
                                >
                                    {user.displayName?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        {/if}
                    </div>
                </div>

                <!-- Profile Info -->
                <div class="flex-1 min-w-0">
                    <div
                        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    >
                        <div>
                            <div class="flex items-center gap-3 mb-2">
                                <h1 class="text-3xl font-bold">
                                    {user.displayName}
                                </h1>
                                {#if isPrivate}
                                    <Lock
                                        class="w-5 h-5 text-muted-foreground"
                                    />
                                {/if}
                            </div>
                            <div
                                class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
                            >
                                <div class="flex items-center gap-1">
                                    <User class="w-4 h-4" />
                                    <span>@{user.username}</span>
                                </div>
                                {#if user.location}
                                    <div class="flex items-center gap-1">
                                        <MapPin class="w-4 h-4" />
                                        <span>{user.location}</span>
                                    </div>
                                {/if}
                                <div class="flex items-center gap-1">
                                    <Calendar class="w-4 h-4" />
                                    <span
                                        >Joined {new Date(
                                            user.joinedAt,
                                        ).toLocaleDateString("en-US", {
                                            month: "long",
                                            year: "numeric",
                                        })}</span
                                    >
                                </div>
                            </div>
                            {#if user.bio && !isPrivate}
                                <p class="mt-3 max-w-2xl text-muted-foreground">
                                    {user.bio}
                                </p>
                            {/if}
                            {#if user.website && !isPrivate}
                                <div class="mt-3">
                                    <a
                                        href={user.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                                    >
                                        <Globe class="w-4 h-4" />
                                        {user.website.replace(
                                            /^https?:\/\//,
                                            "",
                                        )}
                                    </a>
                                </div>
                            {/if}
                        </div>

                        <!-- Follow Stats -->
                        <div class="flex items-center gap-6 text-center">
                            <div>
                                <div class="text-2xl font-bold text-foreground">
                                    {followerCount}
                                </div>
                                <div class="text-sm text-muted-foreground">
                                    Followers
                                </div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold text-foreground">
                                    {user.followingCount || 0}
                                </div>
                                <div class="text-sm text-muted-foreground">
                                    Following
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            {#if !isOwnProfile && userStore.isAuthenticated && userStore.initialized && followStatusChecked}
                <div class="mt-6 pt-6 border-t border-border">
                    <div class="flex gap-3">
                        <Button
                            onclick={toggleFollow}
                            variant={isFollowing ? "outline" : "default"}
                            class="gap-2"
                            disabled={followLoading || !followStatusChecked}
                        >
                            <Users class="w-4 h-4" />
                            {#if followLoading}
                                <div
                                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"
                                ></div>
                                {isFollowing
                                    ? "Unfollowing..."
                                    : "Following..."}
                            {:else if isFollowing}
                                Following
                            {:else}
                                Follow
                            {/if}
                        </Button>
                        <Button variant="outline" class="gap-2">
                            <Eye class="w-4 h-4" />
                            View Activity
                        </Button>
                    </div>
                    <!-- Debug info (remove in production) -->
                    {#if followStatusChecked}
                        <div class="mt-2 text-xs text-muted-foreground">
                            Status: {isFollowing
                                ? "Following"
                                : "Not following"} • User ID: {userStore.user
                                ?.id || userStore.user?._id} • Target: {user._id}
                        </div>
                    {/if}
                </div>
            {:else if !isOwnProfile && userStore.isAuthenticated && userStore.initialized && !followStatusChecked}
                <div class="mt-6 pt-6 border-t border-border">
                    <div class="flex gap-3">
                        <Button variant="outline" class="gap-2" disabled>
                            <div
                                class="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1"
                            ></div>
                            Loading...
                        </Button>
                    </div>
                </div>
            {:else if !isOwnProfile && !userStore.isAuthenticated}
                <div class="mt-6 pt-6 border-t border-border">
                    <div class="flex gap-3">
                        <Button
                            variant="outline"
                            class="gap-2"
                            onclick={() => goto("/login")}
                        >
                            <Users class="w-4 h-4" />
                            Sign in to Follow
                        </Button>
                    </div>
                </div>
            {/if}
        </Card.Root>

        {#if isPrivate}
            <!-- Private Profile Message -->
            <Card.Root class="p-12 text-center">
                <Lock class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 class="text-2xl font-bold mb-2">This profile is private</h2>
                <p class="text-muted-foreground">
                    {user.displayName} has chosen to keep their activity private.
                </p>
            </Card.Root>
        {:else}
            <!-- Navigation Tabs -->
            <Card.Root class="mb-8">
                <nav class="flex overflow-x-auto">
                    <Button
                        variant={activeTab === "overview" ? "default" : "ghost"}
                        onclick={() => (activeTab = "overview")}
                        class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab ===
                        'overview'
                            ? 'border-primary'
                            : 'border-transparent'} whitespace-nowrap"
                    >
                        <TrendingUp class="w-4 h-4" />
                        Overview
                    </Button>
                    <Button
                        variant={activeTab === "watchlist"
                            ? "default"
                            : "ghost"}
                        onclick={() => (activeTab = "watchlist")}
                        class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab ===
                        'watchlist'
                            ? 'border-primary'
                            : 'border-transparent'} whitespace-nowrap"
                    >
                        <Clock class="w-4 h-4" />
                        Watchlist ({watchlist.length})
                    </Button>
                    <Button
                        variant={activeTab === "watched" ? "default" : "ghost"}
                        onclick={() => (activeTab = "watched")}
                        class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab ===
                        'watched'
                            ? 'border-primary'
                            : 'border-transparent'} whitespace-nowrap"
                    >
                        <Heart class="w-4 h-4" />
                        Watched ({watched.length})
                    </Button>
                    <Button
                        variant={activeTab === "reviews" ? "default" : "ghost"}
                        onclick={() => (activeTab = "reviews")}
                        class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab ===
                        'reviews'
                            ? 'border-primary'
                            : 'border-transparent'} whitespace-nowrap"
                    >
                        <Star class="w-4 h-4" />
                        Reviews ({ratings.length})
                    </Button>
                    <Button
                        variant={activeTab === "persons" ? "default" : "ghost"}
                        onclick={() => (activeTab = "persons")}
                        class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab ===
                        'persons'
                            ? 'border-primary'
                            : 'border-transparent'} whitespace-nowrap"
                    >
                        <Users class="w-4 h-4" />
                        People ({personFavorites.length + personRatings.length})
                    </Button>
                    <Button
                        variant={activeTab === "follows" ? "default" : "ghost"}
                        onclick={() => (activeTab = "follows")}
                        class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab ===
                        'follows'
                            ? 'border-primary'
                            : 'border-transparent'} whitespace-nowrap"
                    >
                        <Users class="w-4 h-4" />
                        Follows ({user.followingCount + user.followerCount})
                    </Button>
                </nav>
            </Card.Root>

            <!-- Tab Content -->
            {#if activeTab === "overview"}
                <!-- Overview Tab -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Stats Column -->
                    <div class="space-y-6">
                        <!-- Quick Stats -->
                        <Card.Root class="p-6">
                            <h2 class="text-lg font-semibold mb-4">
                                {user.displayName}'s Stats
                            </h2>
                            <div class="space-y-4">
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="p-2 bg-primary/10 rounded-lg"
                                        >
                                            <Film
                                                class="w-5 h-5 text-primary"
                                            />
                                        </div>
                                        <span
                                            class="text-sm text-muted-foreground"
                                            >Movies Watched</span
                                        >
                                    </div>
                                    <span class="text-xl font-bold">
                                        {watched.filter(
                                            (item) =>
                                                item.mediaType === "movie",
                                        ).length}
                                    </span>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="p-2 bg-secondary/10 rounded-lg"
                                        >
                                            <Tv
                                                class="w-5 h-5 text-secondary"
                                            />
                                        </div>
                                        <span
                                            class="text-sm text-muted-foreground"
                                            >TV Shows Watched</span
                                        >
                                    </div>
                                    <span class="text-xl font-bold">
                                        {watched.filter(
                                            (item) => item.mediaType === "tv",
                                        ).length}
                                    </span>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="p-2 bg-accent/10 rounded-lg"
                                        >
                                            <Clock
                                                class="w-5 h-5 text-accent"
                                            />
                                        </div>
                                        <span
                                            class="text-sm text-muted-foreground"
                                            >In Watchlist</span
                                        >
                                    </div>
                                    <span class="text-xl font-bold">
                                        {watchlist.length}
                                    </span>
                                </div>

                                <div class="flex items-center justify-between">
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="p-2 bg-yellow-500/10 rounded-lg"
                                        >
                                            <Star
                                                class="w-5 h-5 text-yellow-500"
                                            />
                                        </div>
                                        <span
                                            class="text-sm text-muted-foreground"
                                            >Reviews</span
                                        >
                                    </div>
                                    <span class="text-xl font-bold">
                                        {ratings.length}
                                    </span>
                                </div>
                            </div>
                        </Card.Root>

                        <!-- Recent Activity -->
                        <Card.Root class="p-6">
                            <h2 class="text-lg font-semibold mb-4">
                                Recent Activity
                            </h2>
                            <div class="space-y-3">
                                {#if ratings.length > 0}
                                    {#each ratings.slice(0, 3) as rating}
                                        <div
                                            class="flex items-center gap-3 p-3 bg-muted rounded-lg"
                                        >
                                            <div
                                                class="p-2 bg-accent/10 rounded-lg"
                                            >
                                                <Star
                                                    class="w-4 h-4 text-accent"
                                                />
                                            </div>
                                            <div class="flex-1 min-w-0">
                                                <p
                                                    class="text-sm font-medium text-foreground"
                                                >
                                                    Rated a {rating.mediaType}
                                                </p>
                                                <p
                                                    class="text-xs text-muted-foreground"
                                                >
                                                    {rating.rating}/10 • {new Date(
                                                        rating.createdAt,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    {/each}
                                {:else}
                                    <p
                                        class="text-sm text-center py-4 text-muted-foreground"
                                    >
                                        No recent activity yet.
                                    </p>
                                {/if}
                            </div>
                        </Card.Root>
                    </div>

                    <!-- Main Content Column -->
                    <div class="lg:col-span-2 space-y-6">
                        <!-- Recent Watchlist -->
                        <Card.Root class="p-6">
                            <div class="flex items-center justify-between mb-4">
                                <h2 class="text-lg font-semibold">
                                    Recent Watchlist
                                </h2>
                                <button
                                    onclick={() => (activeTab = "watchlist")}
                                    class="text-sm font-medium text-primary hover:text-primary/80"
                                >
                                    View All
                                </button>
                            </div>

                            {#if watchlist.length > 0}
                                <div
                                    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                                >
                                    {#each watchlist.slice(0, 8) as item}
                                        <div class="group cursor-pointer">
                                            <div
                                                class="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2"
                                            >
                                                {#if item.mediaPoster}
                                                    <img
                                                        src={getPosterUrl(
                                                            item.mediaPoster,
                                                        )}
                                                        alt="{item.mediaTitle} poster"
                                                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                    />
                                                {:else}
                                                    <div
                                                        class="w-full h-full flex items-center justify-center text-muted-foreground"
                                                    >
                                                        {#if item.mediaType === "movie"}
                                                            <Film
                                                                class="w-8 h-8"
                                                            />
                                                        {:else}
                                                            <Tv
                                                                class="w-8 h-8"
                                                            />
                                                        {/if}
                                                    </div>
                                                {/if}
                                            </div>
                                            <h3
                                                class="text-sm font-medium line-clamp-2"
                                            >
                                                {item.mediaTitle}
                                            </h3>
                                            <p
                                                class="text-xs text-muted-foreground capitalize"
                                            >
                                                {item.mediaType} • {item.priority}
                                                priority
                                            </p>
                                        </div>
                                    {/each}
                                </div>
                            {:else}
                                <div
                                    class="text-center py-8 text-muted-foreground"
                                >
                                    <Clock class="w-12 h-12 mx-auto mb-3" />
                                    <p>No watchlist items yet</p>
                                </div>
                            {/if}
                        </Card.Root>
                    </div>
                </div>
            {:else if activeTab === "watchlist"}
                <!-- Watchlist Tab -->
                <Card.Root class="p-6">
                    <h2 class="text-xl font-semibold mb-6">Watchlist</h2>
                    {#if watchlist.length > 0}
                        <div
                            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                        >
                            {#each watchlist as item}
                                <div class="group cursor-pointer">
                                    <div
                                        class="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-3"
                                    >
                                        {#if item.mediaPoster}
                                            <img
                                                src={getPosterUrl(
                                                    item.mediaPoster,
                                                )}
                                                alt="{item.mediaTitle} poster"
                                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        {:else}
                                            <div
                                                class="w-full h-full flex items-center justify-center text-muted-foreground"
                                            >
                                                {#if item.mediaType === "movie"}
                                                    <Film class="w-8 h-8" />
                                                {:else}
                                                    <Tv class="w-8 h-8" />
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                    <h3
                                        class="text-sm font-medium line-clamp-2 mb-1"
                                    >
                                        {item.mediaTitle}
                                    </h3>
                                    <p class="text-xs text-muted-foreground">
                                        Added {new Date(
                                            item.addedAt,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-center py-12">
                            <Clock
                                class="w-16 h-16 text-muted-foreground mx-auto mb-4"
                            />
                            <h3 class="text-lg font-semibold mb-2">
                                No watchlist items yet
                            </h3>
                        </div>
                    {/if}
                </Card.Root>
            {:else if activeTab === "watched"}
                <!-- Watched Tab -->
                <Card.Root class="p-6">
                    <h2 class="text-xl font-semibold mb-6">Watched History</h2>
                    {#if watched.length > 0}
                        <div
                            class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
                        >
                            {#each watched as item}
                                <div class="group cursor-pointer">
                                    <div
                                        class="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-3"
                                    >
                                        {#if item.mediaPoster}
                                            <img
                                                src={getPosterUrl(
                                                    item.mediaPoster,
                                                )}
                                                alt="{item.mediaTitle} poster"
                                                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                            />
                                        {:else}
                                            <div
                                                class="w-full h-full flex items-center justify-center text-muted-foreground"
                                            >
                                                {#if item.mediaType === "movie"}
                                                    <Film class="w-8 h-8" />
                                                {:else}
                                                    <Tv class="w-8 h-8" />
                                                {/if}
                                            </div>
                                        {/if}
                                    </div>
                                    <h3
                                        class="text-sm font-medium line-clamp-2 mb-1"
                                    >
                                        {item.mediaTitle}
                                    </h3>
                                    <p class="text-xs text-muted-foreground">
                                        Watched {new Date(
                                            item.watchedAt,
                                        ).toLocaleDateString()}
                                    </p>
                                    {#if item.rating}
                                        <div
                                            class="flex items-center gap-1 mt-1"
                                        >
                                            <Star
                                                class="w-3 h-3 text-yellow-500 fill-current"
                                            />
                                            <span
                                                class="text-xs text-muted-foreground"
                                                >{item.rating}/10</span
                                            >
                                        </div>
                                    {/if}
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-center py-12">
                            <Heart
                                class="w-16 h-16 text-muted-foreground mx-auto mb-4"
                            />
                            <h3 class="text-lg font-semibold mb-2">
                                No watched items yet
                            </h3>
                        </div>
                    {/if}
                </Card.Root>
            {:else if activeTab === "reviews"}
                <!-- Reviews Tab -->
                <Card.Root class="p-6">
                    <h2 class="text-xl font-semibold mb-6">Reviews</h2>
                    {#if ratings.length > 0}
                        <div class="space-y-6">
                            {#each ratings as rating}
                                <div
                                    class="border border-border rounded-lg p-4"
                                >
                                    <div class="flex items-start gap-4">
                                        <div class="flex items-center gap-2">
                                            <div
                                                class="flex items-center gap-1"
                                            >
                                                {#each Array(10) as _, i}
                                                    <Star
                                                        class="w-4 h-4 {i <
                                                        rating.rating
                                                            ? 'text-accent fill-current'
                                                            : 'text-muted-foreground/40'}"
                                                    />
                                                {/each}
                                            </div>
                                            <span class="text-sm font-medium">
                                                {rating.rating}/10
                                            </span>
                                        </div>
                                        <div class="flex-1">
                                            <div
                                                class="flex items-center gap-2 mb-2"
                                            >
                                                <span
                                                    class="text-sm capitalize"
                                                >
                                                    {rating.mediaType}
                                                </span>
                                                <span
                                                    class="text-sm text-muted-foreground"
                                                    >•</span
                                                >
                                                <span
                                                    class="text-sm text-muted-foreground"
                                                >
                                                    {new Date(
                                                        rating.createdAt,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {#if rating.review}
                                                <p
                                                    class="text-sm text-muted-foreground"
                                                >
                                                    {rating.review}
                                                </p>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <div class="text-center py-12 text-muted-foreground">
                            <Star class="w-16 h-16 mx-auto mb-4" />
                            <h3 class="text-lg font-semibold mb-2">
                                No reviews yet
                            </h3>
                        </div>
                    {/if}
                </Card.Root>
            {:else if activeTab === "persons"}
                <!-- Persons Tab -->
                <Card.Root class="p-6">
                    <h2 class="text-xl font-semibold mb-6">People</h2>

                    <!-- Person Favorites Section -->
                    {#if personFavorites.length > 0}
                        <div class="mb-8">
                            <h3
                                class="text-lg font-medium mb-4 flex items-center gap-2"
                            >
                                <Heart class="w-5 h-5 text-red-500" />
                                Favorite People ({personFavorites.length})
                            </h3>
                            <div
                                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
                            >
                                {#each personFavorites as favorite}
                                    <a
                                        href="/person/{favorite.personId}"
                                        class="group cursor-pointer"
                                    >
                                        <div
                                            class="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2"
                                        >
                                            {#if favorite.personImage}
                                                <img
                                                    src="https://image.tmdb.org/t/p/w300{favorite.personImage}"
                                                    alt={favorite.personName}
                                                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                />
                                            {:else}
                                                <div
                                                    class="w-full h-full flex items-center justify-center text-muted-foreground"
                                                >
                                                    <Users class="w-8 h-8" />
                                                </div>
                                            {/if}
                                        </div>
                                        <h4
                                            class="text-sm font-medium line-clamp-2 mb-1"
                                        >
                                            {favorite.personName}
                                        </h4>
                                        {#if favorite.personKnownFor}
                                            <p
                                                class="text-xs text-muted-foreground"
                                            >
                                                {favorite.personKnownFor}
                                            </p>
                                        {/if}
                                    </a>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Person Ratings Section -->
                    {#if personRatings.length > 0}
                        <div class="mb-8">
                            <h3
                                class="text-lg font-medium mb-4 flex items-center gap-2"
                            >
                                <Star class="w-5 h-5 text-yellow-500" />
                                Rated People ({personRatings.length})
                            </h3>
                            <div class="space-y-4">
                                {#each personRatings as rating}
                                    <div
                                        class="border border-border rounded-lg p-4"
                                    >
                                        <div class="flex items-start gap-4">
                                            <a
                                                href="/person/{rating.personId}"
                                                class="flex-shrink-0"
                                            >
                                                <div
                                                    class="w-16 h-24 bg-muted rounded-lg overflow-hidden"
                                                >
                                                    {#if rating.personImage}
                                                        <img
                                                            src="https://image.tmdb.org/t/p/w185{rating.personImage}"
                                                            alt={rating.personName}
                                                            class="w-full h-full object-cover"
                                                        />
                                                    {:else}
                                                        <div
                                                            class="w-full h-full flex items-center justify-center text-muted-foreground"
                                                        >
                                                            <Users
                                                                class="w-6 h-6"
                                                            />
                                                        </div>
                                                    {/if}
                                                </div>
                                            </a>
                                            <div class="flex-1">
                                                <div
                                                    class="flex items-center justify-between mb-2"
                                                >
                                                    <a
                                                        href="/person/{rating.personId}"
                                                        class="text-lg font-medium hover:text-primary"
                                                    >
                                                        {rating.personName}
                                                    </a>
                                                    <div
                                                        class="flex items-center gap-1"
                                                    >
                                                        <Star
                                                            class="w-4 h-4 text-yellow-500 fill-current"
                                                        />
                                                        <span
                                                            class="text-sm font-medium"
                                                            >{rating.rating}/10</span
                                                        >
                                                    </div>
                                                </div>
                                                {#if rating.review}
                                                    <p
                                                        class="text-sm text-muted-foreground mb-2"
                                                    >
                                                        {rating.review}
                                                    </p>
                                                {/if}
                                                <p
                                                    class="text-xs text-muted-foreground"
                                                >
                                                    Rated {new Date(
                                                        rating.createdAt,
                                                    ).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    {/if}

                    <!-- Empty State -->
                    {#if personFavorites.length === 0 && personRatings.length === 0}
                        <div class="text-center py-12 text-muted-foreground">
                            <Users class="w-16 h-16 mx-auto mb-4" />
                            <h3 class="text-lg font-semibold mb-2">
                                No people yet
                            </h3>
                        </div>
                    {/if}
                </Card.Root>
            {:else if activeTab === "follows"}
                <!-- Follows Tab -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Followers -->
                    <Card.Root class="p-6">
                        <h3
                            class="text-lg font-semibold mb-4 flex items-center gap-2"
                        >
                            <Users class="w-5 h-5" />
                            Followers ({followerCount})
                        </h3>
                        {#if followDataLoading}
                            <div class="flex items-center justify-center py-8">
                                <div
                                    class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
                                ></div>
                            </div>
                        {:else if followersData.length > 0}
                            <div class="space-y-3">
                                {#each followersData as follow}
                                    <div
                                        class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div
                                            class="w-10 h-10 rounded-full overflow-hidden bg-muted"
                                        >
                                            {#if follow.followerId.avatar}
                                                <img
                                                    src={follow.followerId
                                                        .avatar}
                                                    alt="{follow.followerId
                                                        .displayName}'s avatar"
                                                    class="w-full h-full object-cover"
                                                />
                                            {:else}
                                                <div
                                                    class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                                                >
                                                    <span
                                                        class="text-white text-sm font-bold"
                                                    >
                                                        {follow.followerId.displayName
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            {/if}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <a
                                                href="/user/{follow.followerId
                                                    .username}"
                                                class="font-medium text-foreground hover:text-primary"
                                            >
                                                {follow.followerId.displayName}
                                            </a>
                                            <p
                                                class="text-sm text-muted-foreground"
                                            >
                                                @{follow.followerId.username}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="text-center py-8 text-muted-foreground">
                                <Users class="w-12 h-12 mx-auto mb-3" />
                                <p>No followers yet</p>
                            </div>
                        {/if}
                    </Card.Root>

                    <!-- Following -->
                    <Card.Root class="p-6">
                        <h3
                            class="text-lg font-semibold mb-4 flex items-center gap-2"
                        >
                            <Eye class="w-5 h-5" />
                            Following ({user.followingCount || 0})
                        </h3>
                        {#if followDataLoading}
                            <div class="flex items-center justify-center py-8">
                                <div
                                    class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"
                                ></div>
                            </div>
                        {:else if followingData.length > 0}
                            <div class="space-y-3">
                                {#each followingData as follow}
                                    <div
                                        class="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                                    >
                                        <div
                                            class="w-10 h-10 rounded-full overflow-hidden bg-muted"
                                        >
                                            {#if follow.followingId.avatar}
                                                <img
                                                    src={follow.followingId
                                                        .avatar}
                                                    alt="{follow.followingId
                                                        .displayName}'s avatar"
                                                    class="w-full h-full object-cover"
                                                />
                                            {:else}
                                                <div
                                                    class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                                                >
                                                    <span
                                                        class="text-white text-sm font-bold"
                                                    >
                                                        {follow.followingId.displayName
                                                            ?.charAt(0)
                                                            .toUpperCase()}
                                                    </span>
                                                </div>
                                            {/if}
                                        </div>
                                        <div class="flex-1 min-w-0">
                                            <a
                                                href="/user/{follow.followingId
                                                    .username}"
                                                class="font-medium text-foreground hover:text-primary"
                                            >
                                                {follow.followingId.displayName}
                                            </a>
                                            <p
                                                class="text-sm text-muted-foreground"
                                            >
                                                @{follow.followingId.username}
                                            </p>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class="text-center py-8 text-muted-foreground">
                                <Eye class="w-12 h-12 mx-auto mb-3" />
                                <p>Not following anyone yet</p>
                            </div>
                        {/if}
                    </Card.Root>
                </div>
            {/if}
        {/if}
    </div>
</div>
