<script lang="ts">
  import { Users, Star, ChevronLeft, ChevronRight, Calendar, User, Search, X } from "lucide-svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  interface Character {
    id: number;
    name: string;
    character?: string;
    profile_path?: string;
    credit_id?: string;
    order: number;
    media: {
      id: number;
      title?: string;
      name?: string;
    };
    mediaType: string;
    mediaTitle: string;
    mediaYear?: number;
    mediaRating?: number;
    genres?: Array<{ id: number; name: string }>;
    isAnimation?: boolean;
  }

  let { data }: { data: PageData } = $props();

  const { characters, currentPage, totalPages } = data;

  // Search functionality with debounce
  let searchQuery = $state("");
  let debouncedSearchQuery = $state("");
  let isSearching = $state(false);
  let searchTimeout: number | undefined;

  // Debounced search - only search after user stops typing for 300ms
  function handleSearchInput() {
    isSearching = true;
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout
    searchTimeout = setTimeout(() => {
      debouncedSearchQuery = searchQuery.trim();
      isSearching = false;
    }, 300);
  }

  // Filtered characters based on debounced search
  let filteredCharacters = $derived(() => {
    if (!debouncedSearchQuery) return characters as Character[];
    
    const query = debouncedSearchQuery.toLowerCase();
    return (characters as Character[]).filter((char) => {
      const character = char as Character;
      return character.character?.toLowerCase().includes(query) ||
        character.name?.toLowerCase().includes(query) ||
        character.mediaTitle?.toLowerCase().includes(query) ||
        character.genres?.some((genre) => genre.name?.toLowerCase().includes(query));
    });
  });

  function clearSearch() {
    searchQuery = "";
    debouncedSearchQuery = "";
    isSearching = false;
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    // Clear search on Escape key
    if (event.key === "Escape" && (searchQuery || debouncedSearchQuery)) {
      clearSearch();
    }
    // Focus search on Ctrl/Cmd + K
    if ((event.ctrlKey || event.metaKey) && event.key === "k") {
      event.preventDefault();
      const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }
  }

  function goToCharacter(creditId: string) {
    goto(`/character/${creditId}`);
  }

  function goToActor(actorId: number) {
    goto(`/person/${actorId}`);
  }

  function goToMedia(mediaType: string, mediaId: number) {
    goto(`/${mediaType}/${mediaId}`);
  }

  function goToPage(page: number) {
    goto(`/characters?page=${page}`);
  }
</script>

