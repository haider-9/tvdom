<script lang="ts">
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { Monitor } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { userStore } from "$lib/stores/user.svelte";
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

  // Load saved progress on mount
  onMount(() => {
    if (browser && mediaType === 'tv') {
      // First check URL params
      const urlParams = new URLSearchParams(window.location.search);
      const urlSeason = urlParams.get('s');
      const urlEpisode = urlParams.get('e');
      
      if (urlSeason && urlEpisode) {
        selectedSeason = parseInt(urlSeason);
        selectedEpisode = parseInt(urlEpisode);
        console.log('Loaded from URL:', { season: selectedSeason, episode: selectedEpisode });
      } else {
        // Fall back to localStorage
        const savedProgress = localStorage.getItem(`watch-${details.id}`);
        if (savedProgress) {
          try {
            const { season, episode } = JSON.parse(savedProgress);
            if (season && episode) {
              selectedSeason = season;
              selectedEpisode = episode;
              console.log('Loaded from localStorage:', { season, episode });
            }
          } catch (e) {
            console.error('Error loading saved progress:', e);
          }
        }
      }
      hasLoadedProgress = true;
    }
  });

  // Save progress when episode changes (only after initial load)
  $effect(() => {
    if (browser && mediaType === 'tv' && hasLoadedProgress) {
      localStorage.setItem(`watch-${details.id}`, JSON.stringify({
        season: selectedSeason,
        episode: selectedEpisode
      }));
      
      // Update URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.set('s', selectedSeason.toString());
      url.searchParams.set('e', selectedEpisode.toString());
      window.history.replaceState({}, '', url);
      
      console.log('Saved progress:', { season: selectedSeason, episode: selectedEpisode });
    }
  });

  // Track currently watching
  async function trackWatching() {
    if (watchingTracked || !browser) return;

    try {
      const userId = userStore.user?._id || userStore.user?.id;
      if (!userId) {
        console.log('No userId found, cannot track watching');
        return;
      }

      console.log('Tracking watching:', {
        userId,
        mediaId: details.id,
        mediaType,
        season: selectedSeason,
        episode: selectedEpisode
      });

      const response = await fetch('/api/currently-watching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mediaId: details.id,
          mediaType,
          mediaTitle: title,
          mediaPoster: details.poster_path,
          season: mediaType === 'tv' ? selectedSeason : undefined,
          episode: mediaType === 'tv' ? selectedEpisode : undefined
        })
      });

      const result = await response.json();
      console.log('Track watching response:', result);

      watchingTracked = true;
    } catch (error) {
      console.error('Error tracking watching:', error);
    }
  }

  // Stop tracking when leaving
  async function stopTracking() {
    if (!watchingTracked || !browser) return;

    try {
      const userId = userStore.user?._id || userStore.user?.id;
      if (!userId) return;

      await fetch(`/api/currently-watching?userId=${userId}&mediaId=${details.id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  }

  // Track when player loads
  $effect(() => {
    if (!isPlayerLoading && userStore.isAuthenticated) {
      console.log('Player loaded, tracking watching');
      trackWatching();
    }
  });

  // Update tracking when episode changes (reset watchingTracked flag)
  $effect(() => {
    if (mediaType === 'tv') {
      console.log('Episode changed to S' + selectedSeason + 'E' + selectedEpisode);
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
        (s: any) => s.season_number === selectedSeason
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
        (ep: any) => ep.episode_number === episodeNumber
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
        (s: any) => s.season_number === selectedSeason
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
            selectedEpisode
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
        (s: any) => s.season_number === selectedSeason
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
    window.addEventListener('beforeunload', stopTracking);
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
</script>

<svelte:head>
  <title>Watch {title} - TVDom</title>
</svelte:head>

<div class="watch-page">
  <!-- Top Bar -->

  <!-- Main Content -->
  <main class="watch-main">
    <div class="container">
      <!-- Video Player -->
      <div class="player-wrapper">
        <Card.Root class="player-card overflow-hidden">
          <Card.Content class="player-content  p-0">
         
            <div class="player-container ">
              <iframe
                src={getStreamUrl()}
                class="player-iframe "
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

      <!-- Controls -->
      <div class="controls-grid *:p-4">
        <!-- Server Selection -->
        <Card.Root class="server-card ">
          <Card.Header>
            <Card.Title class="card-title">
              <Monitor class="w-5 h-5" />
              Server
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="server-buttons">
              {#each streamingServers as server}
                <Button
                  variant={selectedServer === server.id ? "default" : "outline"}
                  onclick={() => handleServerChange(server.id)}
                  class="server-btn"
                >
                  {server.name}
                </Button>
              {/each}
            </div>
          </Card.Content>
        </Card.Root>
      </div>

      <!-- Episode Navigation (TV Shows Only) -->
      {#if mediaType === "tv"}
        <div class="episode-nav">
          <Button
            variant="outline"
            onclick={playPreviousEpisode}
            disabled={selectedSeason === 1 && selectedEpisode === 1}
            class="nav-btn"
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
          <div class="episode-display">
            <span class="episode-label">Now Playing</span>
            <span class="episode-current"
              >S{selectedSeason} E{selectedEpisode}</span
            >
          </div>
          <Button
            variant="outline"
            onclick={playNextEpisode}
            disabled={!hasNextEpisode()}
            class="nav-btn"
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
      {#if mediaType === "tv" && seasons && seasons.length > 0}
        <Tooltip.Provider>
          <div class="episode-grid *:p-4">
            <!-- Season Selection -->
            <Card.Root>
              <Card.Header>
                <Card.Title>Season</Card.Title>
              </Card.Header>
              <Card.Content>
                <div class="season-buttons">
                  {#each seasons as season}
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Button
                          variant={selectedSeason === season.season_number
                            ? "default"
                            : "outline"}
                          onclick={() => handleSeasonChange(season.season_number)}
                          class="episode-btn"
                        >
                          {season.season_number}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p class="font-medium text-sm">{season.name || `Season ${season.season_number}`}</p>
                      </Tooltip.Content>
                    </Tooltip.Root>
                  {/each}
                </div>
              </Card.Content>
            </Card.Root>

            <!-- Episode Selection -->
            <Card.Root>
              <Card.Header>
                <Card.Title>Episode</Card.Title>
              </Card.Header>
              <Card.Content>
                <div class="episode-buttons">
                  {#each Array(currentSeasonEpisodes()) as _, i}
                    <Tooltip.Root>
                      <Tooltip.Trigger>
                        <Button
                          variant={selectedEpisode === i + 1 ? "default" : "outline"}
                          onclick={() => handleEpisodeChange(i + 1)}
                          class="episode-btn"
                        >
                          {i + 1}
                        </Button>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p class="font-medium text-sm">{getEpisodeTitle(i + 1)}</p>
                      </Tooltip.Content>
                    </Tooltip.Root>
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

<style>
  .watch-page {
    min-height: 100vh;
    background: hsl(var(--background));
  }

  .container {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  @media (min-width: 640px) {
    .container {
      padding: 0 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .container {
      padding: 0 2rem;
    }
  }

  .watch-main {
    padding-top: 8rem;
    padding-bottom: 1.5rem;
  }

  @media (min-width: 640px) {
    .watch-main {
      padding-top: 9rem;
      padding-bottom: 2rem;
    }
  }

  .player-wrapper {
    margin-bottom: 1rem;
  }

  @media (min-width: 640px) {
    .player-wrapper {
      margin-bottom: 1.5rem;
    }
  }

  .player-container {
    position: relative;
    width: 100%;
    aspect-ratio: 16 / 9;
  }

  .player-iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .controls-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  @media (min-width: 640px) {
    .controls-grid {
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .controls-grid {
      grid-template-columns: 2fr 1fr;
    }
  }

  .server-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }

  @media (min-width: 640px) {
    .server-buttons {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .server-buttons {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1280px) {
    .server-buttons {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .episode-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
  }

  @media (min-width: 640px) {
    .episode-nav {
      margin-bottom: 1.5rem;
    }
  }

  .episode-display {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }

  .episode-label {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .episode-current {
    font-size: 1.125rem;
    font-weight: 600;
    color: hsl(var(--foreground));
  }

  @media (min-width: 640px) {
    .episode-current {
      font-size: 1.25rem;
    }
  }

  .episode-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .episode-grid {
      gap: 1.5rem;
    }
  }

  @media (min-width: 768px) {
    .episode-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .episode-grid :global(.card-header) {
    padding: 1rem;
  }

  @media (min-width: 640px) {
    .episode-grid :global(.card-header) {
      padding: 1.25rem;
    }
  }

  .episode-grid :global(.card-content) {
    padding: 1rem;
    padding-top: 0;
  }

  @media (min-width: 640px) {
    .episode-grid :global(.card-content) {
      padding: 1.25rem;
      padding-top: 0;
    }
  }

  .season-buttons,
  .episode-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.5rem;
  }

  @media (min-width: 480px) {
    .season-buttons,
    .episode-buttons {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  @media (min-width: 640px) {
    .season-buttons,
    .episode-buttons {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  @media (min-width: 768px) {
    .season-buttons,
    .episode-buttons {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .season-buttons,
    .episode-buttons {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  .episode-buttons {
    max-height: 14rem;
    overflow-y: auto;
  }

  @media (min-width: 640px) {
    .episode-buttons {
      max-height: 16rem;
    }
  }
</style>
