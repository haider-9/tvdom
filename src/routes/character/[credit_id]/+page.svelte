<script lang="ts">
  import { Users, Film, Tv, Calendar, Star, Heart, User, ArrowLeft } from "lucide-svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import PersonMediaCard from "$lib/components/PersonMediaCard.svelte";
  import { goto } from "$app/navigation";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const { credit, person, media, otherRoles, mediaType } = data;

  const characterName = credit.character || "Unknown Character";
  const actorName = person?.name || credit.person?.name || "Unknown Actor";
  
  const mediaTitle = mediaType === 'movie' 
    ? (media?.title || credit.media?.title)
    : (media?.name || credit.media?.name);
    
  const mediaReleaseDate = mediaType === 'movie' 
    ? (media?.release_date || credit.media?.release_date)
    : (media?.first_air_date || credit.media?.first_air_date);

  const characterImage = person?.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : "";

  const mediaBackdrop = media?.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${media.backdrop_path}`
    : "";

  const mediaPoster = media?.poster_path
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : "";

  function goToActor() {
    if (person?.id) {
      goto(`/person/${person.id}`);
    }
  }

  function goToMedia() {
    if (media?.id) {
      goto(`/${mediaType}/${media.id}`);
    }
  }

  function goBack() {
    history.back();
  }
</script>

<svelte:head>
  <title>{characterName} - {actorName} - TVDom</title>
</svelte:head>

<div class="min-h-screen">
  <!-- Hero Section with backdrop -->
  <section
    class="relative min-h-[70vh] w-full overflow-hidden bg-muted"
    style={mediaBackdrop ? `background-image: url(${mediaBackdrop}); background-size: cover; background-position: center;` : ''}
  >
    <div
      class="absolute inset-0 bg-linear-to-t from-background via-background/90 to-background/30"
    ></div>
    <div
      class="absolute inset-0 bg-linear-to-r from-background/80 via-transparent to-transparent"
    ></div>

    <div class="relative container mx-auto px-4 md:px-8 py-12 md:py-16">
      <!-- Back button -->
      <Button
        onclick={goBack}
        variant="outline"
        class="mb-6 gap-2 bg-background/80 backdrop-blur"
      >
        <ArrowLeft class="w-4 h-4" />
        Back
      </Button>

      <div class="flex flex-col lg:flex-row gap-8 items-start">
        <!-- Character/Actor Image -->
        <div class="shrink-0">
          <div
            class="w-48 h-72 md:w-64 md:h-96 rounded-lg overflow-hidden bg-muted shadow-2xl"
          >
            {#if characterImage}
              <img
                src={characterImage}
                alt={actorName}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center">
                <User class="w-20 h-20 text-muted-foreground" />
              </div>
            {/if}
          </div>
        </div>

        <!-- Character Info -->
        <div class="flex-1 space-y-6">
          <div>
            <h1
              class="text-4xl md:text-6xl font-bold text-foreground drop-shadow-lg mb-2"
            >
              {characterName}
            </h1>
            <p class="text-xl md:text-2xl text-muted-foreground">
              Played by 
              <button 
                onclick={goToActor}
                class="text-primary hover:text-primary/80 transition-colors underline decoration-2 underline-offset-4"
              >
                {actorName}
              </button>
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              class="bg-card/80 backdrop-blur text-base px-4 py-2"
            >
              Character
            </Badge>

            {#if mediaReleaseDate}
              <Badge
                variant="outline"
                class="bg-card/50 backdrop-blur px-4 py-2 flex items-center gap-2"
              >
                <Calendar class="w-4 h-4" />
                {new Date(mediaReleaseDate).getFullYear()}
              </Badge>
            {/if}

            <Badge
              variant="outline"
              class="bg-card/50 backdrop-blur px-4 py-2 flex items-center gap-2"
            >
              {mediaType === 'movie' ? 'Movie' : 'TV Show'}
            </Badge>
          </div>

          <!-- Featured In -->
          <div class="space-y-4">
            <h3 class="text-xl font-semibold">Featured In</h3>
            <button
              onclick={goToMedia}
              class="group flex items-center gap-4 p-4 bg-card/60 backdrop-blur rounded-lg hover:bg-card/80 transition-all duration-300 border border-border/60 hover:border-primary/20"
            >
              {#if mediaPoster}
                <div class="w-16 h-24 rounded overflow-hidden shrink-0">
                  <img
                    src={mediaPoster}
                    alt={mediaTitle}
                    class="w-full h-full object-cover"
                  />
                </div>
              {/if}
              <div class="text-left">
                <h4 class="font-semibold text-lg group-hover:text-primary transition-colors">
                  {mediaTitle}
                </h4>
                {#if media?.overview}
                  <p class="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {media.overview}
                  </p>
                {/if}
                {#if media?.vote_average}
                  <div class="flex items-center gap-1 mt-2">
                    <Star class="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span class="text-sm font-medium">{media.vote_average.toFixed(1)}</span>
                  </div>
                {/if}
              </div>
            </button>
          </div>

          <!-- Actor Bio (if available) -->
          {#if person?.biography}
            <div class="space-y-4">
              <h3 class="text-xl font-semibold">About {actorName}</h3>
              <p class="text-muted-foreground leading-relaxed line-clamp-4">
                {person.biography}
              </p>
              <Button
                onclick={goToActor}
                variant="outline"
                class="gap-2"
              >
                <Users class="w-4 h-4" />
                View Full Profile
              </Button>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <main class="container mx-auto px-4 md:px-8 py-12">
    {#if otherRoles && otherRoles.length > 0}
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Users class="w-8 h-8" />
            Other Roles by {actorName}
          </h2>
          <p class="text-muted-foreground mt-2">
            Discover other characters played by this talented actor
          </p>
        </div>

        <div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
          <div class="flex gap-16 px-4 md:px-0 pb-4">
            {#each otherRoles as role}
              <div class="shrink-0 w-[280px]">
                <PersonMediaCard 
                  media={role} 
                  type={role.media_type} 
                  showCharacter={true} 
                />
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    <!-- Character Details Card -->
    <section class="mb-16">
      <div class="mb-8">
        <h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <User class="w-8 h-8" />
          Character Details
        </h2>
      </div>

      <div class="bg-card rounded-xl border border-border p-6 md:p-8">
        <div class="grid md:grid-cols-2 gap-8">
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-2">Character Name</h3>
              <p class="text-muted-foreground">{characterName}</p>
            </div>
            
            <div>
              <h3 class="font-semibold text-lg mb-2">Portrayed By</h3>
              <button 
                onclick={goToActor}
                class="text-primary hover:text-primary/80 transition-colors"
              >
                {actorName}
              </button>
            </div>

            {#if person?.known_for_department}
              <div>
                <h3 class="font-semibold text-lg mb-2">Actor's Department</h3>
                <p class="text-muted-foreground">{person.known_for_department}</p>
              </div>
            {/if}
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-2">Featured In</h3>
              <button 
                onclick={goToMedia}
                class="text-primary hover:text-primary/80 transition-colors"
              >
                {mediaTitle}
              </button>
            </div>

            {#if mediaReleaseDate}
              <div>
                <h3 class="font-semibold text-lg mb-2">Release Date</h3>
                <p class="text-muted-foreground">
                  {new Date(mediaReleaseDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            {/if}

            <div>
              <h3 class="font-semibold text-lg mb-2">Media Type</h3>
              <p class="text-muted-foreground capitalize">{mediaType}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }

  .overflow-x-auto {
    scroll-snap-type: x proximity;
  }

  .shrink-0 {
    scroll-snap-align: start;
  }
</style>