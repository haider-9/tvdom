<script lang="ts">
  import { Search, Film, Tv, Users, Menu, X, LogIn, UserPlus, LogOut, User, ChevronDown } from "lucide-svelte";
  import logoUrl from "$lib/assets/logo.png";
  import { Dialog as DialogPrimitive } from "bits-ui";
  import { Input } from "$lib/components/ui/input";
  import ThemeToggle from "./ThemeToggle.svelte";
  import { userStore } from "$lib/stores/user.svelte.js";
  import { goto } from "$app/navigation";

  let searchQuery = $state("");

  let showUserDropdown = $state(false);
  let isSearching = $state(false);

  async function handleSearch(e: Event) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query || isSearching) return;

    isSearching = true;
    try {
      await goto(`/search?q=${encodeURIComponent(query)}`);
    } finally {
      isSearching = false;
    }
  }

  function handleLogout() {
    userStore.logout();
    showUserDropdown = false;
  }

  function closeDropdown() {
    showUserDropdown = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeDropdown();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<nav
  class="sticky top-0 z-[55] bg-gradient-to-b from-transparent to-card/80 backdrop-blur-md shadow-sm relative"
>
  {#if isSearching}
    <div class="absolute left-0 right-0 top-0 h-[2px] overflow-hidden">
      <div class="h-full bg-primary animate-search-bar"></div>
    </div>
  {/if}
  <div class="mx-auto w-full max-w-[85rem] px-4">
    <div class="flex items-center justify-between h-16">
      <!-- Logo + brand -->
      <div class="flex items-center gap-4">
        <a href="/" class="flex items-center gap-3">
          <div class="rounded-md p-1">
            <img
              src={logoUrl}
              alt="TVDom logo"
              class="size-10 object-contain object-center"
            />
          </div>
        </a>
        <span class="hidden md:inline-block text-sm text-muted-foreground"
          >Discover movies & TV shows</span
        >
      </div>

      <!-- Centered search (larger on desktop) -->
      <div class="flex-1 mx-6 hidden md:flex items-center justify-center">
        <form onsubmit={handleSearch} class="w-full max-w-lg">
          <div class="relative">
            <Search
              class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
            />
            <Input
              type="text"
              bind:value={searchQuery}
              placeholder="Search movies, TV shows, people..."
              class="pl-10 pr-4"
            />
          </div>
        </form>
      </div>

      <!-- Desktop links + actions -->
      <div class="hidden md:flex items-center gap-4">
        <a
          href="/movies"
          class="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <Film class="w-4 h-4" />
          <span>Movies</span>
        </a>
        <a
          href="/tv"
          class="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <Tv class="w-4 h-4" />
          <span>TV</span>
        </a>
        <a
          href="/people"
          class="text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2"
        >
          <Users class="w-4 h-4" />
          <span>People</span>
        </a>

        <!-- Auth section -->
        {#if userStore.isAuthenticated}
          <!-- Authenticated user with dropdown -->
          <div class="relative ml-4">
            <button
              onclick={() => showUserDropdown = !showUserDropdown}
              class="flex items-center gap-2 p-1 rounded-lg hover:bg-accent/10 transition-colors"
              aria-label="User menu"
            >
              <!-- Profile picture -->
              <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                {#if userStore.user?.avatar}
                  <img
                    src={userStore.user.avatar}
                    alt="{userStore.user.displayName}'s avatar"
                    class="w-full h-full object-cover"
                  />
                {:else}
                  <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span class="text-white text-sm font-bold">
                      {userStore.user?.displayName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                {/if}
              </div>
              <ChevronDown class="w-4 h-4 text-muted-foreground" />
            </button>

            <!-- Dropdown menu -->
            {#if showUserDropdown}
              <!-- Click outside overlay -->
              <button 
                class="fixed inset-0 z-[70]" 
                onclick={closeDropdown}
                aria-label="Close dropdown"
                tabindex="-1"
              ></button>
              
              <div class="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-lg shadow-lg p-2 z-[75]">
                <!-- User info -->
                <div class="px-3 py-2 border-b border-border mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden">
                      {#if userStore.user?.avatar}
                        <img
                          src={userStore.user.avatar}
                          alt="{userStore.user.displayName}'s avatar"
                          class="w-full h-full object-cover"
                        />
                      {:else}
                        <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span class="text-white font-bold">
                            {userStore.user?.displayName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      {/if}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-foreground truncate">
                        {userStore.user?.displayName}
                      </p>
                      <p class="text-xs text-muted-foreground truncate">
                        @{userStore.user?.username}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Menu items -->
                <div class="space-y-1">
                  <a
                    href="/profile"
                    class="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-foreground hover:bg-accent rounded-md transition-colors"
                    onclick={closeDropdown}
                  >
                    <User class="w-4 h-4" />
                    <span>Profile</span>
                  </a>

                  <hr class="my-2 border-border" />

                  <button
                    onclick={handleLogout}
                    class="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  >
                    <LogOut class="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            {/if}
          </div>
        {:else}
          <!-- Not authenticated -->
          <div class="flex items-center gap-2 ml-4">
            <a
              href="/login"
              class="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:text-primary transition-colors rounded-md hover:bg-accent/10"
            >
              <LogIn class="w-4 h-4" />
              <span>Sign In</span>
            </a>
            <a
              href="/signup"
              class="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors rounded-md"
            >
              <UserPlus class="w-4 h-4" />
              <span>Sign Up</span>
            </a>
          </div>
        {/if}

        <ThemeToggle />
      </div>

      <!-- Mobile controls using Dialog sheet -->
      <div class="flex items-center md:hidden">
        <DialogPrimitive.Root>
          <DialogPrimitive.Trigger
            class="p-2 rounded-md hover:bg-accent/10"
            aria-label="Open menu"
          >
            <Menu class="w-6 h-6" />
          </DialogPrimitive.Trigger>

          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay
              class="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            />

            <DialogPrimitive.Content
              class="sheet-content fixed left-0 top-0 w-full max-h-[70vh] bg-background p-4 shadow-lg rounded-b-lg z-[70]"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="rounded-md p-1 bg-primary/10 overflow-hidden">
                    <img
                      src={logoUrl}
                      alt="TVDom logo"
                      class="w-6 h-6 object-contain"
                    />
                  </div>
                </div>
                <DialogPrimitive.Close
                  class="p-2 rounded-md hover:bg-accent/10"
                  aria-label="Close menu"
                >
                  <X class="w-5 h-5" />
                </DialogPrimitive.Close>
              </div>

              <form onsubmit={handleSearch} class="mb-4">
                <div class="relative">
                  <Search
                    class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                  />
                  <Input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Search..."
                    class="pl-10 pr-4"
                  />
                </div>
              </form>

              <nav class="flex flex-col gap-2">
                <a
                  href="/movies"
                  class="flex items-center gap-3 p-2 rounded-md hover:bg-accent/5"
                >
                  <Film class="w-5 h-5" />
                  <span>Movies</span>
                </a>
                <a
                  href="/tv"
                  class="flex items-center gap-3 p-2 rounded-md hover:bg-accent/5"
                >
                  <Tv class="w-5 h-5" />
                  <span>TV Shows</span>
                </a>
                <a
                  href="/people"
                  class="flex items-center gap-3 p-2 rounded-md hover:bg-accent/5"
                >
                  <Users class="w-5 h-5" />
                  <span>People</span>
                </a>
                
                <!-- Auth section -->
                <div class="border-t border-border mt-2 pt-2">
                  {#if userStore.isAuthenticated}
                    <!-- Authenticated user -->
                    <a href="/profile" class="flex items-center gap-3 p-2 mb-2 rounded-md hover:bg-accent/5">
                      <div class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        {#if userStore.user?.avatar}
                          <img
                            src={userStore.user.avatar}
                            alt="{userStore.user.displayName}'s avatar"
                            class="w-full h-full object-cover"
                          />
                        {:else}
                          <div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span class="text-white text-sm font-bold">
                              {userStore.user?.displayName?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        {/if}
                      </div>
                      <div>
                        <p class="font-medium text-sm">{userStore.user?.displayName}</p>
                        <p class="text-xs text-muted-foreground">@{userStore.user?.username}</p>
                      </div>
                    </a>
                    
                    <button
                      onclick={handleLogout}
                      class="flex items-center gap-3 p-2 rounded-md hover:bg-accent/5 text-red-600 w-full text-left"
                    >
                      <LogOut class="w-5 h-5" />
                      <span>Sign Out</span>
                    </button>
                  {:else}
                    <!-- Not authenticated -->
                    <a
                      href="/login"
                      class="flex items-center gap-3 p-2 rounded-md hover:bg-accent/5"
                    >
                      <LogIn class="w-5 h-5" />
                      <span>Sign In</span>
                    </a>
                    <a
                      href="/signup"
                      class="flex items-center gap-3 p-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <UserPlus class="w-5 h-5" />
                      <span>Sign Up</span>
                    </a>
                  {/if}
                </div>
                
                <div class="flex items-center gap-3 p-2 border-t border-border mt-2 pt-2">
                  <ThemeToggle />
                  <span>Theme</span>
                </div>
              </nav>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>
    </div>
  </div>
</nav>



<style>
  /* Sheet enter/exit animations for the dialog content. bits-ui sets a data-state attribute
	   on the content element (open / closed). We use transform + opacity for a smooth slide. */
  .sheet-content {
    transform: translateY(-100%);
    opacity: 0;
    transition:
      transform 260ms cubic-bezier(0.2, 0.9, 0.2, 1),
      opacity 180ms linear;
    will-change: transform, opacity;
    left: 0;
    right: 0;
    z-index: 70;
  }

  .sheet-content[data-state="open"] {
    transform: translateY(0%);
    opacity: 1;
  }

  .sheet-content[data-state="closed"] {
    transform: translateY(-100%);
    opacity: 0;
  }

  /* Overlay fade transitions */
  :global([data-bits-dialog-overlay]) {
    opacity: 0;
    transition: opacity 200ms linear;
    z-index: 60 !important;
  }
  
  :global([data-bits-dialog-overlay][data-state="open"]) {
    opacity: 1;
  }

  /* Top search progress bar animation */
  @keyframes search-bar-indeterminate {
    0% {
      transform: translateX(-100%);
    }
    50% {
      transform: translateX(-20%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  .animate-search-bar {
    width: 30%;
    animation: search-bar-indeterminate 1.1s ease-in-out infinite;
  }
</style>
