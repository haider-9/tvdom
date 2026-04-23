<script lang="ts">
	import { Play } from 'lucide-svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		title: string;
		trailerKey?: string;
	}

	let { title, trailerKey }: Props = $props();
</script>

<Dialog.Root>
	<Dialog.Trigger class="inline-flex">
		<span class="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-border/60 text-sm cursor-pointer">
			<Play class="w-4 h-4" />
			Watch Trailer
		</span>
	</Dialog.Trigger>
	<Dialog.Content class="max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>{title} - Trailer</Dialog.Title>
			<Dialog.Description>Watch the official trailer</Dialog.Description>
		</Dialog.Header>
		<div class="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
			{#if trailerKey}
				<iframe
					width="100%"
					height="100%"
					src="https://www.youtube.com/embed/{trailerKey}?autoplay=0&rel=0&modestbranding=1"
					title="{title} - Official Trailer"
					frameborder="0"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowfullscreen
					class="rounded-lg"
					loading="lazy"
				></iframe>
			{:else}
				<div class="flex flex-col items-center gap-3 text-muted-foreground">
					<Play class="w-12 h-12" />
					<p class="text-sm">Trailer not available</p>
				</div>
			{/if}
		</div>
	</Dialog.Content>
</Dialog.Root>
