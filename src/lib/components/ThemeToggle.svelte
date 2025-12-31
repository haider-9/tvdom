<script lang="ts">
	import { Moon, Sun } from 'lucide-svelte';
	import { themeStore } from '$lib/stores/theme.svelte.js';
</script>

<button
	onclick={() => themeStore.toggleTheme()}
	class="p-2 rounded-md hover:bg-accent/10 transition-colors"
	aria-label="Toggle theme"
	disabled={!themeStore.mounted}
>
	{#if themeStore.theme === 'light'}
		<Moon class="w-5 h-5" />
	{:else}
		<Sun class="w-5 h-5" />
	{/if}
</button>
