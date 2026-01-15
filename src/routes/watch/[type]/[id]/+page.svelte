<script lang="ts">
  import { goto } from "$app/navigation";
  import { Monitor } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
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

  function goBack() {
    goto(`/${type}/${details.id}`);
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
        <Card.Root class="player-card">
          <Card.Content class="player-content p-0">
            {#if isPlayerLoading}
              <div class="player-loading">
                <div class="spinner"></div>
                <p class="loading-text">Loading...</p>
              </div>
            {/if}
            <div class="player-container">
              <iframe
                src={getStreamUrl()}
                class="player-iframe"
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
        <div class="episode-grid *:p-4">
          <!-- Season Selection -->
          <Card.Root>
            <Card.Header>
              <Card.Title>Season</Card.Title>
            </Card.Header>
            <Card.Content>
              <div class="season-buttons">
                {#each seasons as season}
                  <Button
                    variant={selectedSeason === season.season_number
                      ? "default"
                      : "outline"}
                    onclick={() => handleSeasonChange(season.season_number)}
                    class="episode-btn"
                  >
                    {season.season_number}
                  </Button>
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
                  <Button
                    variant={selectedEpisode === i + 1 ? "default" : "outline"}
                    onclick={() => handleEpisodeChange(i + 1)}
                    class="episode-btn"
                  >
                    {i + 1}
                  </Button>
                {/each}
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      {/if}
    </div>
  </main>
</div>

<style>
  .watch-page {
    min-height: 100vh;
    background: hsl(var(--background));
  }

  .watch-header {
    position: fixed;
    top: 4rem;
    left: 0;
    right: 0;
    z-index: 40;
    background: hsl(var(--background));
    border-bottom: 1px solid hsl(var(--border));
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

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 0;
    gap: 0.75rem;
  }

  @media (min-width: 640px) {
    .header-content {
      padding: 1rem 0;
      gap: 1rem;
    }
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  @media (min-width: 640px) {
    .header-left {
      gap: 1rem;
    }
  }

  .back-btn,
  .info-btn {
    flex-shrink: 0;
  }

  .back-text,
  .info-text {
    margin-left: 0.5rem;
  }

  @media (max-width: 639px) {
    .back-text,
    .info-text {
      display: none;
    }
  }

  .title-section {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-width: 0;
  }

  .header-poster {
    width: 2rem;
    height: 3rem;
    border-radius: 0.25rem;
    object-fit: cover;
    flex-shrink: 0;
    display: none;
  }

  @media (min-width: 640px) {
    .header-poster {
      display: block;
      width: 2.5rem;
      height: 3.5rem;
    }
  }

  .title-info {
    min-width: 0;
  }

  .watch-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: hsl(var(--foreground));
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media (min-width: 640px) {
    .watch-title {
      font-size: 1rem;
    }
  }

  @media (min-width: 768px) {
    .watch-title {
      font-size: 1.125rem;
    }
  }

  .episode-info {
    font-size: 0.75rem;
    color: hsl(var(--muted-foreground));
  }

  @media (min-width: 640px) {
    .episode-info {
      font-size: 0.875rem;
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

  .player-card {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
    overflow: hidden;
  }

  .player-content {
    padding: 0;
    position: relative;
    background: black;
  }

  .player-loading {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10;
    gap: 1rem;
  }

  .spinner {
    width: 2.5rem;
    height: 2.5rem;
    border: 3px solid hsl(var(--primary));
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @media (min-width: 640px) {
    .spinner {
      width: 3rem;
      height: 3rem;
    }
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .loading-text {
    color: white;
    font-size: 0.875rem;
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

  .server-card,
  .info-card {
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 0.5rem;
  }

  .server-card :global(.card-header),
  .info-card :global(.card-header) {
    padding: 1rem;
  }

  @media (min-width: 640px) {
    .server-card :global(.card-header),
    .info-card :global(.card-header) {
      padding: 1.25rem;
    }
  }

  .server-card :global(.card-content),
  .info-card :global(.card-content) {
    padding: 1rem;
    padding-top: 0;
  }

  @media (min-width: 640px) {
    .server-card :global(.card-content),
    .info-card :global(.card-content) {
      padding: 1.25rem;
      padding-top: 0;
    }
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
  }

  @media (min-width: 640px) {
    .card-title {
      font-size: 1rem;
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

  .server-btn {
    width: 100%;
    font-size: 0.875rem;
  }

  .status-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .status-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .status-dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-green {
    background: hsl(142, 76%, 36%);
  }

  .status-blue {
    background: hsl(221, 83%, 53%);
  }

  .status-purple {
    background: hsl(262, 83%, 58%);
  }

  .status-text {
    font-size: 0.875rem;
    color: hsl(var(--muted-foreground));
  }

  .playback-controls {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .control-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 0.375rem;
    background: hsl(var(--muted) / 0.3);
  }

  .control-text {
    font-size: 0.875rem;
    font-weight: 500;
    color: hsl(var(--foreground));
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

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  @media (min-width: 640px) {
    .nav-btn {
      font-size: 1rem;
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

  .episode-btn {
    width: 100%;
    font-weight: 600;
    font-size: 0.875rem;
  }

  @media (min-width: 640px) {
    .episode-btn {
      font-size: 1rem;
    }
  }
</style>
