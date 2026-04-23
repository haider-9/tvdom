<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { Monitor, Grid3X3, List, Maximize, Minimize } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { userStore } from "$lib/stores/user.svelte";
  import { cn } from "$lib/utils";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const { details, type, seasons } = data;
  const mediaType = type as "movie" | "tv";
  const title = type === "movie" ? details.title : details.name;

  let selectedServer = $state<
    "vidsrc" | "vidsrc2" | "superembed" | "autoembed"
  >("superembed");
  let isPlayerLoading = $state(true);
  let selectedSeason = $state(1);
  let selectedEpisode = $state(1);
  let autoplay = $state(true);
  let videoEnded = $state(false);
  let watchingTracked = $state(false);
  let hasLoadedProgress = $state(false);
  let seasonViewMode = $state<"grid" | "list">("list");
  let episodeViewMode = $state<"grid" | "list">("list");
  let isTheaterMode = $state(false);

  // Load saved progress on mount
  onMount(() => {
    if (browser && mediaType === "tv") {
      // First check URL params
      const urlParams = new URLSearchParams(window.location.search);
      const urlSeason = urlParams.get("s");
      const urlEpisode = urlParams.get("e");

      if (urlSeason && urlEpisode) {
        selectedSeason = parseInt(urlSeason);
        selectedEpisode = parseInt(urlEpisode);
        console.log("Loaded from URL:", {
          season: selectedSeason,
          episode: selectedEpisode,
        });
      } else {
        // Fall back to localStorage
        const savedProgress = localStorage.getItem(`watch-${details.id}`);
        if (savedProgress) {
          try {
            const { season, episode } = JSON.parse(savedProgress);
            if (season && episode) {
              selectedSeason = season;
              selectedEpisode = episode;
              console.log("Loaded from localStorage:", { season, episode });
            }
          } catch (e) {
            console.error("Error loading saved progress:", e);
          }
        }
      }
      hasLoadedProgress = true;
    }
  });

  // Save progress when episode changes (only after initial load)
  $effect(() => {
    if (browser && mediaType === "tv" && hasLoadedProgress) {
      localStorage.setItem(
        `watch-${details.id}`,
        JSON.stringify({
          season: selectedSeason,
          episode: selectedEpisode,
        }),
      );

      // Update URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.set("s", selectedSeason.toString());
      url.searchParams.set("e", selectedEpisode.toString());
      window.history.replaceState({}, "", url);

      console.log("Saved progress:", {
        season: selectedSeason,
        episode: selectedEpisode,
      });
    }
  });

  // Track currently watching
  async function trackWatching() {
    if (watchingTracked || !browser) return;

    try {
      const userId = userStore.user?._id || userStore.user?.id;
      if (!userId) {
        console.log("No userId found, cannot track watching");
        return;
      }

      console.log("Tracking watching:", {
        userId,
        mediaId: details.id,
        mediaType,
        season: selectedSeason,
        episode: selectedEpisode,
      });

      const response = await fetch("/api/currently-watching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          mediaId: details.id,
          mediaType,
          mediaTitle: title,
          mediaPoster: details.poster_path,
          season: mediaType === "tv" ? selectedSeason : undefined,
          episode: mediaType === "tv" ? selectedEpisode : undefined,
        }),
      });

      const result = await response.json();
      console.log("Track watching response:", result);

      watchingTracked = true;
    } catch (error) {
      console.error("Error tracking watching:", error);
    }
  }

  // Stop tracking when leaving
  async function stopTracking() {
    if (!watchingTracked || !browser) return;

    try {
      const userId = userStore.user?._id || userStore.user?.id;
      if (!userId) return;

      await fetch(
        `/api/currently-watching?userId=${userId}&mediaId=${details.id}`,
        {
          method: "DELETE",
        },
      );
    } catch (error) {
      console.error("Error stopping tracking:", error);
    }
  }

  // Track when player loads
  $effect(() => {
    if (!isPlayerLoading && userStore.isAuthenticated) {
      console.log("Player loaded, tracking watching");
      trackWatching();
    }
  });

  // Update tracking when episode changes (reset watchingTracked flag)
  $effect(() => {
    if (mediaType === "tv") {
      console.log(
        "Episode changed to S" + selectedSeason + "E" + selectedEpisode,
      );
      watchingTracked = false; // Reset flag so tracking updates
      if (!isPlayerLoading && userStore.isAuthenticated) {
        trackWatching();
      }
    }
  });

  // Get episode count for current season
  const currentSeasonEpisodes = $derived(() => {
    if (mediaType === "tv" && seasons) {
      const season = seasons.find(
        (s: any) => s.season_number === selectedSeason,
      );
      return season?.episode_count || 0;
    }
    return 0;
  });

  // Get current season data
  const currentSeasonData = $derived(() => {
    if (mediaType === "tv" && seasons) {
      return seasons.find((s: any) => s.season_number === selectedSeason);
    }
    return null;
  });

  // Get episode title
  function getEpisodeTitle(episodeNumber: number): string {
    const seasonData = currentSeasonData();
    if (seasonData && seasonData.episodes) {
      const episode = seasonData.episodes.find(
        (ep: any) => ep.episode_number === episodeNumber,
      );
      return episode?.name || `Episode ${episodeNumber}`;
    }
    return `Episode ${episodeNumber}`;
  }

  // Check if there's a next episode
  const hasNextEpisode = $derived(() => {
    if (mediaType !== "tv") return false;
    const episodeCount = currentSeasonEpisodes();
    if (selectedEpisode < episodeCount) return true;
    // Check if there's a next season
    if (seasons) {
      const currentSeasonIndex = seasons.findIndex(
        (s: any) => s.season_number === selectedSeason,
      );
      return currentSeasonIndex < seasons.length - 1;
    }
    return false;
  });

  // Watch for video end and autoplay
  $effect(() => {
    if (videoEnded && autoplay && hasNextEpisode() && mediaType === "tv") {
      // Wait 3 seconds before playing next episode
      const timeout = setTimeout(() => {
        playNextEpisode();
        videoEnded = false;
      }, 3000);
      return () => clearTimeout(timeout);
    }
  });

  const streamingServers = [
    {
      id: "vidsrc" as const,
      name: "Server 1",
      description: "Multi-language subtitles",
      features: ["Auto-subtitles", "Multiple languages"],
      getUrl: (type: string, id: string, season?: number, episode?: number) => {
        if (type === "tv" && season && episode) {
          return `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
        }
        return `https://vidsrc.to/embed/${type}/${id}`;
      },
    },
    {
      id: "vidsrc2" as const,
      name: "Server 2", 
      description: "HD quality with subs",
      features: ["HD streaming", "Subtitle options"],
      getUrl: (type: string, id: string, season?: number, episode?: number) => {
        if (type === "tv" && season && episode) {
          return `https://vidsrc.xyz/embed/tv/${id}/${season}/${episode}`;
        }
        return `https://vidsrc.xyz/embed/${type}/${id}`;
      },
    },
    {
      id: "superembed" as const,
      name: "Server 3",
      description: "Multi-audio & subtitles",
      features: ["Multiple audio tracks", "Subtitle selection", "Dub options"],
      getUrl: (type: string, id: string, season?: number, episode?: number) => {
        if (type === "tv" && season && episode) {
          return `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season}&e=${episode}`;
        }
        return `https://multiembed.mov/?video_id=${id}&tmdb=1`;
      },
    },
    {
      id: "autoembed" as const,
      name: "Server 4",
      description: "Auto-detect language",
      features: ["Auto language detection", "Regional content"],
      getUrl: (type: string, id: string, season?: number, episode?: number) => {
        if (type === "tv" && season && episode) {
          return `https://autoembed.co/tv/tmdb/${id}-${season}-${episode}`;
        }
        return `https://autoembed.co/${type}/tmdb/${id}`;
      },
    },
  ];

  function getStreamUrl() {
    const server = streamingServers.find((s) => s.id === selectedServer);
    if (mediaType === "tv") {
      return server
        ? server.getUrl(
            mediaType,
            details.id.toString(),
            selectedSeason,
            selectedEpisode,
          )
        : "";
    }
    return server ? server.getUrl(mediaType, details.id.toString()) : "";
  }

  function handleServerChange(serverId: typeof selectedServer) {
    isPlayerLoading = true;
    selectedServer = serverId;
    setTimeout(() => (isPlayerLoading = false), 800);
  }

  function handleSeasonChange(season: number) {
    isPlayerLoading = true;
    selectedSeason = season;
    selectedEpisode = 1;
    setTimeout(() => (isPlayerLoading = false), 800);
  }

  function handleEpisodeChange(episode: number) {
    isPlayerLoading = true;
    selectedEpisode = episode;
    setTimeout(() => (isPlayerLoading = false), 800);
  }

  function playNextEpisode() {
    if (!hasNextEpisode()) return;

    const episodeCount = currentSeasonEpisodes();
    if (selectedEpisode < episodeCount) {
      // Next episode in same season
      handleEpisodeChange(selectedEpisode + 1);
    } else if (seasons) {
      // Move to next season
      const currentSeasonIndex = seasons.findIndex(
        (s: any) => s.season_number === selectedSeason,
      );
      if (currentSeasonIndex < seasons.length - 1) {
        const nextSeason = seasons[currentSeasonIndex + 1];
        handleSeasonChange(nextSeason.season_number);
      }
    }
  }

  function playPreviousEpisode() {
    if (selectedEpisode > 1) {
      handleEpisodeChange(selectedEpisode - 1);
    } else if (selectedSeason > 1 && seasons) {
      // Move to previous season's last episode
      const prevSeasonIndex =
        seasons.findIndex((s: any) => s.season_number === selectedSeason) - 1;
      if (prevSeasonIndex >= 0) {
        const prevSeason = seasons[prevSeasonIndex];
        selectedSeason = prevSeason.season_number;
        selectedEpisode = prevSeason.episode_count;
        isPlayerLoading = true;
        setTimeout(() => (isPlayerLoading = false), 800);
      }
    }
  }

  // Cleanup on unmount
  if (browser) {
    window.addEventListener("beforeunload", stopTracking);
  }

  // Listen for video end events from iframe (if supported by the player)
  if (typeof window !== "undefined") {
    window.addEventListener("message", (event) => {
      // Check if message is from the video player
      if (event.data && typeof event.data === "object") {
        if (event.data.type === "video-ended" || event.data.event === "ended") {
          videoEnded = true;
        }
      }
    });
  }

  // Theater mode toggle
  function toggleTheaterMode() {
    isTheaterMode = !isTheaterMode;
    if (browser) {
      if (isTheaterMode) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
  }

  // Keyboard shortcuts for theater mode
  if (browser) {
    window.addEventListener("keydown", (e) => {
      if (e.key === "t" || e.key === "T") {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
        }
        toggleTheaterMode();
      }
      if (e.key === "Escape" && isTheaterMode) {
        isTheaterMode = false;
        document.body.style.overflow = "";
      }
    });
  }
</script>

<svelte:head>
  <title>Watch {title} - TVDom</title>
</svelte:head>

<div class={cn(
  "min-h-screen bg-background transition-colors duration-300",
  isTheaterMode && "overflow-hidden bg-black"
)}>
  <!-- Top Bar (hidden in theater mode) -->

  <!-- Main Content -->
  <main class={cn(
    "transition-all duration-300",
    isTheaterMode
      ? "fixed inset-0 z-9999 flex flex-col items-center justify-center bg-black p-4"
      : "pt-32 pb-6 sm:pt-36 sm:pb-8"
  )}>
    <div class={cn(
      "transition-all duration-300 flex flex-col",
      isTheaterMode ? "w-full h-full max-w-[95vw] max-h-[95vh]" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    )}>
      <!-- Video Player -->
      <div class={cn("relative", isTheaterMode ? "flex-1 w-full" : "mb-4 sm:mb-6")}>
        <Card.Root class={cn(
          "overflow-hidden transition-all duration-300",
          isTheaterMode && "h-full w-full shadow-2xl"
        )}>
          <Card.Content class={cn("p-0", isTheaterMode && "h-full w-full")}>
            <div class={cn(
              "relative w-full",
              isTheaterMode ? "h-full" : "aspect-video"
            )}>
              <iframe
                src={getStreamUrl()}
                class="absolute inset-0 w-full h-full"
                frameborder="0"
                allowfullscreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="origin"
                title="Watch {title}"
                onload={() => (isPlayerLoading = false)}
              ></iframe>
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- Theater Mode Button (Default View - Below Player) -->
      {#if !isTheaterMode}
        <div class="flex justify-end py-2">
          <Button
            variant="outline"
            size="sm"
            onclick={toggleTheaterMode}
            class="gap-2"
          >
            <Maximize class="w-4 h-4" />
            Theater Mode
          </Button>
        </div>
      {/if}

      <!-- Theater Mode Controls (Below Player) -->
      {#if isTheaterMode}
        <div class="flex items-center justify-center flex-wrap gap-4 py-4 bg-black">
          {#if mediaType === 'tv'}
            <Button
              variant="outline"
              size="sm"
              onclick={playPreviousEpisode}
              disabled={selectedSeason === 1 && selectedEpisode === 1}
              class="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
            >
              <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </Button>
            <span class="text-white text-sm font-medium px-3">
              S{selectedSeason} E{selectedEpisode}
            </span>
            <Button
              variant="outline"
              size="sm"
              onclick={playNextEpisode}
              disabled={!hasNextEpisode()}
              class="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white"
            >
              Next
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          {/if}
          <Button
            variant="outline"
            size="sm"
            onclick={() => { isTheaterMode = false; document.body.style.overflow = ""; }}
            class="bg-zinc-900 border-zinc-700 text-white hover:bg-zinc-800 hover:text-white gap-2"
          >
            <Minimize class="w-4 h-4" />
            Exit Theater
          </Button>
        </div>
      {/if}

      <!-- Controls -->
      <div
        class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 sm:gap-6 mb-4 sm:mb-6 *:p-4"
      >
        <!-- Server Selection -->
        <Card.Root class={cn("lg:col-span-2", isTheaterMode && "hidden")}>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <Monitor class="w-5 h-5" />
              Server
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="space-y-4">
              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3"
              >
                {#each streamingServers as server}
                  <div class="relative">
                    <Button
                      variant={selectedServer === server.id ? "default" : "outline"}
                      onclick={() => handleServerChange(server.id)}
                      class="w-full h-auto p-4 flex flex-col items-start gap-2"
                    >
                      <div class="flex items-center justify-between w-full">
                        <span class="font-semibold">{server.name}</span>
                        {#if selectedServer === server.id}
                          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                        {/if}
                      </div>
                      <p class="text-xs text-muted-foreground text-left">{server.description}</p>
                      <div class="flex flex-wrap gap-1 w-full">
                        {#each server.features as feature}
                          <span class="text-xs px-2 py-0.5 bg-muted rounded-full">
                            {feature}
                          </span>
                        {/each}
                      </div>
                    </Button>
                  </div>
                {/each}
              </div>
              
              <!-- Language/Subtitle Info -->
              <div class="p-3 bg-muted/50 rounded-lg">
                <p class="text-xs text-muted-foreground">
                  <strong>Note:</strong> Subtitle and audio language options are available within the video player. 
                  Different servers may offer different language selections and quality options.
                </p>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- Episode Navigation (TV Shows Only) -->
      {#if mediaType === "tv" && !isTheaterMode}
        <div
          class="flex items-center justify-between gap-4 mb-4 sm:mb-6 p-4 bg-card border border-border rounded-lg"
        >
          <Button
            variant="outline"
            onclick={playPreviousEpisode}
            disabled={selectedSeason === 1 && selectedEpisode === 1}
          >
            <svg
              class="w-4 h-4"
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
            <span>Previous</span>
          </Button>
          <div class="flex flex-col items-center gap-1">
            <span class="text-xs text-muted-foreground uppercase tracking-wider"
              >Now Playing</span
            >
            <span class="text-lg sm:text-xl font-semibold text-foreground"
              >S{selectedSeason} E{selectedEpisode}</span
            >
          </div>
          <Button
            variant="outline"
            onclick={playNextEpisode}
            disabled={!hasNextEpisode()}
          >
            <span>Next</span>
            <svg
              class="w-4 h-4"
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
          </Button>
        </div>
      {/if}

      <!-- Season & Episode Selection (TV Shows Only) -->
      {#if mediaType === "tv" && seasons && seasons.length > 0 && !isTheaterMode}
        <Tooltip.Provider>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 *:p-4">
            <!-- Season Selection -->
            <Card.Root>
              <Card.Header class="flex flex-row items-center justify-between">
                <Card.Title>Season</Card.Title>
                <div class="flex gap-1">
                  <Button
                    variant={seasonViewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    class="h-8 w-8"
                    onclick={() => (seasonViewMode = "grid")}
                  >
                    <Grid3X3 class="h-4 w-4" />
                  </Button>
                  <Button
                    variant={seasonViewMode === "list" ? "default" : "outline"}
                    size="icon"
                    class="h-8 w-8"
                    onclick={() => (seasonViewMode = "list")}
                  >
                    <List class="h-4 w-4" />
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                <div
                  class={cn(
                    seasonViewMode === "grid"
                      ? "grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 gap-2"
                      : "flex flex-col gap-1 max-h-56 sm:max-h-64 overflow-y-auto pr-1",
                  )}
                >
                  {#each seasons as season}
                    {#if seasonViewMode === "grid"}
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Button
                            variant={selectedSeason === season.season_number
                              ? "default"
                              : "outline"}
                            onclick={() =>
                              handleSeasonChange(season.season_number)}
                            class="w-full min-h-10 border border-border rounded-lg transition-all duration-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-[0_2px_4px_hsl(var(--primary)/0.15)]"
                          >
                            S{season.season_number}
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p class="font-medium text-sm">
                            {season.name || `Season ${season.season_number}`}
                          </p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    {:else}
                      <button
                        class={cn(
                          "flex items-center gap-3 py-2 px-3 rounded-md bg-transparent cursor-pointer border border-border transition-all duration-200 text-sm text-left hover:bg-accent",
                          {
                            "bg-primary hover:bg-primary/90 text-primary-foreground": selectedSeason === season.season_number,
                            "season-list-item": true,
                          },
                        )}
                        onclick={() => handleSeasonChange(season.season_number)}
                      >
                        <span
                          class="season-number font-semibold text-xs min-w-8"
                          >S{season.season_number}</span
                        >
                        <span class="season-name flex-1 truncate"
                          >{season.name ||
                            `Season ${season.season_number}`}</span
                        >
                        <span
                          class="season-episodes text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded"
                          >{season.episode_count} eps</span
                        >
                      </button>
                    {/if}
                  {/each}
                </div>
              </Card.Content>
            </Card.Root>

            <!-- Episode Selection -->
            <Card.Root>
              <Card.Header class="flex flex-row items-center justify-between">
                <Card.Title>Episode</Card.Title>
                <div class="flex gap-1">
                  <Button
                    variant={episodeViewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    class="h-8 w-8"
                    onclick={() => (episodeViewMode = "grid")}
                  >
                    <Grid3X3 class="h-4 w-4" />
                  </Button>
                  <Button
                    variant={episodeViewMode === "list" ? "default" : "outline"}
                    size="icon"
                    class="h-8 w-8"
                    onclick={() => (episodeViewMode = "list")}
                  >
                    <List class="h-4 w-4" />
                  </Button>
                </div>
              </Card.Header>
              <Card.Content>
                <div
                  class={cn(
                    episodeViewMode === "grid"
                      ? "grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 gap-2"
                      : "flex flex-col gap-1 max-h-56 sm:max-h-64 overflow-y-auto pr-1",
                  )}
                >
                  {#each Array(currentSeasonEpisodes()) as _, i}
                    {#if episodeViewMode === "grid"}
                      <Tooltip.Root>
                        <Tooltip.Trigger>
                          <Button
                            variant={selectedEpisode === i + 1
                              ? "default"
                              : "outline"}
                            onclick={() => handleEpisodeChange(i + 1)}
                            class="w-full min-h-10 border border-border rounded-lg transition-all duration-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-[0_2px_4px_hsl(var(--primary)/0.15)]"
                          >
                            Ep {i + 1}
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>
                          <p class="font-medium text-sm">
                            {getEpisodeTitle(i + 1)}
                          </p>
                        </Tooltip.Content>
                      </Tooltip.Root>
                    {:else}
                      <button
                        class={cn(
                          "flex items-center gap-3 py-2 px-3 rounded-md border bg-transparent cursor-pointer transition-all duration-200 text-sm text-left hover:bg-accent",
                          {
                            "bg-primary hover:bg-primary/90 text-primary-foreground": selectedEpisode === i + 1,
                            "episode-list-item": true,
                          },
                        )}
                        onclick={() => handleEpisodeChange(i + 1)}
                      >
                        <span
                          class="episode-number font-semibold text-xs min-w-8 leading-none"
                          >E{i + 1}</span
                        >
                        <span class="episode-name flex-1 truncate"
                          >{getEpisodeTitle(i + 1)}</span
                        >
                      </button>
                    {/if}
                  {/each}
                </div>
              </Card.Content>
            </Card.Root>
          </div>
        </Tooltip.Provider>
      {/if}
    </div>
  </main>
</div>
