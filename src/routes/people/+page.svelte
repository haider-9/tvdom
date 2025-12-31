<script lang="ts">
  import { Users, Search, ChevronLeft, ChevronRight } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
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
        await goto(`/people?q=${encodeURIComponent(query)}`);
      } else {
        await goto('/people');
      }
    } finally {
      isSearching = false;
    }
  }


</script>

<svelte:head>
  <title>People - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-4 md:px-8 py-10 md:py-14 space-y-10">
    <!-- Page header -->
    <section class="space-y-6">
      <div class="space-y-2">
        <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Users class="w-4 h-4" />
          <span>Discover people</span>
        </div>
        <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
          Popular People
        </h1>
        <p class="max-w-xl text-sm md:text-base text-muted-foreground">
          Discover actors, directors, writers, and other talented people in the entertainment industry.
        </p>
      </div>

      <!-- Search form -->
      <form onsubmit={handleSearch} class="max-w-2xl">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            bind:value={searchQuery}
            placeholder="Search for actors, directors, writers..."
            class="pl-10 pr-4 h-12"
            disabled={isSearching}
          />
          <Button
            type="submit"
            variant='default'
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
      {#if data?.query}
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">
            Search results for "{data.query}"
          </h2>
          <p class="text-sm text-muted-foreground">
            {data.totalResults || 0} people found
          </p>
        </div>
      {:else}
        <h2 class="text-xl font-semibold">Popular People</h2>
      {/if}

      {#if data?.people && data.people.length > 0}
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {#each data.people as person}
            <a href="/person/{person.id}" class="person-card flex flex-col items-center space-y-3">
              <!-- Oval profile image with rating badge -->
              <div class="person-image-container w-32 h-48 sm:w-36 sm:h-52 md:w-40 md:h-56 relative">
                {#if person.profile_path}
                  <img
                    src="https://image.tmdb.org/t/p/w300{person.profile_path}"
                    alt="{person.name}"
                    class="person-image w-full h-full object-cover border-2 border-border hover:border-primary transition-colors duration-300"
                    loading="lazy"
                  />
                {:else}
                  <div class="person-placeholder w-full h-full bg-linear-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 border-2 border-border flex items-center justify-center">
                    <Users class="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 text-gray-400" />
                  </div>
                {/if}
                
                <!-- Tilted doodle-style rating badge -->
                <div class="rating-badge absolute top-2 left-0 z-10">
                  <Badge variant="secondary" class="doodle-badge bg-primary text-primary-foreground font-bold text-xs px-2 py-1 shadow-lg border-2 border-white">
                    {person.popularity?.toFixed(1) || '0.0'}
                  </Badge>
                </div>
              </div>

              <!-- Person name only -->
              <div class="person-info text-center max-w-full">
                <h3 class="font-semibold text-sm line-clamp-2 px-2">{person.name}</h3>
              </div>
            </a>
          {/each}
        </div>
      {:else}
        <div class="text-center py-16">
          <Users class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 class="text-xl font-semibold mb-2">
            {data?.query ? 'No people found' : 'No people available'}
          </h3>
          <p class="text-muted-foreground">
            {data?.query 
              ? `No people found matching "${data.query}". Try a different search term.`
              : 'Check back later for popular people in entertainment.'
            }
          </p>
        </div>
      {/if}
    </section>

    <!-- Pagination -->
    {#if data?.totalPages && data.totalPages > 1}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-border/60">
        <p class="text-xs md:text-sm text-muted-foreground">
          Page {data.currentPage || 1} of {Math.min(data.totalPages, 500)}
        </p>
        <div class="flex justify-end items-center gap-3">
          {#if (data.currentPage || 1) > 1}
            <a href="/people?{data.query ? `q=${encodeURIComponent(data.query)}&` : ''}page={(data.currentPage || 1) - 1}">
              <Button variant="outline" class="px-4 md:px-6">
                <ChevronLeft class="w-4 h-4 mr-2" />
                Previous
              </Button>
            </a>
          {/if}
          {#if (data.currentPage || 1) < data.totalPages && (data.currentPage || 1) < 500}
            <a href="/people?{data.query ? `q=${encodeURIComponent(data.query)}&` : ''}page={(data.currentPage || 1) + 1}">
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

<style>
  .person-card {
    cursor: pointer;
    text-decoration: none;
    color: inherit;
  }
  
  .person-card:hover {
    text-decoration: none;
  }
  
  .person-image-container {
    position: relative;
  }
  
  .person-image {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
  }
  
  .person-placeholder {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
  }
  
  .person-info {
    min-height: 2rem;
  }
  
  .person-card:hover .person-image {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .person-card:hover .person-placeholder {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  
  .rating-badge {
    transform: rotate(-25deg) skew(-5deg, 2deg);
    transform-origin: center;
  }
  
  :global(.doodle-badge) {
    border-radius: 12px 8px 10px 6px !important;
    position: relative;
  }
  
  :global(.doodle-badge::before) {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: transparent;
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 14px 10px 12px 8px;
    z-index: -1;
  }
  
  .person-card:hover .rating-badge {
    transform: rotate(-25deg) skew(-5deg, 2deg) scale(1.1);
    transition: transform 0.3s ease;
  }
</style>