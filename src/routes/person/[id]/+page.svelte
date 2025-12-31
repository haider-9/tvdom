<script lang="ts">
  import { Users, Film, Tv, Calendar, Star, Heart } from "lucide-svelte";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  // dialog UI is not used for the gallery lightbox; use a simple custom modal
  import MediaCard from "$lib/components/MediaCard.svelte";
  import { userStore } from "$lib/stores/user.svelte";
  import { toast } from "svelte-sonner";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const { person, knownFor } = data;

  const profileUrl = person.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : "";

  const movieCredits = (knownFor || []).filter(
    (c: any) => c.media_type === "movie"
  );
  const tvCredits = (knownFor || []).filter((c: any) => c.media_type === "tv");
  const images: any[] = [];

  // Check if person is in user's favorites
  let isFavorite = $derived(
    userStore.isAuthenticated &&
      userStore.userPersonFavorites?.some(
        (fav) => fav.personId === person.id?.toString()
      )
  );

  // Check if user has rated this person
  let userRating = $derived(
    userStore.userPersonRatings?.find(
      (rating) => rating.personId === person.id?.toString()
    )
  );

  async function toggleFavorite() {
    if (!userStore.isAuthenticated) {
      toast.error("Please sign in to add favorites");
      return;
    }

    try {
      if (isFavorite) {
        const promise = userStore.removePersonFromFavorites(
          person.id.toString()
        );
        toast.promise(promise, {
          loading: "Removing from favorites...",
          success: `Removed ${person.name} from favorites!`,
          error: "Failed to remove from favorites",
        });
      } else {
        const promise = userStore.addPersonToFavorites(
          person.id.toString(),
          person.name,
          person.profile_path,
          person.known_for_department
        );
        toast.promise(promise, {
          loading: "Adding to favorites...",
          success: `Added ${person.name} to favorites!`,
          error: "Failed to add to favorites",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  }

  async function ratePerson(rating: number) {
    if (!userStore.isAuthenticated) {
      toast.error("Please sign in to rate");
      return;
    }

    const promise = userStore.addPersonRating(
      person.id.toString(),
      rating,
      undefined, // review
      person.name,
      person.profile_path
    );

    toast.promise(promise, {
      loading: "Adding rating...",
      success: `Rated ${person.name} ${rating}/10!`,
      error: "Failed to add rating",
    });
  }

  let lightboxOpen = $state(false);
  let currentIndex = $state(0);

  function openLightbox(i: number) {
    currentIndex = i;
    lightboxOpen = true;
  }

  function closeLightbox() {
    lightboxOpen = false;
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!lightboxOpen) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") prevImage();
    if (e.key === "ArrowRight") nextImage();
  }
</script>

<svelte:head>
  <title>{person.name} - TVDom</title>
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen">
  <!-- Hero Section -->
  <section
    class="relative min-h-[60vh] md:min-h-[70vh] w-full overflow-hidden bg-muted"
  >
    <div
      class="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/30"
    ></div>
    <div
      class="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent"
    ></div>

    <div class="relative container mx-auto px-4 md:px-8 py-12 md:py-16">
      <div class="flex flex-col md:flex-row gap-8 items-start">
        <!-- Profile Picture -->
        <div class="flex-shrink-0">
          <div
            class="w-48 h-72 md:w-64 md:h-96 rounded-lg overflow-hidden bg-muted shadow-2xl"
          >
            {#if profileUrl}
              <img
                src={profileUrl}
                alt={person.name}
                class="w-full h-full object-cover"
              />
            {:else}
              <div class="w-full h-full flex items-center justify-center">
                <Users class="w-20 h-20 text-muted-foreground" />
              </div>
            {/if}
          </div>
        </div>

        <!-- Person Info -->
        <div class="flex-1 space-y-6">
          <h1
            class="text-4xl md:text-6xl font-bold text-foreground drop-shadow-lg"
          >
            {person.name}
          </h1>

          <div class="flex flex-wrap items-center gap-3">
            {#if person.known_for_department}
              <Badge
                variant="secondary"
                class="bg-card/80 backdrop-blur text-base px-4 py-2"
              >
                {person.known_for_department}
              </Badge>
            {/if}

            {#if person.birthday}
              <Badge
                variant="outline"
                class="bg-card/50 backdrop-blur px-4 py-2 flex items-center gap-2"
              >
                <Calendar class="w-4 h-4" />
                {person.birthday}
              </Badge>
            {/if}

            {#if person.place_of_birth}
              <Badge
                variant="outline"
                class="bg-card/50 backdrop-blur px-4 py-2"
              >
                {person.place_of_birth}
              </Badge>
            {/if}
          </div>

          {#if person.biography}
            <p
              class="text-base md:text-lg text-muted-foreground leading-relaxed line-clamp-4 max-w-3xl"
            >
              {person.biography}
            </p>
          {/if}

          <!-- Action Buttons -->
          <div class="flex flex-wrap gap-4 pt-4">
            <!-- Favorite Button -->
            <Button
              onclick={toggleFavorite}
              variant={isFavorite ? "default" : "outline"}
              class="gap-2 px-6 py-3 text-base"
            >
              <Heart class="w-5 h-5 {isFavorite ? 'fill-current' : ''}" />
              {isFavorite ? "Favorited" : "Add to Favorites"}
            </Button>

            <!-- Rating Dropdown -->
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button
                  variant={userRating ? "secondary" : "outline"}
                  class="gap-2 px-6 py-3 text-base"
                >
                  <Star
                    class="w-5 h-5 {userRating
                      ? 'fill-yellow-400 text-yellow-400'
                      : ''}"
                  />
                  {userRating ? `${userRating.rating}/10` : "Rate"}
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content class="w-48">
                {#if userRating}
                  <DropdownMenu.Item
                    onclick={() =>
                      userStore.deletePersonRating(person.id.toString())}
                  >
                    Remove Rating
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                {/if}
                {#each [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as rating}
                  <DropdownMenu.Item
                    onclick={() => ratePerson(rating)}
                    class="flex items-center justify-between"
                  >
                    {#snippet children()}
                      <span>{rating}/10</span>
                      <div class="flex">
                        {#each Array(Math.ceil(rating / 2)) as _}
                          <Star
                            class="h-3 w-3 fill-yellow-400 text-yellow-400"
                          />
                        {/each}
                      </div>
                    {/snippet}
                  </DropdownMenu.Item>
                {/each}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </div>
  </section>

  <main class="container mx-auto px-4 md:px-8 py-12">
    {#if images.length > 0}
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Users class="w-8 h-8" />
            Photo Gallery
          </h2>
        </div>

        <div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
          <div class="flex gap-4 px-4 md:px-0 pb-4">
            {#each images as img, i}
              <button
                type="button"
                onclick={() => openLightbox(i)}
                class="shrink-0 w-[200px] h-[280px] overflow-hidden rounded-lg bg-muted hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w300${img.file_path}`}
                  alt={person.name}
                  class="w-full h-full object-cover object-center"
                  loading="lazy"
                />
              </button>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    {#if lightboxOpen}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      >
        <button
          type="button"
          class="absolute inset-0"
          onclick={closeLightbox}
          aria-label="Close lightbox"
        ></button>

        <div class="relative z-10 max-w-6xl w-full mx-4">
          <!-- Previous Button -->
          <button
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110"
            onclick={prevImage}
            aria-label="Previous image"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <!-- Image -->
          <div class="bg-muted/20 rounded-xl overflow-hidden shadow-2xl">
            <img
              src={`https://image.tmdb.org/t/p/original${images[currentIndex].file_path}`}
              alt={person.name}
              class="w-full h-auto max-h-[85vh] object-contain"
            />
          </div>

          <!-- Next Button -->
          <button
            type="button"
            class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all duration-300 hover:scale-110"
            onclick={nextImage}
            aria-label="Next image"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          <!-- Close Button -->
          <button
            type="button"
            class="absolute right-4 top-4 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
            onclick={closeLightbox}
            aria-label="Close"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <!-- Image Counter -->
          <div
            class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm"
          >
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      </div>
    {/if}
    {#if movieCredits.length > 0}
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Film class="w-8 h-8" />
            Movie Credits
          </h2>
        </div>

        <div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
          <div class="flex gap-16 px-4 md:px-0 pb-4">
            {#each movieCredits.slice(0, 20) as credit}
              <div class="flex-shrink-0 w-[280px]">
                <MediaCard media={credit} type="movie" />
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}

    {#if tvCredits.length > 0}
      <section class="mb-16">
        <div class="mb-8">
          <h2 class="text-3xl md:text-4xl font-bold flex items-center gap-3">
            <Tv class="w-8 h-8" />
            TV Credits
          </h2>
        </div>

        <div class="overflow-x-auto scrollbar-hide -mx-4 md:mx-0">
          <div class="flex gap-16 px-4 md:px-0 pb-4">
            {#each tvCredits.slice(0, 20) as credit}
              <div class="flex-shrink-0 w-[280px]">
                <MediaCard media={credit} type="tv" />
              </div>
            {/each}
          </div>
        </div>
      </section>
    {/if}
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

  .flex-shrink-0 {
    scroll-snap-align: start;
  }
</style>
