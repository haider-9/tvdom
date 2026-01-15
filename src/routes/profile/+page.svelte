<script lang="ts">
  import { userStore } from "$lib/stores/user.svelte.js";
  import CurrentlyWatching from "$lib/components/CurrentlyWatching.svelte";
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

  let activeTab = $state<"overview" | "watchlist" | "watched" | "reviews" | "persons">(
    "overview"
  );

  // Helper function to get proper poster URL
  function getPosterUrl(mediaPoster?: string): string {
    if (!mediaPoster) return '';
    
    // If it's already a full URL, return as-is
    if (mediaPoster.startsWith('http')) {
      return mediaPoster;
    }
    
    // If it starts with '/', it's a TMDB path, construct the full URL
    if (mediaPoster.startsWith('/')) {
      return `https://image.tmdb.org/t/p/w500${mediaPoster}`;
    }
    
    // Otherwise, assume it's a path without leading slash
    return `https://image.tmdb.org/t/p/w500/${mediaPoster}`;
  }
</script>

<svelte:head>
  <title>Profile - TVDom</title>
</svelte:head>

<div class="min-h-screen">
  {#if userStore.isAuthenticated && userStore.user}
    <!-- Cover/Banner Section -->
    <div
      class="relative h-48 md:h-64 bg-gradient-to-r from-primary via-primary/80 to-accent"
    >
      {#if userStore.user.banner}
        <img
          src={userStore.user.banner}
          alt="Profile banner"
          class="w-full h-full object-cover"
        />
        <div class="absolute inset-0 bg-foreground/20"></div>
      {/if}

      <!-- Edit button -->
      <div class="absolute top-4 right-4 flex items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="secondary" size="sm" >
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
              class="w-32 h-32 rounded-2xl overflow-hidden border-4 border-border shadow-lg"
            >
              {#if userStore.user.avatar}
                <img
                  src={userStore.user.avatar}
                  alt="{userStore.user.displayName}'s avatar"
                  class="w-full h-full object-cover"
                />
              {:else}
                <div
                  class="w-full h-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                >
                  <span class="text-primary-foreground text-3xl font-bold">
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
                  class="text-3xl font-bold"
                >
                  {userStore.user.displayName}
                </h1>
                <div
                  class="flex flex-wrap items-center gap-4 text-sm"
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
                  <p class="mt-3 max-w-2xl text-muted-foreground">
                    {userStore.user.bio}
                  </p>
                {/if}
                {#if userStore.user.website}
                  <div class="mt-3">
                    <a
                      href={userStore.user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                    >
                      <Globe class="w-4 h-4" />
                      {userStore.user.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                {/if}
              </div>

              <!-- Follow Stats -->
              <div class="flex items-center gap-6 text-center text-muted-foreground">
                <div>
                  <div class="text-2xl font-bold text-foreground">
                    {userStore.userFollowers.length}
                  </div>
                  <div class="text-sm">
                    Followers
                  </div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-foreground">
                    {userStore.userFollows.length}
                  </div>
                  <div class="text-sm">
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
          <Button
            variant={activeTab === 'persons' ? 'default' : 'ghost'}
            onclick={() => activeTab = 'persons'}
            class="flex items-center gap-2 px-6 py-4 text-sm font-medium rounded-none border-b-2 {activeTab === 'persons' ? 'border-primary' : 'border-transparent'} whitespace-nowrap"
          >
            <Users class="w-4 h-4" />
            Persons ({userStore.userPersonFavorites.length + userStore.userPersonRatings.length})
          </Button>
        </nav>
      </Card.Root>

      <!-- Tab Content -->
      {#if activeTab === "overview"}
        <!-- Overview Tab -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Stats Column -->
          <div class="space-y-6">
            <!-- Currently Watching -->
            <CurrentlyWatching userId={userStore.user?._id || userStore.user?.id} />

            <!-- Quick Stats -->
            <div
              class="bg-card rounded-xl shadow-sm border border-border p-6"
            >
              <h2
                class="text-lg font-semibold mb-4"
              >
                Your Stats
              </h2>
              <div class="space-y-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg">
                      <Film class="w-5 h-5 text-primary" />
                    </div>
                    <span class="text-sm text-muted-foreground"
                      >Movies Watched</span
                    >
                  </div>
                  <span class="text-xl font-bold ">
                    {userStore.userWatched.filter(
                      (item) => item.mediaType === "movie"
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
                    <span class="text-sm text-muted-foreground"
                      >TV Shows Watched</span
                    >
                  </div>
                  <span class="text-xl font-bold ">
                    {userStore.userWatched.filter(
                      (item) => item.mediaType === "tv"
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
                    <span class="text-sm text-muted-foreground"
                      >In Watchlist</span
                    >
                  </div>
                  <span class="text-xl font-bold ">
                    {userStore.userWatchlist.length}
                  </span>
                </div>
              </div>
            </div>

            <!-- Recent Activity -->
            <div
              class="bg-card rounded-xl shadow-sm border border-border p-6"
            >
              <h2
                class="text-lg font-semibold  mb-4"
              >
                Recent Activity
              </h2>
              <div class="space-y-3">
                {#if userStore.userRatings.length > 0}
                  {#each userStore.userRatings.slice(0, 3) as rating}
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
                        <p class="text-xs text-muted-foreground">
                          {rating.rating}/10 • {new Date(
                            rating.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  {/each}
                {:else}
                  <p
                    class="text-sm text-center py-4 text-muted-foreground"
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
              class="bg-card p-6"
            >
              <div class="flex items-center justify-between mb-4">
                <h2 class="text-lg font-semibold ">
                  Recent Watchlist
                </h2>
                <button
                  onclick={() => (activeTab = "watchlist")}
                  class="text-sm font-medium text-primary hover:text-primary/80"
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
                        class="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2"
                      >
                        {#if item.mediaPoster}
                          <img
                            src={getPosterUrl(item.mediaPoster)}
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
                        class="text-sm font-medium  line-clamp-2"
                      >
                        {item.mediaTitle}
                      </h3>
                      <p
                        class="text-xs text-muted-foreground capitalize"
                      >
                        {item.mediaType} • {item.priority} priority
                      </p>
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-center py-8 text-muted-foreground">
                  <Clock class="w-12 h-12 mx-auto mb-3" />
                  <p>
                    Your watchlist is empty
                  </p>
                  <p class="text-sm">
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
          class="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <Watchlist showAddButton={true} />
        </div>
      {:else if activeTab === "watched"}
        <!-- Watched Tab -->
        <div
          class="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <h2 class="text-xl font-semibold  mb-6">
            Watched History
          </h2>
          {#if userStore.userWatched.length > 0}
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {#each userStore.userWatched as item}
                <div class="group cursor-pointer">
                  <div
                    class="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-3"
                  >
                    {#if item.mediaPoster}
                      <img
                        src={getPosterUrl(item.mediaPoster)}
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
                    Watched {new Date(item.watchedAt).toLocaleDateString()}
                  </p>
                  {#if item.rating}
                    <div class="flex items-center gap-1 mt-1">
                      <Star class="w-3 h-3 text-yellow-500 fill-current" />
                      <span class="text-xs text-muted-foreground"
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
                class="text-lg font-semibold  mb-2"
              >
                No watched items yet
              </h3>
              <p class="">
                Items you mark as watched will appear here
              </p>
            </div>
          {/if}
        </div>
      {:else if activeTab === "reviews"}
        <!-- Reviews Tab -->
        <div
          class="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <h2 class="text-xl font-semibold  mb-6">
            Your Reviews
          </h2>
          {#if userStore.userRatings.length > 0}
            <div class="space-y-6">
              {#each userStore.userRatings as rating}
                <div
                  class="border border-border rounded-lg p-4"
                >
                  <div class="flex items-start gap-4">
                    <div class="flex items-center gap-2">
                      <div class="flex items-center gap-1">
                        {#each Array(10) as _, i}
                          <Star
                            class="w-4 h-4 {i < rating.rating
                              ? 'text-accent fill-current'
                              : 'text-muted-foreground/40'}"
                          />
                        {/each}
                      </div>
                      <span
                        class="text-sm font-medium "
                      >
                        {rating.rating}/10
                      </span>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <span
                          class="text-sm  capitalize"
                        >
                          {rating.mediaType}
                        </span>
                        <span class="text-sm text-muted-foreground">•</span>
                        <span class="text-sm text-muted-foreground">
                          {new Date(rating.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {#if rating.review}
                        <p class="text-sm text-muted-foreground">
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
              <h3
                class="text-lg font-semibold  mb-2"
              >
                No reviews yet
              </h3>
              <p>
                Start rating movies and TV shows to see your reviews here
              </p>
            </div>
          {/if}
        </div>
      {:else if activeTab === "persons"}
        <!-- Persons Tab -->
        <div
          class="bg-card rounded-xl shadow-sm border border-border p-6"
        >
          <h2 class="text-xl font-semibold mb-6">
            People You Follow
          </h2>
          
          <!-- Person Favorites Section -->
          {#if userStore.userPersonFavorites.length > 0}
            <div class="mb-8">
              <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
                <Heart class="w-5 h-5 text-red-500" />
                Favorite People ({userStore.userPersonFavorites.length})
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {#each userStore.userPersonFavorites as favorite}
                  <a href="/person/{favorite.personId}" class="group cursor-pointer">
                    <div class="aspect-[2/3] bg-muted rounded-lg overflow-hidden mb-2">
                      {#if favorite.personImage}
                        <img
                          src="https://image.tmdb.org/t/p/w300{favorite.personImage}"
                          alt="{favorite.personName}"
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      {:else}
                        <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Users class="w-8 h-8" />
                        </div>
                      {/if}
                    </div>
                    <h4 class="text-sm font-medium line-clamp-2 mb-1">
                      {favorite.personName}
                    </h4>
                    {#if favorite.personKnownFor}
                      <p class="text-xs text-muted-foreground">
                        {favorite.personKnownFor}
                      </p>
                    {/if}
                    <p class="text-xs text-muted-foreground">
                      Added {new Date(favorite.addedAt).toLocaleDateString()}
                    </p>
                  </a>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Person Ratings Section -->
          {#if userStore.userPersonRatings.length > 0}
            <div class="mb-8">
              <h3 class="text-lg font-medium mb-4 flex items-center gap-2">
                <Star class="w-5 h-5 text-yellow-500" />
                Rated People ({userStore.userPersonRatings.length})
              </h3>
              <div class="space-y-4">
                {#each userStore.userPersonRatings as rating}
                  <div class="border border-border rounded-lg p-4">
                    <div class="flex items-start gap-4">
                      <a href="/person/{rating.personId}" class="flex-shrink-0">
                        <div class="w-16 h-24 bg-muted rounded-lg overflow-hidden">
                          {#if rating.personImage}
                            <img
                              src="https://image.tmdb.org/t/p/w185{rating.personImage}"
                              alt="{rating.personName}"
                              class="w-full h-full object-cover"
                            />
                          {:else}
                            <div class="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Users class="w-6 h-6" />
                            </div>
                          {/if}
                        </div>
                      </a>
                      <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                          <a href="/person/{rating.personId}" class="text-lg font-medium hover:text-primary">
                            {rating.personName}
                          </a>
                          <div class="flex items-center gap-1">
                            <Star class="w-4 h-4 text-yellow-500 fill-current" />
                            <span class="text-sm font-medium">{rating.rating}/10</span>
                          </div>
                        </div>
                        {#if rating.review}
                          <p class="text-sm text-muted-foreground mb-2">
                            {rating.review}
                          </p>
                        {/if}
                        <p class="text-xs text-muted-foreground">
                          Rated {new Date(rating.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Empty State -->
          {#if userStore.userPersonFavorites.length === 0 && userStore.userPersonRatings.length === 0}
            <div class="text-center py-12 text-muted-foreground">
              <Users class="w-16 h-16 mx-auto mb-4" />
              <h3 class="text-lg font-semibold mb-2">
                No people yet
              </h3>
              <p class="mb-4">
                Start exploring actors, directors, and other people in the entertainment industry
              </p>
              <a
                href="/search"
                class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
              >
                <Users class="w-4 h-4" />
                Discover People
              </a>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <!-- Not authenticated -->
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center text-muted-foreground">
        <User class="w-16 h-16 mx-auto mb-4" />
        <h1 class="text-2xl font-bold mb-4 text-foreground">
          Please sign in to view your profile
        </h1>
        <a
          href="/login"
          class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors"
        >
          Sign In
        </a>
      </div>
    </div>
  {/if}
</div>
