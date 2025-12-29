<script lang="ts">
  import { onMount } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";

  type ThemePreset = "default" | "bubblegum" | "cyberpunk" | "doom65" | "claymorphism";

  let currentPreset = $state<ThemePreset>("default");

  const PRESET_STORAGE_KEY = "theme-preset";

  function applyPreset(preset: ThemePreset) {
    const root = document.documentElement;
    root.classList.remove(
      "theme-bubblegum",
      "theme-cyberpunk",
      "theme-doom65",
      "theme-claymorphism"
    );

    if (preset === "bubblegum") {
      root.classList.add("theme-bubblegum");
    } else if (preset === "cyberpunk") {
      root.classList.add("theme-cyberpunk");
    } else if (preset === "doom65") {
      root.classList.add("theme-doom65");
    } else if (preset === "claymorphism") {
      root.classList.add("theme-claymorphism");
    }

    currentPreset = preset;
    localStorage.setItem(PRESET_STORAGE_KEY, preset);
  }

  onMount(() => {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY) as ThemePreset | null;
    if (stored && ["default", "bubblegum", "cyberpunk", "doom65", "claymorphism"].includes(stored)) {
      applyPreset(stored);
    } else {
      applyPreset("default");
    }
  });
</script>

<svelte:head>
  <title>Settings - TVDom</title>
</svelte:head>

<div class="min-h-screen py-8">
  <div class="max-w-3xl mx-auto px-4 space-y-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold">Settings</h1>
      <p class="text-sm">
        Manage your TVDom experience.
      </p>
    </header>

    <Card.Root class="p-6 space-y-4">
      <h2 class="text-lg font-semibold">
        Appearance
      </h2>

      <!-- Light / Dark toggle (uses .dark class) -->
      <div class="flex items-center justify-between mb-4">
        <span class="text-sm">Mode</span>
        <ThemeToggle />
      </div>

      <!-- Theme presets -->
      <div class="space-y-3">
        <p class="text-xs">
          Color & font presets (generated with
          <a
            href="https://tweakcn.com/"
            target="_blank"
            rel="noreferrer"
            class="underline hover:text-primary"
            >tweakcn.com</a
          >
          )
        </p>
        <div class="grid gap-3 md:grid-cols-3">
          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-left text-xs md:text-sm transition-colors
              {currentPreset === 'default'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent/5'}"
            onclick={() => applyPreset('default')}
          >
            <div class="font-semibold mb-1">Default</div>
            <div class="text-[11px] text-muted-foreground">
              Montserrat + Fira Code
            </div>
          </button>

          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-left text-xs md:text-sm transition-colors
              {currentPreset === 'bubblegum'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent/5'}"
            onclick={() => applyPreset('bubblegum')}
          >
            <div class="font-semibold mb-1">Bubblegum</div>
            <div class="text-[11px] text-muted-foreground">
              Poppins + Fira Code
            </div>
          </button>

          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-left text-xs md:text-sm transition-colors
              {currentPreset === 'cyberpunk'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent/5'}"
            onclick={() => applyPreset('cyberpunk')}
          >
            <div class="font-semibold mb-1">Cyberpunk</div>
            <div class="text-[11px] text-muted-foreground">
              Outfit + Fira Code
            </div>
          </button>

          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-left text-xs md:text-sm transition-colors
              {currentPreset === 'doom65'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent/5'}"
            onclick={() => applyPreset('doom65')}
          >
            <div class="font-semibold mb-1">Doom 65</div>
            <div class="text-[11px] text-muted-foreground">
              Oxanium + Source Code Pro
            </div>
          </button>

          <button
            type="button"
            class="rounded-lg border px-3 py-2 text-left text-xs md:text-sm transition-colors
              {currentPreset === 'claymorphism'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:bg-accent/5'}"
            onclick={() => applyPreset('claymorphism')}
          >
            <div class="font-semibold mb-1">Claymorphism</div>
            <div class="text-[11px] text-muted-foreground">
              Plus Jakarta Sans + Roboto Mono
            </div>
          </button>
        </div>

        <!-- Font preview uses current CSS variables -->
        <div class="mt-3 space-y-1">
          <p class="text-[11px] uppercase tracking-wide text-muted-foreground">
            Preview
          </p>
          <p class="text-sm" style="font-family: var(--font-sans)">
            The quick brown fox jumps over the lazy dog.
          </p>
          <p class="text-xs" style="font-family: var(--font-mono)">
            const rating = 4.5; // Fira Code sample
          </p>
        </div>
      </div>
    </Card.Root>
  </div>
</div>
