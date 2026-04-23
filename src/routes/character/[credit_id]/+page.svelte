<script lang="ts">
  import { ArrowLeft, Heart, Film, Tv, Star, User, Calendar, Images, ChevronLeft, ChevronRight, Plus } from "lucide-svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { character } = data;

  const primaryMedia = character.media?.[0] ?? null;
  const banner = character.media?.find((m: any) => m.banner)?.banner ?? null;

  let lightboxOpen = $state(false);
  let lightboxIndex = $state(0);

  // Gallery — starts with server-fetched images, can load more from Reddit
  let gallery = $state<string[]>(character.gallery ?? []);
  let redditAfter = $state<string | null>(null);
  let loadingMore = $state(false);
  let hasMore = $state(true); // assume there might be more until proven otherwise

  async function loadMore() {
    if (loadingMore) return;
    loadingMore = true;
    try {
      const params = new URLSearchParams({ name: character.name });
      if (redditAfter) params.set('after', redditAfter);
      const res = await fetch(`/api/character-images?${params}`);
      const data = await res.json();
      const newImgs: string[] = (data.images as string[]).filter(
        (url: string) => !gallery.includes(url)
      );
      gallery = [...gallery, ...newImgs];
      redditAfter = data.after ?? null;
      if (!data.after || newImgs.length === 0) hasMore = false;
    } catch {
      hasMore = false;
    } finally {
      loadingMore = false;
    }
  }

  function openLightbox(i: number) { lightboxIndex = i; lightboxOpen = true; }
  function closeLightbox() { lightboxOpen = false; }
  function prev() { lightboxIndex = (lightboxIndex - 1 + gallery.length) % gallery.length; }
  function next() { lightboxIndex = (lightboxIndex + 1) % gallery.length; }

  function handleKeydown(e: KeyboardEvent) {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  }

  function formatLabel(format?: string) {
    const map: Record<string, string> = {
      TV: 'TV Anime', TV_SHORT: 'TV Short', MOVIE: 'Anime Film',
      SPECIAL: 'Special', OVA: 'OVA', ONA: 'ONA',
      MANGA: 'Manga', NOVEL: 'Novel', ONE_SHOT: 'One Shot',
    };
    return map[format ?? ''] ?? (format ?? 'Anime');
  }

  function formatDate(dob: { year?: number; month?: number; day?: number } | null) {
    if (!dob || (!dob.month && !dob.day)) return null;
    const parts: (string | number)[] = [];
    if (dob.month) parts.push(new Date(0, dob.month - 1).toLocaleString('en', { month: 'long' }));
    if (dob.day) parts.push(dob.day);
    if (dob.year) parts.push(dob.year);
    return parts.join(' ');
  }
</script>

