<script lang="ts">
	import PersonCard from '$lib/components/PersonCard.svelte';
	import { ChevronLeft, ChevronRightIcon, Users } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>People & Characters - TVDom</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Hero Section -->
	<div class="bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border-b border-border">
		<div class="container mx-auto px-4 md:px-8 py-16 md:py-24">
			<div class="flex items-center gap-4 mb-4">
				<Users class="w-12 h-12 md:w-14 md:h-14 text-primary" />
				<h1 class="text-5xl md:text-6xl font-bold text-foreground">Popular People</h1>
			</div>
			<p class="text-xl md:text-2xl text-muted-foreground">
				Discover talented actors, directors, and creators
			</p>
		</div>
	</div>

	<main class="py-12">
		<section class="mb-16">
			<div class="container mx-auto px-4 md:px-8">
				{#if data.people.length === 0}
					<p class="text-muted-foreground text-center py-12">No people to show right now.</p>
				{:else}
					<div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{#each data.people as person}
							<PersonCard {person} />
						{/each}
					</div>
				{/if}

				{#if data.totalPages > 1}
					<div class="flex justify-center items-center gap-4 mt-12">
						{#if data.currentPage > 1}
							<a href={`/people?page=${data.currentPage - 1}`}>
								<Button 
									variant="outline" 
									class="px-6 py-6"
								>
									<ChevronLeft/> Previous
								</Button>
							</a>
						{/if}

						<Badge variant="secondary" class="px-6 py-3 text-base">
							Page {data.currentPage} of {Math.min(data.totalPages, 500)}
						</Badge>

						{#if data.currentPage < data.totalPages && data.currentPage < 500}
							<a href={`/people?page=${data.currentPage + 1}`}>
								<Button 
									variant="outline" 
									class="px-6 py-6"
								>
									Next <ChevronRightIcon/>
								</Button>
							</a>
						{/if}
					</div>
				{/if}
			</div>
		</section>
	</main>
</div>




