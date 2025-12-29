<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
</script>

<svelte:head>
  <title>Settings - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="max-w-3xl mx-auto px-4 space-y-6">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Manage your TVDom experience.
      </p>
    </header>

    <Card.Root class="p-6 space-y-4">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
        Appearance
      </h2>
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-700 dark:text-gray-300">Theme</span>
        <ThemeToggle />
      </div>
    </Card.Root>
  </div>
</div>
