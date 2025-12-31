<script lang="ts">
    import { Moon, Sun, Palette } from "lucide-svelte";
    import { themeStore } from "$lib/stores/theme.svelte.js";

    const currentTheme = $derived(themeStore.theme);
    const isInitialized = $derived(themeStore.isInitialized);

    function getThemeIcon() {
        switch (currentTheme) {
            case "dark":
                return Moon;
            case "light":
                return Sun;
            case "bubblegum":
            default:
                return Palette;
        }
    }
</script>

<button
    onclick={() => themeStore.toggleTheme()}
    class="p-2 rounded-lg hover:bg-accent/10 transition-colors disabled:opacity-50"
    aria-label="Toggle theme (current: {currentTheme})"
    disabled={!isInitialized}
>
    {#if !isInitialized}
        <div
            class="w-5 h-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
        ></div>
    {:else}
        {@const IconComponent = getThemeIcon()}
        <IconComponent
            class="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors"
        />
    {/if}
</button>
