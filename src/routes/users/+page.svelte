<script lang="ts">
  import { Search, Users, Star, Calendar, MapPin, Globe, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { goto } from '$app/navigation';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  let searchQuery = $state(data.query || '');
  let isSearching = $state(false);

  async function handleSearch(e: Event) {
    e.preventDefault();
    const query = searchQuery.trim();
    
    isSearching = true;
    try {
      if (query) {
        await goto(`/users?q=${encodeURIComponent(query)}`);
      } else {
        await goto('/users');
      }
    } finally {
      isSearching = false;
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  }

  function getInitials(name: string) {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
</script>

<svelte:head>
  <title>Users - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 md:px-8 py-10 md:py-14 space-y-10">
    <!-- Page header -->
    <section class="space-y-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Users class="w-4 h-4" />
          <span>Discover users</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Find Other Movie & TV Enthusiasts
        </h1>
        <p class="max-w-xl text-sm md:text-base text-muted-foreground">
          Connect with fellow movie and TV show lovers, discover new recommendations, and see what others are watching.
        </p>
      </div>

      <!-- Search form -->
      <form onsubmit={handleSearch} class="max-w-2xl">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            bind:value={searchQuery}
            placeholder="Search users by username or name..."
            class="pl-10 pr-4 h-12"
            disabled={isSearching}
          />
          <Button
            type="submit"
            class="absolute right-1 top-1/2 -translate-y-1/2 h-10"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </Button>
        </div>
      </form>
    </section>

    <!-- Results -->
    <section class="space-y-6">
      {#if data.error}
        <div class="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 class="text-red-800 font-semibold mb-2">Error loading users</h3>
          <p class="text-red-600 text-sm">{data.error}</p>
        </div>
      {/if}

      {#if data.query}
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Search results for "{data.query}"
          </h2>
          <p class="text-sm text-muted-foreground">
            {data.totalUsers} users found
          </p>
        </div>
      {:else}
        <h2 class="text-xl font-semibold">Popular Users</h2>
      {/if}

      {#if data.users.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {#each data.users as user}
            <Card.Root class="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <Card.Content class="p-6">
                <div class="flex flex-col items-center text-center space-y-4">
                  <!-- Avatar -->
                  <div class="relative">
                    {#if user.avatar}
                      <img
                        src={user.avatar}
                        alt="{user.displayName}'s avatar"
                        class="w-16 h-16 rounded-full object-cover border-2 border-border"
                      />
                    {:else}
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-2 border-border">
                        <span class="text-white font-bold text-lg">
                          {getInitials(user.displayName)}
                        </span>
                      </div>
                    {/if}
                    {#if user.isVerified}
                      <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      </div>
                    {/if}
                  </div>

                  <!-- User info -->
                  <div class="space-y-2">
                    <h3 class="font-semibold text-lg">{user.displayName}</h3>
                    <p class="text-sm text-muted-foreground">@{user.username}</p>
                    
                    {#if user.bio}
                      <p class="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                    {/if}
                  </div>

                  <!-- Stats -->
                  <div class="flex items-center gap-4 text-sm text-muted-foreground">
                    <div class="flex items-center gap-1">
                      <Star class="w-4 h-4" />
                      <span>{user.totalRatings}</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <Users class="w-4 h-4" />
                      <span>{user.followerCount}</span>
                    </div>
                  </div>

                  <!-- Additional info -->
                  <div class="space-y-1 text-xs text-muted-foreground">
                    {#if user.location}
                      <div class="flex items-center justify-center gap-1">
                        <MapPin class="w-3 h-3" />
                        <span>{user.location}</span>
                      </div>
                    {/if}
                    <div class="flex items-center justify-center gap-1">
                      <Calendar class="w-3 h-3" />
                      <span>Joined {formatDate(user.joinedAt)}</span>
                    </div>
                  </div>

                  <!-- View profile button -->
                  <a href="/user/{user.username}" class="w-full">
                    <Button variant="outline" class="w-full">
                      <UserIcon class="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </a>
                </div>
              </Card.Content>
            </Card.Root>
          {/each}
        </div>
      {:else}
        <div class="text-center py-16">
          <Users class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">
            {data.query ? 'No users found' : 'No users yet'}
          </h3>
          <p class="text-muted-foreground">
            {data.query 
              ? `No users found matching "${data.query}". Try a different search term.`
              : 'Be the first to join the community!'
            }
          </p>
        </div>
      {/if}
    </section>

    <!-- Pagination -->
    {#if data.totalPages > 1}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-border/60">
        <p class="text-xs md:text-sm text-muted-foreground">
          Page {data.currentPage} of {data.totalPages}
        </p>
        <div class="flex justify-end items-center gap-3">
          {#if data.currentPage > 1}
            <a href="/users?{data.query ? `q=${encodeURIComponent(data.query)}&` : ''}page={data.currentPage - 1}">
              <Button variant="outline" class="px-4 md:px-6">
                <ChevronLeft class="w-4 h-4 mr-2" />
                Previous
              </Button>
            </a>
          {/if}
          {#if data.currentPage < data.totalPages}
            <a href="/users?{data.query ? `q=${encodeURIComponent(data.query)}&` : ''}page={data.currentPage + 1}">
              <Button variant="outline" class="px-4 md:px-6">
                Next
                <ChevronRight class="w-4 h-4 ml-2" />
              </Button>
            </a>
          {/if}
        </div>
      </div>
    {/if}
  </main>
</div>