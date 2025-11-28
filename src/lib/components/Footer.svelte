<script lang="ts">
	import { Film, Github, Heart, Twitter, Mail, ArrowUp } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import logoUrl from '$lib/assets/logo.png';

	let email = '';
	let subscribed = false;

	function handleSubscribe(e: Event) {
		e.preventDefault();
		if (!email.trim()) return;
		subscribed = true;
		// In a real app you'd POST to an API here.
		console.log('subscribe:', email);
		email = '';
		setTimeout(() => (subscribed = false), 3000);
	}
</script>

<footer class="bg-card border-t border-border mt-16">
	<div class="max-w-[85rem] mx-auto px-4 py-10">
		<div class="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-8">
			<!-- Brand -->
			<div>
				<div class="flex items-center gap-2 mb-3">
					<img src={logoUrl} alt="TVDom logo" class="w-8 h-8 text-primary" />
					<span class="text-2xl font-bold text-foreground">TVDom</span>
				</div>
				<p class="text-muted-foreground mb-4">
					Discover and track movies, TV shows, and the people who make them.
				</p>
				<div class="flex items-center gap-3">
					<a href="https://github.com/" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground transition-colors">
						<Github class="w-5 h-5" />
					</a>
					<a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" class="text-muted-foreground hover:text-foreground transition-colors">
						<Twitter class="w-5 h-5" />
					</a>
				</div>
			</div>

			<!-- Links -->
			<div>
				<h3 class="font-semibold text-foreground mb-3">Explore</h3>
				<ul class="space-y-2 text-muted-foreground">
					<li><a href="/movies" class="hover:text-primary transition-colors">Movies</a></li>
					<li><a href="/tv" class="hover:text-primary transition-colors">TV Shows</a></li>
					<li><a href="/people" class="hover:text-primary transition-colors">People</a></li>
					<li><a href="/search" class="hover:text-primary transition-colors">Search</a></li>
				</ul>
			</div>

			<!-- Resources -->
			<div>
				<h3 class="font-semibold text-foreground mb-3">Resources</h3>
				<ul class="space-y-2 text-muted-foreground">
					<li><a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" class="hover:text-primary transition-colors">TMDB</a></li>
					<li><a href="/about" class="hover:text-primary transition-colors">About</a></li>
					<li><a href="/privacy" class="hover:text-primary transition-colors">Privacy</a></li>
				</ul>
			</div>

			<!-- Newsletter -->
			<div>
				<h3 class="font-semibold text-foreground mb-3">Stay in the loop</h3>
				<p class="text-muted-foreground mb-3">Get occasional updates about new features and top picks.</p>
				<form on:submit|preventDefault={handleSubscribe} class="flex gap-2">
					<Input type="email" bind:value={email} placeholder="Your email" class="flex-1" />
					<Button type="submit">Subscribe</Button>
				</form>
				{#if subscribed}
					<p class="text-sm text-green-500 mt-2">Thanks — check your inbox!</p>
				{/if}
				<div class="mt-4 text-muted-foreground text-sm flex items-center gap-2">
					<Mail class="w-4 h-4" />
					<span>support@tvdom.local</span>
				</div>
			</div>
		</div>

		<div class="border-t border-border mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
			<p class="text-muted-foreground text-sm flex items-center gap-2">
				<span>Made with</span>
				<Heart class="w-4 h-4 fill-red-500 text-red-500" />
				<span>using SvelteKit</span>
			</p>

			<div class="flex items-center gap-4">
				<a href="#top" class="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
					<ArrowUp class="w-4 h-4" />
					<span class="text-sm">Back to top</span>
				</a>
				<p class="text-muted-foreground text-sm">© {new Date().getFullYear()} TVDom</p>
			</div>
		</div>
	</div>
</footer>
