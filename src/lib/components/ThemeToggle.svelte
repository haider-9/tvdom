<script lang="ts">
    import { Moon, Sun, Palette, Zap, Skull, Layers, ChevronDown } from "lucide-svelte";
    import { themeStore } from "$lib/stores/theme.svelte.js";

    let { placement = "bottom-end" }: { placement?: "bottom-end" | "top-start" } = $props();

    const currentTheme = $derived(themeStore.theme);
    const isInitialized = $derived(themeStore.isInitialized);
    let showDropdown = $state(false);

    const themes = [
        { id: "light", label: "Light", icon: Sun },
        { id: "dark", label: "Dark", icon: Moon },
        { id: "bubblegum", label: "Bubblegum", icon: Palette },
        { id: "cyberpunk", label: "Cyberpunk", icon: Zap },
        { id: "doom65", label: "Doom 65", icon: Skull },
        { id: "claymorphism", label: "Clay", icon: Layers }
    ] as const;

    function getThemeIcon() {
        const theme = themes.find(t => t.id === currentTheme);
        return theme ? theme.icon : Palette;
    }

    function getThemeLabel() {
        const theme = themes.find(t => t.id === currentTheme);
        return theme ? theme.label : "Theme";
    }

    function closeDropdown() {
        showDropdown = false;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === "Escape") {
            closeDropdown();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="relative inline-block">
    <button
        onclick={() => (showDropdown = !showDropdown)}
        class="group p-2 rounded-lg hover:bg-accent/10 transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        aria-label="Toggle theme (current: {currentTheme})"
        disabled={!isInitialized}
        title="Current theme: {getThemeLabel()}"
    >
        {#if !isInitialized}
            <div
                class="w-5 h-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
            ></div>
        {:else}
            {@const IconComponent = getThemeIcon()}
            <IconComponent
                class="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors duration-300"
            />
            <span class="hidden sm:inline text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                {getThemeLabel()}
            </span>
            <ChevronDown class="hidden sm:block w-3 h-3 text-muted-foreground transition-transform {showDropdown ? 'rotate-180' : ''}" />
        {/if}
    </button>

    {#if showDropdown}
        <button
            class="fixed inset-0 z-[70]"
            onclick={closeDropdown}
            aria-label="Close dropdown"
            tabindex="-1"
        ></button>
        <div class="absolute {placement === 'top-start' ? 'bottom-full left-0 mb-2' : 'top-full right-0 mt-2'} w-40 bg-background border border-border rounded-lg shadow-lg py-1 z-[75]">
            {#each themes as theme}
                {@const ThemeIcon = theme.icon}
                <button
                    class="flex items-center gap-3 w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors {currentTheme === theme.id ? 'text-primary font-medium' : 'text-foreground'}"
                    onclick={() => {
                        themeStore.setTheme(theme.id);
                        closeDropdown();
                    }}
                >
                    <ThemeIcon class="w-4 h-4" />
                    <span>{theme.label}</span>
                </button>
            {/each}
        </div>
    {/if}
</div>
