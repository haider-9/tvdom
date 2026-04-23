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
		<Button variant="outline" size="lg" class="gap-2 px-6 py-6 text-base">
			<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
				<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
			</svg>
			Trailer
		</Button>
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