<svelte:head>
  <title>Iconic Characters - TVDom</title>
  <meta name="description" content="Discover iconic characters from legendary movies and TV shows" />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen">
  <!-- Hero Section -->
  <section class="relative py-16 md:py-24 bg-linear-to-b from-muted/50 to-background">
    <div class="container mx-auto px-4 md:px-8 text-center">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-4xl md:text-6xl font-bold mb-6">
          Iconic Characters
        </h1>
        <p class="text-xl text-muted-foreground mb-8">
          Meet legendary characters from movies, TV shows, anime, and cartoons of all time
        </p>
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 text-muted-foreground">
          <div class="flex items-center gap-2">
            <Users class="w-5 h-5" />
            <span>From classics to modern masterpieces</span>
          </div>
          <div class="hidden sm:block w-1 h-1 bg-muted-foreground/30 rounded-full"></div>
          <div class="flex items-center gap-2">
            <Search class="w-5 h-5" />
            <span>Search by character, actor, show, or genre</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <main class="container mx-auto px-4 md:px-8 py-12">
    <!-- Search Bar -->
    <section class="mb-8">
      <div class="max-w-2xl mx-auto">
        <div class="relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            bind:value={searchQuery}
            oninput={handleSearchInput}
            placeholder="Search characters, actors, shows, anime, cartoons... (Ctrl+K)"
            class="pl-12 pr-12 py-4 text-base bg-card/60 backdrop-blur border-border/60 focus:border-primary/60 rounded-xl"
          />
          {#if searchQuery}
            <button
              onclick={clearSearch}
              class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X class="w-5 h-5" />
            </button>
          {/if}
        </div>
        
        <!-- Search Results Info -->
        {#if searchQuery}
          <div class="mt-3 text-center">
            <p class="text-sm text-muted-foreground">
              {#if isSearching}
                <span class="inline-flex items-center gap-2">
                  <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  Searching...
                </span>
              {:else if debouncedSearchQuery && filteredCharacters.length === 0}
                No characters found for "{debouncedSearchQuery}"
              {:else if debouncedSearchQuery && filteredCharacters.length === 1}
                Found 1 character for "{debouncedSearchQuery}"
              {:else if debouncedSearchQuery && filteredCharacters.length > 1}
                Found {filteredCharacters.length} characters for "{debouncedSearchQuery}"
              {:else if searchQuery && !debouncedSearchQuery}
                Type to search characters, actors, shows, anime, and cartoons...
              {/if}
            </p>
          </div>
        {/if}
      </div>
    </section>

    {#if !searchQuery || !debouncedSearchQuery}
      <!-- Top Characters Section (when not searching) -->
      <section class="mb-12">
        <div class="mb-8">
          <h2 class="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-2">
            <Star class="w-7 h-7 fill-yellow-400 text-yellow-400" />
            Top Characters
          </h2>
          <p class="text-muted-foreground">
            Most iconic characters from movies, TV shows, anime, and cartoons
          </p>
        </div>

        {#if characters.length > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {#each characters.slice(0, 8) as character, index ((character as Character).credit_id || index)}
              {@const typedCharacter = character as Character}
              <button 
                class="group block cursor-pointer w-full text-left" 
                onclick={() => typedCharacter.credit_id && goToCharacter(typedCharacter.credit_id)}
              >
                <Card.Root class="relative overflow-hidden rounded-2xl md:rounded-3xl w-full bg-card/40 border border-border/60 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <!-- Character image with backdrop -->
                  <div class="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full">
                    {#if typedCharacter.profile_path}
                      <img
                        src="https://image.tmdb.org/t/p/w500{typedCharacter.profile_path}"
                        alt={typedCharacter.name}
                        class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    {:else}
                      <div class="w-full h-full flex items-center justify-center bg-muted">
                        <User class="w-20 h-20 text-muted-foreground/30" />
                      </div>
                    {/if}

                    <!-- Soft gradient overlay -->
                    <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

                    <!-- Top ranking badge -->
                    <div class="absolute top-3 left-3">
                      <Badge class="bg-yellow-500/90 text-black font-bold px-2 py-1">
                        #{index + 1}
                      </Badge>
                    </div>

                    <!-- Floating content block -->
                    <div class="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5 lg:p-6">
                      <div class="space-y-2 sm:space-y-3">
                        <!-- Badges / meta row -->
                        <div class="flex items-center gap-1.5 sm:gap-2 text-xs">
                          <Badge class="bg-white/10 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 uppercase tracking-wide text-[0.65rem] sm:text-[0.7rem] md:text-xs">
                            {typedCharacter.mediaType}
                          </Badge>

                          {#if typedCharacter.mediaYear}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-white/90">
                              <Calendar class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {typedCharacter.mediaYear}
                            </span>
                          {/if}

                          {#if typedCharacter.mediaRating}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-white/90 ml-auto">
                              <Star class="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                              <span class="font-semibold">{typedCharacter.mediaRating.toFixed(1)}</span>
                            </span>
                          {/if}
                        </div>

                        <!-- Character Name -->
                        <Card.Title class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {typedCharacter.character || 'Unknown Character'}
                        </Card.Title>

                        <!-- Actor name -->
                        <div class="flex items-center gap-2 text-sm text-white/90">
                          <User class="w-4 h-4" />
                          <span class="font-medium">
                            played by 
                            <button
                              onclick={(e) => {
                                e.stopPropagation();
                                goToActor(typedCharacter.id);
                              }}
                              class="text-primary hover:text-primary/80 transition-colors underline decoration-1 underline-offset-2"
                            >
                              {typedCharacter.name}
                            </button>
                          </span>
                        </div>

                        <!-- Media title -->
                        <div class="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2">
                          <span class="text-white/60">from</span>
                          <button
                            onclick={(e) => {
                              e.stopPropagation();
                              goToMedia(typedCharacter.mediaType, typedCharacter.media.id);
                            }}
                            class="text-primary hover:text-primary/80 transition-colors font-medium ml-1"
                          >
                            {typedCharacter.mediaTitle}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Root>
              </button>
            {/each}
          </div>

          <!-- Show More Button -->
          {#if characters.length > 8}
            <div class="text-center mt-8">
              <Button 
                onclick={() => {
                  // Scroll to search and focus it to encourage exploration
                  const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
                  if (searchInput) {
                    searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => searchInput.focus(), 500);
                  }
                }}
                variant="outline" 
                class="gap-2 px-6 py-3"
              >
                <Search class="w-4 h-4" />
                Explore More Characters
              </Button>
            </div>
          {/if}
        {:else}
          <!-- Empty State for Top Characters -->
          <div class="text-center py-16">
            <Users class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 class="text-xl font-bold mb-2">No Characters Available</h3>
            <p class="text-muted-foreground">
              We couldn't load any characters at the moment. Please try again later.
            </p>
          </div>
        {/if}
      </section>

      <!-- Pagination (only show if not searching) -->
      {#if totalPages > 1}
        <section class="flex justify-center items-center gap-4">
          <Button
            variant="outline"
            onclick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            class="gap-2"
          >
            <ChevronLeft class="w-4 h-4" />
            Previous
          </Button>

          <div class="flex items-center gap-2">
            {#each Array(Math.min(5, totalPages)) as _, i}
              {@const pageNum = Math.max(1, Math.min(totalPages, currentPage - 2 + i))}
              <Button
                variant={pageNum === currentPage ? "default" : "outline"}
                onclick={() => goToPage(pageNum)}
                class="w-10 h-10 p-0"
              >
                {pageNum}
              </Button>
            {/each}
          </div>

          <Button
            variant="outline"
            onclick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            class="gap-2"
          >
            Next
            <ChevronRight class="w-4 h-4" />
          </Button>
        </section>
      {/if}
    {:else}
      <!-- Search Results Section -->
      {#if filteredCharacters.length > 0}
        <section class="mb-16">
          <div class="mb-8">
            <h2 class="text-2xl md:text-3xl font-bold flex items-center gap-3 mb-2">
              <Search class="w-7 h-7" />
              Search Results
            </h2>
            <p class="text-muted-foreground">
              {filteredCharacters.length} character{filteredCharacters.length === 1 ? '' : 's'} found for "{debouncedSearchQuery}"
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {#each filteredCharacters as character, index ((character as Character).credit_id || index)}
              {@const typedCharacter = character as Character}
              <button 
                class="group block cursor-pointer w-full text-left" 
                onclick={() => typedCharacter.credit_id && goToCharacter(typedCharacter.credit_id)}
              >
                <Card.Root class="relative overflow-hidden rounded-2xl md:rounded-3xl w-full bg-card/40 border border-border/60 transition-all duration-300 hover:shadow-lg hover:border-primary/20">
                  <!-- Character image with backdrop -->
                  <div class="relative h-64 sm:h-72 md:h-80 lg:h-96 w-full">
                    {#if typedCharacter.profile_path}
                      <img
                        src="https://image.tmdb.org/t/p/w500{typedCharacter.profile_path}"
                        alt={typedCharacter.name}
                        class="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    {:else}
                      <div class="w-full h-full flex items-center justify-center bg-muted">
                        <User class="w-20 h-20 text-muted-foreground/30" />
                      </div>
                    {/if}

                    <!-- Soft gradient overlay -->
                    <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent"></div>

                    <!-- Floating content block -->
                    <div class="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5 lg:p-6">
                      <div class="space-y-2 sm:space-y-3">
                        <!-- Badges / meta row -->
                        <div class="flex items-center gap-1.5 sm:gap-2 text-xs">
                          <Badge class="bg-white/10 backdrop-blur px-2 py-0.5 sm:px-3 sm:py-1 uppercase tracking-wide text-[0.65rem] sm:text-[0.7rem] md:text-xs">
                            {typedCharacter.mediaType}
                          </Badge>

                          {#if typedCharacter.mediaYear}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-white/90">
                              <Calendar class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                              {typedCharacter.mediaYear}
                            </span>
                          {/if}

                          {#if typedCharacter.mediaRating}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/40 backdrop-blur text-[0.65rem] sm:text-[0.7rem] md:text-xs text-white/90 ml-auto">
                              <Star class="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-yellow-400 text-yellow-400" />
                              <span class="font-semibold">{typedCharacter.mediaRating.toFixed(1)}</span>
                            </span>
                          {/if}
                        </div>

                        <!-- Character Name -->
                        <Card.Title class="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white drop-shadow-sm line-clamp-2 group-hover:text-primary transition-colors duration-300">
                          {typedCharacter.character || 'Unknown Character'}
                        </Card.Title>

                        <!-- Actor name -->
                        <div class="flex items-center gap-2 text-sm text-white/90">
                          <User class="w-4 h-4" />
                          <span class="font-medium">
                            played by 
                            <button
                              onclick={(e) => {
                                e.stopPropagation();
                                goToActor(typedCharacter.id);
                              }}
                              class="text-primary hover:text-primary/80 transition-colors underline decoration-1 underline-offset-2"
                            >
                              {typedCharacter.name}
                            </button>
                          </span>
                        </div>

                        <!-- Media title -->
                        <div class="text-xs sm:text-sm text-white/80 leading-relaxed line-clamp-2">
                          <span class="text-white/60">from</span>
                          <button
                            onclick={(e) => {
                              e.stopPropagation();
                              goToMedia(typedCharacter.mediaType, typedCharacter.media.id);
                            }}
                            class="text-primary hover:text-primary/80 transition-colors font-medium ml-1"
                          >
                            {typedCharacter.mediaTitle}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Root>
              </button>
            {/each}
          </div>
        </section>
      {:else}
        <!-- No Search Results -->
        <div class="text-center py-16">
          <Search class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 class="text-2xl font-bold mb-2">No Characters Found</h2>
          <p class="text-muted-foreground mb-4">
            We couldn't find any characters matching "{debouncedSearchQuery}".
          </p>
          <Button onclick={clearSearch} variant="outline">
            Clear Search
          </Button>
        </div>
      {/if}
    {/if}
  </main>
</div>