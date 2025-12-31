<script lang="ts">
    import { userStore } from "$lib/stores/user.svelte.js";
    import {
        Plus,
        X,
        Star,
        Calendar,
        Clock,
        Filter,
        SortAsc,
        SortDesc,
        Grid,
        List,
        Search,
        Play,
        Eye,
        Trash2,
        Heart,
        Film,
        Tv,
        AlertCircle,
    } from "lucide-svelte";
    import type { WatchlistItem } from "$lib/user-types.js";
    import Button from "../ui/button/button.svelte";

    // Props
    let { showAddButton = true }: { showAddButton?: boolean } = $props();

    // Local state using Svelte 5 runes
    let viewMode = $state<"grid" | "list">("grid");
    let sortBy = $state<"added" | "title" | "year" | "priority">("added");
    let sortOrder = $state<"asc" | "desc">("desc");
    let filterType = $state<"all" | "movie" | "tv">("all");
    let filterPriority = $state<"all" | "low" | "medium" | "high">("all");
    let searchQuery = $state("");
    let showFilters = $state(false);
    let selectedItems = $state<string[]>([]);
    let showBulkActions = $state(false);

    // Add to watchlist modal
    let showAddModal = $state(false);
    let addMediaTitle = $state("");
    let addMediaType = $state<"movie" | "tv">("movie");
    let addPriority = $state<"low" | "medium" | "high">("medium");
    let addNotes = $state("");

    // Computed filtered and sorted watchlist
    let filteredWatchlist = $derived(() => {
        let filtered = userStore.userWatchlist.filter((item) => {
            // Text search
            if (
                searchQuery &&
                !item.mediaTitle
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
            ) {
                return false;
            }

            // Type filter
            if (filterType !== "all" && item.mediaType !== filterType) {
                return false;
            }

            // Priority filter
            if (filterPriority !== "all" && item.priority !== filterPriority) {
                return false;
            }

            return true;
        });

        // Sort
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case "added":
                    comparison =
                        new Date(a.addedAt).getTime() -
                        new Date(b.addedAt).getTime();
                    break;
                case "title":
                    comparison = a.mediaTitle.localeCompare(b.mediaTitle);
                    break;
                case "year":
                    comparison = (a.mediaYear || 0) - (b.mediaYear || 0);
                    break;
                case "priority":
                    const priorityOrder = { high: 3, medium: 2, low: 1 };
                    comparison =
                        priorityOrder[a.priority] - priorityOrder[b.priority];
                    break;
            }

            return sortOrder === "asc" ? comparison : -comparison;
        });

        return filtered;
    });

    // Statistics
    let watchlistStats = $derived(() => {
        const total = userStore.userWatchlist.length;
        const movies = userStore.userWatchlist.filter(
            (item) => item.mediaType === "movie",
        ).length;
        const tvShows = userStore.userWatchlist.filter(
            (item) => item.mediaType === "tv",
        ).length;
        const highPriority = userStore.userWatchlist.filter(
            (item) => item.priority === "high",
        ).length;

        return { total, movies, tvShows, highPriority };
    });

    function toggleSortOrder() {
        sortOrder = sortOrder === "asc" ? "desc" : "asc";
    }

    function toggleItemSelection(itemId: string) {
        if (selectedItems.includes(itemId)) {
            selectedItems = selectedItems.filter((id) => id !== itemId);
        } else {
            selectedItems = [...selectedItems, itemId];
        }
    }

    function selectAllItems() {
        selectedItems = filteredWatchlist().map((item: WatchlistItem) => item.id);
    }

    function clearSelection() {
        selectedItems = [];
        showBulkActions = false;
    }

    async function removeFromWatchlist(mediaId: string) {
        await userStore.removeFromWatchlist(mediaId);
    }

    async function markAsWatched(item: WatchlistItem) {
        await userStore.markAsWatched(
            item.mediaId,
            item.mediaType,
            item.mediaTitle,
            item.mediaPoster
        );
    }

    async function bulkRemove() {
        if (
            confirm(`Remove ${selectedItems.length} items from your watchlist?`)
        ) {
            for (const itemId of selectedItems) {
                const item = userStore.userWatchlist.find(
                    (i) => i.id === itemId,
                );
                if (item) {
                    await removeFromWatchlist(item.mediaId);
                }
            }
            clearSelection();
        }
    }

    async function bulkMarkWatched() {
        if (confirm(`Mark ${selectedItems.length} items as watched?`)) {
            for (const itemId of selectedItems) {
                const item = userStore.userWatchlist.find(
                    (i) => i.id === itemId,
                );
                if (item) {
                    await markAsWatched(item);
                }
            }
            clearSelection();
        }
    }

    async function addToWatchlist(event:Event) {
        event.preventDefault();

        if (!addMediaTitle.trim()) return;

        // In a real app, you'd search for the media and get its details
        const mockMediaId = Date.now().toString();

        await userStore.addToWatchlist(
            mockMediaId,
            addMediaType,
            addMediaTitle,
            undefined, // poster would come from search results
        );

        // Reset form
        showAddModal = false;
        addMediaTitle = "";
        addMediaType = "movie";
        addPriority = "medium";
        addNotes = "";
    }

    function getPriorityColor(priority: string): string {
        switch (priority) {
            case "high":
                return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
            case "medium":
                return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
            case "low":
                return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
            default:
                return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
        }
    }

    function formatDate(date: Date): string {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    }
