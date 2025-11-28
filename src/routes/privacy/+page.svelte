<script lang="ts">
	import { ShieldCheck, Workflow, HandHeart, Server, Mail } from 'lucide-svelte';

	const lastUpdated = 'November 28, 2025';

	const sections = [
		{
			title: 'What we collect',
			icon: ShieldCheck,
			content: [
				'Anonymous usage statistics (page views, popular searches) to understand how the site performs.',
				'Your TMDB queries — only for the duration of your session — so we can fetch matching data.',
				'Optional newsletter emails when you explicitly submit the form in the footer.'
			]
		},
		{
			title: 'How we use it',
			icon: Workflow,
			content: [
				'Operate the core experience of browsing movies, shows, and people.',
				'Improve performance and highlight content that visitors actually care about.',
				'Send rare product updates if you opted into the newsletter — no promotions from third parties.'
			]
		},
		{
			title: 'Your choices',
			icon: HandHeart,
			content: [
				'Use the site without creating an account or providing personal data.',
				'Clear your browser data to remove local preferences such as theme selection.',
				'Reach out anytime to have email subscriptions removed permanently.'
			]
		}
	];
</script>

<section class="mx-auto max-w-4xl px-4 py-12 space-y-8">
	<div class="bg-card border border-border rounded-lg p-6 shadow-sm space-y-4">
		<p class="text-sm text-muted-foreground">Last updated {lastUpdated}</p>
		<h1 class="text-3xl font-semibold">Privacy Policy</h1>
		<p class="text-muted-foreground">
			TVDom is a hobby project that surfaces data from The Movie Database (TMDB). We only collect the
			minimum information required to run this experience and never sell or share it with advertisers.
		</p>
	</div>

	<div class="bg-card border border-border rounded-lg divide-y divide-border">
		{#each sections as section}
			<div class="p-6 space-y-3">
				<div class="flex items-center gap-3">
					<svelte:component this={section.icon} class="w-5 h-5 text-primary" />
					<h2 class="text-xl font-semibold">{section.title}</h2>
				</div>
				<ul class="list-disc list-inside space-y-2 text-muted-foreground">
					{#each section.content as item}
						<li>{item}</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>

	<div class="bg-card border border-border rounded-lg p-6 space-y-4">
		<div class="flex items-center gap-3">
			<Server class="w-5 h-5 text-primary" />
			<h3 class="text-xl font-semibold">Third-party services</h3>
		</div>
		<p class="text-muted-foreground">
			All movie and TV metadata is delivered by TMDB. When you run a search, we proxy the request to
			TMDB&apos;s API from our server endpoints so your IP address is not shared directly with TMDB.
			TMDB does not endorse or certify this project.
		</p>
		<p class="text-muted-foreground">
			Basic analytics (page views and load times) may be collected using privacy-friendly tooling that
			does not set marketing cookies or build profiles.
		</p>
	</div>

	<div class="bg-card border border-border rounded-lg p-6 space-y-3">
		<div class="flex items-center gap-3">
			<Mail class="w-5 h-5 text-primary" />
			<h3 class="text-xl font-semibold">Contact</h3>
		</div>
		<p class="text-muted-foreground">
			Questions about this policy? Email
			<a href="mailto:support@tvdom.local" class="text-primary hover:underline">support@tvdom.local</a>
			and we&apos;ll get back to you.
		</p>
	</div>
</section>