<svelte:head>
  <title>{character.name} - TVDom</title>
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<div class="min-h-screen">
  <!-- Hero -->
  <section
    class="relative min-h-[60vh] w-full overflow-hidden bg-muted"
    style={banner ? `background-image:url(${banner});background-size:cover;background-position:center;` : ''}
  >
    <div class="absolute inset-0 bg-linear-to-t from-background via-background/85 to-background/30"></div>
    <div class="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-transparent"></div>

    <div class="relative container mx-auto px-4 md:px-8 py-12 md:py-16">
      <Button onclick={() => history.back()} variant="outline" class="mb-8 gap-2 bg-background/80 backdrop-blur">
        <ArrowLeft class="w-4 h-4" />
        Back
      </Button>

      <div class="flex flex-col lg:flex-row gap-10 items-start">
        <!-- Character image -->
        <div class="shrink-0">
          <button
            onclick={() => character.gallery.length > 0 && openLightbox(0)}
            class="block w-44 md:w-56 rounded-xl overflow-hidden shadow-2xl border-2 border-border/40 hover:border-primary/60 transition-colors group"
            aria-label="View photo gallery"
          >
            {#if character.image}
              <img src={character.image} alt={character.name} class="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300" />
            {:else}
              <div class="w-full aspect-3/4 flex items-center justify-center bg-muted">
                <User class="w-16 h-16 text-muted-foreground" />
              </div>
            {/if}
          </button>
          {#if gallery.length > 1}
            <p class="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <Images class="w-3.5 h-3.5" />
              {gallery.length} photos — click to view
            </p>
          {/if}
        </div>

        <!-- Info -->
        <div class="flex-1 space-y-4">
          <Badge variant="secondary" class="bg-card/80 backdrop-blur">Character</Badge>

          <h1 class="text-4xl md:text-6xl font-bold text-foreground drop-shadow-lg leading-tight">
            {character.name}
          </h1>

          {#if character.nameNative}
            <p class="text-xl text-muted-foreground">{character.nameNative}</p>
          {/if}

          {#if character.nameAlternative?.length > 0}
            <p class="text-sm text-muted-foreground">
              Also known as: {character.nameAlternative.join(', ')}
            </p>
          {/if}

          <div class="flex flex-wrap gap-2">
            {#if character.favourites > 0}
              <Badge variant="outline" class="bg-card/50 backdrop-blur gap-1.5">
                <Heart class="w-3.5 h-3.5 fill-red-400 text-red-400" />
                {character.favourites.toLocaleString()} favourites
              </Badge>
            {/if}
            {#if character.gender}
              <Badge variant="outline" class="bg-card/50 backdrop-blur">{character.gender}</Badge>
            {/if}
            {#if character.age}
              <Badge variant="outline" class="bg-card/50 backdrop-blur">Age: {character.age}</Badge>
            {/if}
            {#if formatDate(character.dateOfBirth)}
              <Badge variant="outline" class="bg-card/50 backdrop-blur gap-1.5">
                <Calendar class="w-3.5 h-3.5" />
                {formatDate(character.dateOfBirth)}
              </Badge>
            {/if}
          </div>

          {#if character.description}
            <p class="text-muted-foreground leading-relaxed max-w-2xl line-clamp-5 text-sm md:text-base">
              {character.description}
            </p>
          {/if}

          {#if primaryMedia}
            <div class="flex items-center gap-3 p-3 bg-card/60 backdrop-blur rounded-xl border border-border/60 w-fit">
              {#if primaryMedia.cover}
                <img src={primaryMedia.cover} alt={primaryMedia.title} class="w-10 h-14 rounded object-cover" />
              {/if}
              <div>
                <p class="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Appears in</p>
                <p class="font-semibold text-sm">{primaryMedia.title}</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span class="text-xs text-muted-foreground">{formatLabel(primaryMedia.format)}</span>
                  {#if primaryMedia.year}
                    <span class="text-xs text-muted-foreground">· {primaryMedia.year}</span>
                  {/if}
                  {#if primaryMedia.score}
                    <span class="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                      · <Star class="w-3 h-3 fill-yellow-400 text-yellow-400" /> {primaryMedia.score / 10}
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <main class="container mx-auto px-4 md:px-8 py-12 space-y-16">

    <!-- Photo Gallery -->
    {#if gallery.length > 0}
      <section>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Images class="w-6 h-6" />
            Photo Gallery
            <span class="text-base font-normal text-muted-foreground">({gallery.length})</span>
          </h2>
        </div>

        <!-- Horizontal scrolling strip — same style as media detail page -->
        <div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
          <div class="flex gap-4 px-4 md:px-0">
            {#each gallery as img, i}
              <button
                type="button"
                onclick={() => openLightbox(i)}
                class="shrink-0 w-[200px] h-[280px] overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary"
                aria-label="View image {i + 1}"
              >
                <img
                  src={img}
                  alt="{character.name} photo {i + 1}"
                  class="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </button>
            {/each}

            <!-- Load more tile -->
            {#if hasMore}
              <button
                type="button"
                onclick={loadMore}
                disabled={loadingMore}
                class="shrink-0 w-[200px] h-[280px] overflow-hidden rounded-lg bg-muted border-2 border-dashed border-border hover:border-primary transition-all duration-300 flex flex-col items-center justify-center gap-3 text-muted-foreground hover:text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {#if loadingMore}
                  <div class="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span class="text-xs font-medium">Loading...</span>
                {:else}
                  <Plus class="w-8 h-8" />
                  <span class="text-xs font-medium">Load more</span>
                {/if}
              </button>
            {/if}
          </div>
        </div>
      </section>
    {/if}

    <!-- Appearances -->
    {#if character.media?.length > 0}
      <section>
        <h2 class="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
          <Tv class="w-6 h-6" />
          Appearances
          <span class="text-base font-normal text-muted-foreground">({character.media.length})</span>
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each character.media as m}
            <div class="group flex gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-lg transition-all duration-300">
              <!-- Cover -->
              <div class="shrink-0 w-16 rounded-lg overflow-hidden shadow-md">
                {#if m.cover}
                  <img src={m.cover} alt={m.title} class="w-full aspect-3/4 object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                {:else}
                  <div class="w-full aspect-3/4 bg-muted flex items-center justify-center">
                    <Film class="w-6 h-6 text-muted-foreground/40" />
                  </div>
                {/if}
              </div>

              <!-- Info -->
              <div class="flex-1 min-w-0 flex flex-col justify-between gap-2">
                <div>
                  <p class="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {m.title}
                  </p>
                  <div class="flex items-center gap-2 mt-1 flex-wrap">
                    <span class="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      {formatLabel(m.format)}
                    </span>
                    {#if m.year}
                      <span class="text-xs text-muted-foreground">{m.year}</span>
                    {/if}
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <!-- Genres -->
                  {#if m.genres?.length > 0}
                    <div class="flex gap-1 flex-wrap">
                      {#each m.genres.slice(0, 2) as genre}
                        <span class="text-[0.65rem] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {genre}
                        </span>
                      {/each}
                    </div>
                  {/if}

                  <!-- Score -->
                  {#if m.score}
                    <div class="flex items-center gap-1 shrink-0 ml-auto">
                      <div class="relative w-9 h-9">
                        <svg class="w-9 h-9 -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" stroke-width="3" class="text-muted/30" />
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke="currentColor" stroke-width="3"
                            stroke-dasharray="{(m.score / 100) * 94.25} 94.25"
                            stroke-linecap="round"
                            class="{m.score >= 75 ? 'text-green-500' : m.score >= 60 ? 'text-yellow-500' : 'text-red-500'}"
                          />
                        </svg>
                        <span class="absolute inset-0 flex items-center justify-center text-[0.6rem] font-bold">
                          {m.score}
                        </span>
                      </div>
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </section>
    {/if}

  </main>
</div>

<!-- Lightbox -->
{#if lightboxOpen && gallery.length > 0}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
    onclick={closeLightbox}
  >
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="relative max-w-2xl w-full mx-4" onclick={(e) => e.stopPropagation()}>
      <img
        src={gallery[lightboxIndex]}
        alt="{character.name} photo {lightboxIndex + 1}"
        class="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-2xl"
      />

      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
        {lightboxIndex + 1} / {gallery.length}
      </div>

      {#if gallery.length > 1}
        <button onclick={prev} class="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all hover:scale-110" aria-label="Previous">
          <ChevronLeft class="w-5 h-5" />
        </button>
        <button onclick={next} class="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all hover:scale-110" aria-label="Next">
          <ChevronRight class="w-5 h-5" />
        </button>
      {/if}

      <button onclick={closeLightbox} class="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full transition-all hover:scale-110" aria-label="Close">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}

<style>
  .aspect-3\/4 { aspect-ratio: 3/4; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