</script>

<div class="space-y-6">
    <!-- Header -->
    <div
        class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
        <div>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
                My Watchlist
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
                {watchlistStats().total} items ({watchlistStats().movies} movies, {watchlistStats().tvShows}
                TV shows)
            </p>
        </div>

        {#if showAddButton}
            <Button
            variant="default"
                onclick={() => (showAddModal = true)}
                
            >
                <Plus class="w-4 h-4" />
                Add to Watchlist
            </Button>
        {/if}
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
            class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center gap-2">
                <Film class="w-5 h-5 text-blue-500" />
                <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Movies</span
                >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {watchlistStats().movies}
            </p>
        </div>

        <div
            class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center gap-2">
                <Tv class="w-5 h-5 text-purple-500" />
                <span class="text-sm text-gray-600 dark:text-gray-400"
                    >TV Shows</span
                >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {watchlistStats().tvShows}
            </p>
        </div>

        <div
            class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center gap-2">
                <AlertCircle class="w-5 h-5 text-red-500" />
                <span class="text-sm text-gray-600 dark:text-gray-400"
                    >High Priority</span
                >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {watchlistStats().highPriority}
            </p>
        </div>

        <div
            class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        >
            <div class="flex items-center gap-2">
                <Clock class="w-5 h-5 text-green-500" />
                <span class="text-sm text-gray-600 dark:text-gray-400"
                    >Total</span
                >
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {watchlistStats().total}
            </p>
        </div>
    </div>

    <!-- Controls -->
    <div
        class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
    >
        <div class="flex flex-col sm:flex-row gap-4">
            <!-- Search -->
            <div class="relative flex-1">
                <Search
                    class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                />
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search your watchlist..."
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
            </div>

            <!-- View Mode -->
            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                <button
                    onclick={() => (viewMode = "grid")}
                    class="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors
						{viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'}"
                >
                    <Grid class="w-4 h-4" />
                    Grid
                </button>
                <button
                    onclick={() => (viewMode = "list")}
                    class="flex items-center gap-2 px-3 py-1 rounded-md text-sm font-medium transition-colors
						{viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'}"
                >
                    <List class="w-4 h-4" />
                    List
                </button>
            </div>

            <!-- Filters -->
            <button
                onclick={() => (showFilters = !showFilters)}
                class="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
                <Filter class="w-4 h-4" />
                Filters
            </button>

            <!-- Sort -->
            <div class="flex items-center gap-2">
                <select
                    bind:value={sortBy}
                    class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                    <option value="added">Date Added</option>
                    <option value="title">Title</option>
                    <option value="year">Year</option>
                    <option value="priority">Priority</option>
                </select>

                <button
                    onclick={toggleSortOrder}
                    class="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    {#if sortOrder === "asc"}
                        <SortAsc class="w-4 h-4" />
                    {:else}
                        <SortDesc class="w-4 h-4" />
                    {/if}
                </button>
            </div>
        </div>

        <!-- Expanded Filters -->
        {#if showFilters}
            <div
                class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Type
                    </label>
                    <select
                        bind:value={filterType}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Types</option>
                        <option value="movie">Movies</option>
                        <option value="tv">TV Shows</option>
                    </select>
                </div>

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Priority
                    </label>
                    <select
                        bind:value={filterPriority}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>
                </div>
            </div>
        {/if}

        <!-- Bulk Actions -->
        {#if selectedItems.length > 0}
            <div
                class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
                <div class="flex items-center justify-between">
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                        {selectedItems.length} items selected
                    </p>
                    <div class="flex items-center gap-2">
                        <button
                            onclick={bulkMarkWatched}
                            class="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                        >
                            Mark Watched
                        </button>
                        <button
                            onclick={bulkRemove}
                            class="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
                        >
                            Remove
                        </button>
                        <button
                            onclick={clearSelection}
                            class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm font-medium transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        {/if}
    </div>

    <!-- Watchlist Content -->
    {#if filteredWatchlist().length === 0}
        <div
            class="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700"
        >
            {#if userStore.userWatchlist.length === 0}
                <Film class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3
                    class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                >
                    Your watchlist is empty
                </h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    Start adding movies and TV shows you want to watch
                </p>
                <button
                    onclick={() => (showAddModal = true)}
                    class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                    Add Your First Item
                </button>
            {:else}
                <Search class="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3
                    class="text-xl font-semibold text-gray-900 dark:text-white mb-2"
                >
                    No items match your filters
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                    Try adjusting your search or filter criteria
                </p>
            {/if}
        </div>
    {:else}
        <!-- Grid View -->
        {#if viewMode === "grid"}
            <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {#each filteredWatchlist() as item (item.id)}
                    <div
                        class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group hover:shadow-lg transition-shadow"
                    >
                        <!-- Selection checkbox -->
                        <div class="absolute top-2 left-2 z-10">
                            <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onchange={() => toggleItemSelection(item.id)}
                                class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                            />
                        </div>

                        <!-- Poster -->
                        <div class="relative h-64 bg-gray-200 dark:bg-gray-700">
                            {#if item.mediaPoster}
                                <img
                                    src={item.mediaPoster}
                                    alt="{item.mediaTitle} poster"
                                    class="w-full h-full object-cover"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center"
                                >
                                    {#if item.mediaType === "movie"}
                                        <Film class="w-16 h-16 text-gray-400" />
                                    {:else}
                                        <Tv class="w-16 h-16 text-gray-400" />
                                    {/if}
                                </div>
                            {/if}

                            <!-- Hover overlay -->
                            <div
                                class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            >
                                <div class="flex gap-2">
                                    <button
                                        onclick={() => markAsWatched(item)}
                                        class="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                                        title="Mark as watched"
                                    >
                                        <Eye class="w-4 h-4" />
                                    </button>
                                    <button
                                        onclick={() =>
                                            removeFromWatchlist(item.mediaId)}
                                        class="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                        title="Remove from watchlist"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Content -->
                        <div class="p-4">
                            <div class="flex items-start justify-between mb-2">
                                <h3
                                    class="font-semibold text-gray-900 dark:text-white line-clamp-2"
                                >
                                    {item.mediaTitle}
                                </h3>
                                <span
                                    class="text-xs px-2 py-1 rounded-full {getPriorityColor(
                                        item.priority,
                                    )} flex-shrink-0 ml-2"
                                >
                                    {item.priority}
                                </span>
                            </div>

                            <div
                                class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2"
                            >
                                {#if item.mediaType === "movie"}
                                    <Film class="w-4 h-4" />
                                {:else}
                                    <Tv class="w-4 h-4" />
                                {/if}
                                <span
                                    >{item.mediaType === "movie"
                                        ? "Movie"
                                        : "TV Show"}</span
                                >
                                {#if item.mediaYear}
                                    <span>• {item.mediaYear}</span>
                                {/if}
                            </div>

                            <div
                                class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500"
                            >
                                <Calendar class="w-3 h-3" />
                                Added {formatDate(item.addedAt)}
                            </div>

                            {#if item.notes}
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2"
                                >
                                    {item.notes}
                                </p>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <!-- List View -->
            <div
                class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
                {#each filteredWatchlist() as item, index (item.id)}
                    <div
                        class="flex items-center gap-4 p-4 {index > 0
                            ? 'border-t border-gray-200 dark:border-gray-700'
                            : ''} hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                        <!-- Selection -->
                        <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onchange={() => toggleItemSelection(item.id)}
                            class="w-4 h-4 text-blue-600 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                        />

                        <!-- Poster -->
                        <div
                            class="w-16 h-24 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0"
                        >
                            {#if item.mediaPoster}
                                <img
                                    src={item.mediaPoster}
                                    alt="{item.mediaTitle} poster"
                                    class="w-full h-full object-cover rounded"
                                />
                            {:else}
                                <div
                                    class="w-full h-full flex items-center justify-center"
                                >
                                    {#if item.mediaType === "movie"}
                                        <Film class="w-6 h-6 text-gray-400" />
                                    {:else}
                                        <Tv class="w-6 h-6 text-gray-400" />
                                    {/if}
                                </div>
                            {/if}
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between">
                                <div>
                                    <h3
                                        class="font-semibold text-gray-900 dark:text-white"
                                    >
                                        {item.mediaTitle}
                                    </h3>
                                    <div
                                        class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1"
                                    >
                                        {#if item.mediaType === "movie"}
                                            <Film class="w-4 h-4" />
                                        {:else}
                                            <Tv class="w-4 h-4" />
                                        {/if}
                                        <span
                                            >{item.mediaType === "movie"
                                                ? "Movie"
                                                : "TV Show"}</span
                                        >
                                        {#if item.mediaYear}
                                            <span>• {item.mediaYear}</span>
                                        {/if}
                                    </div>
                                    <div
                                        class="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500 mt-1"
                                    >
                                        <Calendar class="w-3 h-3" />
                                        Added {formatDate(item.addedAt)}
                                    </div>
                                </div>

                                <div class="flex items-center gap-2">
                                    <span
                                        class="text-xs px-2 py-1 rounded-full {getPriorityColor(
                                            item.priority,
                                        )}"
                                    >
                                        {item.priority}
                                    </span>
                                    <button
                                        onclick={() => markAsWatched(item)}
                                        class="p-2 text-gray-400 hover:text-green-600 transition-colors"
                                        title="Mark as watched"
                                    >
                                        <Eye class="w-4 h-4" />
                                    </button>
                                    <button
                                        onclick={() =>
                                            removeFromWatchlist(item.mediaId)}
                                        class="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                        title="Remove from watchlist"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {#if item.notes}
                                <p
                                    class="text-sm text-gray-600 dark:text-gray-400 mt-2"
                                >
                                    {item.notes}
                                </p>
                            {/if}
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</div>

<!-- Add to Watchlist Modal -->
{#if showAddModal}
    <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
        <div
            class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md"
        >
            <div
                class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
            >
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                    Add to Watchlist
                </h3>
                <button
                    onclick={() => (showAddModal = false)}
                    class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <X class="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <form
                onsubmit={addToWatchlist}
                class="p-6 space-y-4"
            >
                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Title
                    </label>
                    <input
                        type="text"
                        bind:value={addMediaTitle}
                        placeholder="Enter movie or TV show title"
                        required
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                </div>

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Type
                    </label>
                    <select
                        bind:value={addMediaType}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="movie">Movie</option>
                        <option value="tv">TV Show</option>
                    </select>
                </div>

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Priority
                    </label>
                    <select
                        bind:value={addPriority}
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div>
                    <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                        Notes (optional)
                    </label>
                    <textarea
                        bind:value={addNotes}
                        placeholder="Any notes about this item..."
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                    ></textarea>
                </div>

                <div class="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        variant='default'
                    >
                        Add to Watchlist
                    </Button>
                    <Button
                        type="button"
                        onclick={() => (showAddModal = false)}
                        variant="secondary"
                       
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    </div>
{/if}
