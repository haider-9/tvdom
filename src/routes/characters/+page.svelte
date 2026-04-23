<script lang="ts">
  import { ChevronLeft, ChevronRight, Search, X, Clapperboard, Heart } from "lucide-svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  interface AniCharacter {
    id: number;
    name: string;
    nameNative?: string;
    image?: string | null;
    description?: string;
    favourites: number;
    gender?: string;
    age?: string;
    media?: {
      id: number;
      title: string;
      type: string;
      format: string;
      cover?: string;
      score?: number;
      year?: number;
    } | null;
  }

  let { data }: { data: PageData } = $props();

  let searchInput = $state('');
  let searchTimeout: ReturnType<typeof setTimeout> | undefined;

  // Keep input in sync when data changes (e.g. browser back/forward)
  $effect(() => {
    searchInput = data.search ?? '';
  });

  const { characters, currentPage, totalPages, search } = $derived(data);

  function handleSearch() {
    clearTimeout(searchTimeout);
    const q = searchInput.trim();
    // Don't search on very short queries unless clearing
    if (q.length === 1) return;
    searchTimeout = setTimeout(() => {
      goto(q ? `/characters?q=${encodeURIComponent(q)}&page=1` : '/characters?page=1');
    }, 500);
  }

  function clearSearch() {
    searchInput = '';
    goto('/characters?page=1');
  }

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    const q = searchInput.trim();
    goto(q ? `/characters?q=${encodeURIComponent(q)}&page=${p}` : `/characters?page=${p}`);
  }

  function pageNumbers(current: number, total: number): (number | '…')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const set = new Set<number>(
      [1, total, current, current - 1, current + 1].filter((p) => p >= 1 && p <= total)
    );
    const sorted = [...set].sort((a, b) => a - b);
    const result: (number | '…')[] = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && (sorted[i] as number) - (sorted[i - 1] as number) > 1) result.push('…');
      result.push(sorted[i]);
    }
    return result;
  }

  function formatLabel(format?: string) {
    if (!format) return 'Anime';
    const map: Record<string, string> = {
      TV: 'TV Anime', TV_SHORT: 'TV Short', MOVIE: 'Anime Film',
      SPECIAL: 'Special', OVA: 'OVA', ONA: 'ONA', MANGA: 'Manga',
      NOVEL: 'Novel', ONE_SHOT: 'One Shot',
    };
    return map[format] ?? format;
  }
</script>

<svelte:head>
  <title>{search ? `"${search}" — Characters` : 'Iconic Characters'} - TVDom</title>
</svelte:head>

<div class="min-h-screen">
  <!-- Hero -->
  <section class="relative py-16 md:py-20 bg-linear-to-b from-muted/50 to-background">
    <div class="container mx-auto px-4 md:px-8 text-center">
      <h1 class="text-4xl md:text-6xl font-bold mb-4">Iconic Characters</h1>
      <p class="text-lg text-muted-foreground mb-4">
        Anime & manga characters, sorted by popularity
      </p>
      <!-- AniList attribution note -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 border border-border text-sm text-muted-foreground">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
        </svg>
        Characters are sourced from <a href="https://anilist.co" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline font-medium">AniList</a> and are anime/manga only
      </div>
    </div>
  </section>

  <main class="container mx-auto px-4 md:px-8 py-8">
    <!-- Search — server-side, searches all of AniList -->
    <div class="max-w-2xl mx-auto mb-10">
      <div class="relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          bind:value={searchInput}
          oninput={handleSearch}
          onkeydown={(e) => {
            if (e.key === 'Enter') {
              clearTimeout(searchTimeout);
              const q = searchInput.trim();
              goto(q ? `/characters?q=${encodeURIComponent(q)}&page=1` : '/characters?page=1');
            }
          }}
          placeholder="Search any character name..."
          class="pl-12 pr-10 py-4 text-base rounded-xl"
        />
        {#if searchInput}
          <button
            onclick={clearSearch}
            class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X class="w-5 h-5" />
          </button>
        {/if}
      </div>
      {#if search}
        <p class="text-sm text-muted-foreground mt-2 text-center">
          Showing results for "<span class="text-foreground font-medium">{search}</span>"
          — page {currentPage} of {totalPages}
        </p>
      {/if}
    </div>

    <!-- Grid -->
    {#if characters.length > 0}
      <section class="mb-12">
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {#each characters as c (c.id)}
            {@const char = c as AniCharacter}
            <a href="/character/{char.id}" class="group block">
              <Card.Root class="relative overflow-hidden rounded-xl bg-card/40 border border-border/60 transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1">
                <div class="relative aspect-[3/4] w-full">
                  {#if char.image}
                    <img
                      src={char.image}
                      alt={char.name}
                      class="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  {:else}
                    <div class="w-full h-full flex items-center justify-center bg-muted">
                      <Clapperboard class="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  {/if}

                  <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent"></div>

                  <!-- Favourites badge -->
                  {#if char.favourites > 0}
                    <div class="absolute top-2 right-2">
                      <span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur text-[0.6rem] text-white/90">
                        <Heart class="w-2.5 h-2.5 fill-red-400 text-red-400" />
                        {char.favourites >= 1000 ? `${(char.favourites / 1000).toFixed(1)}k` : char.favourites}
                      </span>
                    </div>
                  {/if}

                  <div class="absolute inset-x-0 bottom-0 p-2.5 space-y-1">
                    <!-- Character name -->
                    <p class="text-sm font-bold text-white drop-shadow line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                      {char.name}
                    </p>

                    <!-- Media -->
                    {#if char.media}
                      <div class="flex items-center gap-1 flex-wrap">
                        <Badge class="bg-white/10 backdrop-blur px-1.5 py-0 text-[0.6rem] uppercase tracking-wide">
                          {formatLabel(char.media.format)}
                        </Badge>
                        {#if char.media.year}
                          <span class="text-[0.6rem] text-white/70">{char.media.year}</span>
                        {/if}
                      </div>
                      <p class="text-[0.65rem] text-white/60 line-clamp-1">{char.media.title}</p>
                    {/if}
                  </div>
                </div>
              </Card.Root>
            </a>
          {/each}
        </div>
      </section>
    {:else}
      <div class="text-center py-20">
        <Clapperboard class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 class="text-2xl font-bold mb-2">No characters found</h2>
        <p class="text-muted-foreground mb-4">
          {search ? `No results for "${search}". Try a different name.` : 'Could not load characters.'}
        </p>
        {#if search}
          <Button onclick={clearSearch} variant="outline">Clear Search</Button>
        {/if}
      </div>
    {/if}

    <!-- Pagination -->
    {#if totalPages > 1}
      <nav class="flex justify-center items-center gap-2 mt-4 mb-8" aria-label="Pagination">
        <Button
          variant="outline"
          onclick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          class="gap-1"
        >
          <ChevronLeft class="w-4 h-4" />
          Prev
        </Button>

        {#each pageNumbers(currentPage, totalPages) as p}
          {#if p === '…'}
            <span class="px-2 text-muted-foreground select-none">…</span>
          {:else}
            <Button
              variant={p === currentPage ? "default" : "outline"}
              onclick={() => goToPage(p as number)}
              class="w-10 h-10 p-0"
            >
              {p}
            </Button>
          {/if}
        {/each}

        <Button
          variant="outline"
          onclick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          class="gap-1"
        >
          Next
          <ChevronRight class="w-4 h-4" />
        </Button>
      </nav>
    {/if}
  </main>
</div>
