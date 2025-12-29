<script lang="ts">
  import { userStore } from "$lib/stores/user.svelte.js";
  import {
    User,
    Mail,
    Calendar,
    Settings,
    Film,
    Tv,
    Star,
    MapPin,
    Globe,
    Edit3,
    Users,
    Heart,
    Clock,
    TrendingUp,
    MoreVertical,
  } from "lucide-svelte";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Card from "$lib/components/ui/card";
  import Watchlist from "$lib/components/user/Watchlist.svelte";

  // Redirect if not authenticated
  if (!userStore.isAuthenticated) {
    if (typeof window !== "undefined") {
      import('$app/navigation').then(({ goto }) => goto('/login'));
    }
  }

  let activeTab = $state<"overview" | "watchlist" | "watched" | "reviews">(
    "overview"
  );
</script>

<svelte:head>
  <title>Profile - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900">
  {#if userStore.isAuthenticated && userStore.user}
    <!-- Cover/Banner Section -->
    <div
      class="relative h-48 md:h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"
    >
      {#if userStore.user.banner}
        <img
          src={userStore.user.banner}
          alt="Profile banner"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-black/20"></div>
      {/if}

      <!-- Edit button -->
      <div class="absolute top-4 right-4 flex items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="secondary" size="sm" class="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20">
              <MoreVertical class="w-4 h-4" />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content class="w-48">
            <DropdownMenu.Item>
              {#snippet children()}
                <a href="/profile/edit" class="flex items-center gap-2 w-full">
                  <Edit3 class="w-4 h-4" />
                  Edit Profile
                </a>
              {/snippet}
            </DropdownMenu.Item>
            <DropdownMenu.Item>
              {#snippet children()}
                <a href="/settings" class="flex items-center gap-2 w-full">
                  <Settings class="w-4 h-4" />
                  Settings
                </a>
              {/snippet}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        
        <Button variant="default" size="sm" >
          <a href="/profile/edit" class="flex items-center gap-2">
            <Edit3 class="w-4 h-4" />
            <span class="hidden sm:inline">Edit Profile</span>
          </a>
        </Button>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
      <!-- Profile Header -->
      <Card.Root class="p-6 mb-8">
        <div class="flex flex-col md:flex-row md:items-end gap-6">
          <!-- Profile Picture -->
          <div class="flex-shrink-0">
            <div
              class="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg"
            >
              {#if userStore.user.avatar}
                <img
                  src={userStore.user.avatar}
                  alt="{userStore.user.displayName}'s avatar"
                  class="w-full h-full object-cover"
                />
              {:else}
                <div
                  class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <span class="text-white text-3xl font-bold">
                    {userStore.user.displayName?.charAt(0).toUpperCase()}
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
                <h1
                  class="text-3xl font-bold text-gray-900 dark:text-white mb-2"
                >
                  {userStore.user.displayName}
                </h1>
                <div
                  class="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 text-sm"
                >
                  <div class="flex items-center gap-1">
                    <User class="w-4 h-4" />
                    <span>@{userStore.user.username}</span>
                  </div>
                  {#if userStore.user.location}
                    <div class="flex items-center gap-1">
                      <MapPin class="w-4 h-4" />
                      <span>{userStore.user.location}</span>
                    </div>
                  {/if}
                  <div class="flex items-center gap-1">
                    <Calendar class="w-4 h-4" />
                    <span
                      >Joined {new Date(
                        userStore.user.joinedAt
                      ).toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}</span
                    >
                  </div>
                </div>
                {#if userStore.user.bio}
                  <p class="text-gray-700 dark:text-gray-300 mt-3 max-w-2xl">
                    {userStore.user.bio}
                  </p>
                {/if}
                {#if userStore.user.website}
                  <div class="mt-3">
                    <a
                      href={userStore.user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
                    >
                      <Globe class="w-4 h-4" />
                      {userStore.user.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                {/if}
              </div>

              <!-- Follow Stats -->
              <div class="flex items-center gap-6 text-center">
                <div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStore.user.followerCount}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Followers
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-gray-900 dark:text-white">
                    {userStore.user.followingCount}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400">
                    Following
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card.Root>

      <!-- Navigation Tabs -->
      <Card.Root class="mb-8">
        <nav class="flex overflow-x-auto">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onclick={() => activeTab = 'overview'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab === 'overview' ? 'border-primary' : 'border-transparent'} whitespace-nowrap"
          >
            <TrendingUp class="w-4 h-4" />
            Overview
          </Button>
          <Button
            variant={activeTab === 'watchlist' ? 'default' : 'ghost'}
            onclick={() => activeTab = 'watchlist'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab === 'watchlist' ? 'border-primary' : 'border-transparent'} whitespace-nowrap"
          >
            <Clock class="w-4 h-4" />
            Watchlist ({userStore.userWatchlist.length})
          </Button>
          <Button
            variant={activeTab === 'watched' ? 'default' : 'ghost'}
            onclick={() => activeTab = 'watched'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab === 'watched' ? 'border-primary' : 'border-transparent'} whitespace-nowrap"
          >
            <Heart class="w-4 h-4" />
            Watched ({userStore.userWatched.length})
          </Button>
          <Button
            variant={activeTab === 'reviews' ? 'default' : 'ghost'}
            onclick={() => activeTab = 'reviews'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab === 'reviews' ? 'border-primary' : 'border-transparent'} whitespace-nowrap"
          >
            <Star class="w-4 h-4" />
            Reviews ({userStore.userRatings.length})
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
            <div
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                Your Stats
              </h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Film class="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span class="text-gray-700 dark:text-gray-300"
                      >Movies Watched</span
                    >
                  </div>
                  <span class="text-xl font-bold text-gray-900 dark:text-white">
                    {userStore.userWatched.filter(
                      (item) => item.mediaType === "movie"
                    ).length}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"
                    >
                      <Tv
                        class="w-5 h-5 text-purple-600 dark:text-purple-400"
                      />
                    </div>
                    <span class="text-gray-700 dark:text-gray-300"
                      >TV Shows Watched</span
                    >
                  </div>
                  <span class="text-xl font-bold text-gray-900 dark:text-white">
                    {userStore.userWatched.filter(
                      (item) => item.mediaType === "tv"
                    ).length}
                  </span>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div
                      class="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"
                    >
                      <Clock
                        class="w-5 h-5 text-green-600 dark:text-green-400"
                      />
                    </div>
                    <span class="text-gray-700 dark:text-gray-300"
                      >In Watchlist</span
                    >
                  </div>
                  <span class="text-xl font-bold text-gray-900 dark:text-white">
                    {userStore.userWatchlist.length}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <h2
                class="text-lg font-semibold text-gray-900 dark:text-white mb-4"
              >
                Recent Activity
              </h2>
              <div class="space-y-3">
                {#if userStore.userRatings.length > 0}
                  {#each userStore.userRatings.slice(0, 3) as rating}
                    <div
                      class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                    >
                      <div
                        class="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"
                      >
                        <Star
                          class="w-4 h-4 text-yellow-600 dark:text-yellow-400"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Rated a {rating.mediaType}
                        </p>
                        <p class="text-xs text-gray-600 dark:text-gray-400">
                          {rating.rating}/10 • {new Date(
                            rating.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  {/each}
                {:else}
                  <p
                    class="text-gray-600 dark:text-gray-400 text-sm text-center py-4"
                  >
                    No recent activity yet. Start rating some movies and TV
                    shows!
                  </p>
                {/if}
              </div>
            </div>
          </div>

          <!-- Main Content Column -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Recent Watchlist -->
            <div
              class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Watchlist
                </h2>
                <button
                  onclick={() => (activeTab = "watchlist")}
                  class="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                >
                  View All
                </button>
              </div>

              {#if userStore.userWatchlist.length > 0}
                <div
                  class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
                >
                  {#each userStore.userWatchlist.slice(0, 8) as item}
                    <div class="group cursor-pointer">
                      <div
                        class="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-2"
                      >
                        {#if item.mediaPoster}
                          <img
                            src={item.mediaPoster}
                            alt="{item.mediaTitle} poster"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        {:else}
                          <div
                            class="w-full h-full flex items-center justify-center"
                          >
                            {#if item.mediaType === "movie"}
                              <Film class="w-8 h-8 text-gray-400" />
                            {:else}
                              <Tv class="w-8 h-8 text-gray-400" />
                            {/if}
                          </div>
                        {/if}
                      </div>
                      <h3
                        class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2"
                      >
                        {item.mediaTitle}
                      </h3>
                      <p
                        class="text-xs text-gray-600 dark:text-gray-400 capitalize"
                      >
                        {item.mediaType} • {item.priority} priority
                      </p>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-center py-8">
                  <Clock class="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p class="text-gray-600 dark:text-gray-400">
                    Your watchlist is empty
                  </p>
                  <p class="text-sm text-gray-500 dark:text-gray-500">
                    Start adding movies and TV shows you want to watch
                  </p>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {:else if activeTab === "watchlist"}
        <!-- Watchlist Tab -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <Watchlist showAddButton={true} />
        </div>
      {:else if activeTab === "watched"}
        <!-- Watched Tab -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Watched History
          </h2>
          {#if userStore.userWatched.length > 0}
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {#each userStore.userWatched as item}
                <div class="group cursor-pointer">
                  <div
                    class="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-3"
                  >
                    {#if item.mediaPoster}
                      <img
                        src={item.mediaPoster}
                        alt="{item.mediaTitle} poster"
                        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    {:else}
                      <div
                        class="w-full h-full flex items-center justify-center"
                      >
                        {#if item.mediaType === "movie"}
                          <Film class="w-8 h-8 text-gray-400" />
                        {:else}
                          <Tv class="w-8 h-8 text-gray-400" />
                        {/if}
                      </div>
                    {/if}
                  </div>
                  <h3
                    class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1"
                  >
                    {item.mediaTitle}
                  </h3>
                  <p class="text-xs text-gray-600 dark:text-gray-400">
                    Watched {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                  {#if item.rating}
                    <div class="flex items-center gap-1 mt-1">
                      <Star class="w-3 h-3 text-yellow-500 fill-current" />
                      <span class="text-xs text-gray-600 dark:text-gray-400"
                        >{item.rating}/10</span
                      >
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-12">
              <Heart class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
              >
                No watched items yet
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Items you mark as watched will appear here
              </p>
            </div>
          {/if}
        </div>
      {:else if activeTab === "reviews"}
        <!-- Reviews Tab -->
        <div
          class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Your Reviews
          </h2>
          {#if userStore.userRatings.length > 0}
            <div class="space-y-6">
              {#each userStore.userRatings as rating}
                <div
                  class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div class="flex items-start gap-4">
                    <div class="flex items-center gap-2">
                      <div class="flex items-center gap-1">
                        {#each Array(10) as _, i}
                          <Star
                            class="w-4 h-4 {i < rating.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300 dark:text-gray-600'}"
                          />
                        {/each}
                      </div>
                      <span
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {rating.rating}/10
                      </span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span
                          class="text-sm text-gray-600 dark:text-gray-400 capitalize"
                        >
                          {rating.mediaType}
                        </span>
                        <span class="text-sm text-gray-400">•</span>
                        <span class="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {#if rating.review}
                        <p class="text-gray-700 dark:text-gray-300 text-sm">
                          {rating.review}
                        </p>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-12">
              <Star class="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3
                class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
              >
                No reviews yet
              </h3>
              <p class="text-gray-600 dark:text-gray-400">
                Start rating movies and TV shows to see your reviews here
              </p>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Not authenticated -->
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <User class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Please sign in to view your profile
        </h1>
        <a
          href="/login"
          class="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Sign In
        </a>
      </div>
    </div>
  {/if}
</div>
