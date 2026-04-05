<script lang="ts">
    import { Moon, Sun, Palette, Zap, Skull, Layers } from "lucide-svelte";
    import { themeStore } from "$lib/stores/theme.svelte.js";

    const currentTheme = $derived(themeStore.theme);
    const isInitialized = $derived(themeStore.isInitialized);

    function getThemeIcon() {
        switch (currentTheme) {
            case "dark":
                return Moon;
            case "light":
                return Sun;
            case "cyberpunk":
                return Zap;
            case "doom65":
                return Skull;
            case "claymorphism":
                return Layers;
            case "bubblegum":
            default:
                return Palette;
        }
    }

    function getThemeLabel() {
        switch (currentTheme) {
            case "dark":
                return "Dark";
            case "light":
                return "Light";
            case "cyberpunk":
                return "Cyberpunk";
            case "doom65":
                return "Doom 65";
            case "claymorphism":
                return "Clay";
            case "bubblegum":
            default:
                return "Bubblegum";
        }
    }
</script>

<button
    onclick={() => themeStore.toggleTheme()}
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
    {/if}
</button>
