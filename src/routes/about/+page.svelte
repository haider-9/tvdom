<script lang="ts">
    import {
        Film,
        Tv,
        Star,
        Heart,
        Users,
        MessageSquare,
        Clapperboard,
        Globe,
        Github,
        ExternalLink,
        Database,
        Bookmark,
        Search,
    } from "lucide-svelte";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";

    const githubUser = "haider-9";
    const avatar = `https://github.com/${githubUser}.png`;

    const features = [
        { icon: Film,          title: "Movies",      desc: "Browse trending, popular, and top-rated films from every genre." },
        { icon: Tv,            title: "TV Shows",     desc: "Follow series, see episode guides, and track what you're watching." },
        { icon: Star,          title: "Ratings",      desc: "Rate and review titles. See what the community thinks before you watch." },
        { icon: Bookmark,      title: "Watchlist",    desc: "Save titles to your personal watchlist and mark them as watched." },
        { icon: Users,         title: "People",       desc: "Explore actor and director profiles, filmographies, and career highlights." },
        { icon: Clapperboard,  title: "Characters",   desc: "Browse iconic anime and manga characters sorted by popularity." },
        { icon: MessageSquare, title: "Community",    desc: "Post, comment, and connect with other entertainment fans." },
        { icon: Search,        title: "Search",       desc: "Find any movie, show, or person instantly across the full TMDB database." },
    ];

    const techStack = [
        { name: "SvelteKit",    color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
        { name: "Svelte 5",     color: "bg-orange-400/10 text-orange-400 border-orange-400/20" },
        { name: "TypeScript",   color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
        { name: "Tailwind v4",  color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
        { name: "Appwrite",     color: "bg-pink-500/10 text-pink-500 border-pink-500/20" },
        { name: "TMDB API",     color: "bg-green-500/10 text-green-500 border-green-500/20" },
        { name: "Cloudinary",   color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
        { name: "Vercel",       color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
    ];
</script>

<svelte:head>
    <title>About - TVDom</title>
    <meta name="description" content="TVDom is a free platform for discovering, tracking, and discussing movies, TV shows, and the people who make them. Powered by TMDB." />
    <meta property="og:title" content="About - TVDom" />
    <meta property="og:description" content="Learn about TVDom — a free platform for discovering, tracking, and discussing movies, TV shows, and the people who make them." />
    <meta property="og:url" content="https://tvdom.vercel.app/about" />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="About - TVDom" />
    <meta name="twitter:description" content="Learn about TVDom — a free platform for discovering, tracking, and discussing movies and TV shows." />
    <link rel="canonical" href="https://tvdom.vercel.app/about" />
</svelte:head>

<div class="min-h-screen">
    <main class="container mx-auto px-4 md:px-8 py-10 md:py-14 space-y-16">

        <!-- Page header — same pattern as /movies, /people -->
        <section class="space-y-2">
            <div class="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Film class="w-4 h-4" />
                <span>About TVDom</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
                What is TVDom?
            </h1>
            <p class="max-w-2xl text-sm md:text-base text-muted-foreground">
                A free platform for discovering movies, TV shows, anime characters, and the people who make them.
                Built by a solo developer, powered by TMDB.
            </p>
        </section>

        <!-- Features grid -->
        <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">What you can do</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {#each features as f}
                    <div class="rounded-lg border border-border bg-card p-5 space-y-2 hover:border-primary/40 transition-colors">
                        <div class="flex items-center gap-2 text-primary">
                            <f.icon class="w-4 h-4" />
                            <span class="text-sm font-semibold text-foreground">{f.title}</span>
                        </div>
                        <p class="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                {/each}
            </div>
        </section>

        <!-- Developer -->
        <section class="space-y-6">
            <h2 class="text-xl font-semibold text-foreground">The developer</h2>

            <div class="flex flex-col sm:flex-row gap-6 items-start">
                <img
                    src={avatar}
                    alt="Haider Ahmad"
                    class="w-20 h-20 rounded-full border-2 border-border object-cover flex-shrink-0"
                />
                <div class="space-y-3">
                    <div>
                        <p class="font-semibold text-foreground">Haider Ahmad</p>
                        <p class="text-sm text-muted-foreground">@{githubUser}</p>
                    </div>
                    <p class="text-sm text-muted-foreground leading-relaxed max-w-xl">
                        Built TVDom as a personal project to explore SvelteKit, Svelte 5 runes, Tailwind CSS v4,
                        and Appwrite — while making something actually useful for movie and TV fans.
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <Button
                            href="https://github.com/{githubUser}"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            class="gap-2 h-8 text-xs"
                        >
                            <Github class="w-3.5 h-3.5" />
                            GitHub
                        </Button>
                        <Button
                            href="https://github.com/{githubUser}/tvdom"
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="outline"
                            class="gap-2 h-8 text-xs"
                        >
                            <ExternalLink class="w-3.5 h-3.5" />
                            Source code
                        </Button>
                    </div>
                </div>
            </div>
        </section>

        <!-- Tech stack -->
        <section class="space-y-4">
            <h2 class="text-xl font-semibold text-foreground">Built with</h2>
            <div class="flex flex-wrap gap-2">
                {#each techStack as tech}
                    <Badge variant="outline" class="px-3 py-1 text-xs font-medium {tech.color}">
                        {tech.name}
                    </Badge>
                {/each}
            </div>
        </section>

        <!-- TMDB attribution -->
        <section class="rounded-lg border border-border bg-card p-5">
            <div class="flex items-start gap-3">
                <Database class="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div class="space-y-1">
                    <p class="text-sm font-medium text-foreground">Powered by TMDB</p>
                    <p class="text-xs text-muted-foreground leading-relaxed">
                        All movie and TV show data — titles, posters, cast, crew, and ratings — is provided by
                        <a
                            href="https://www.themoviedb.org/"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-primary hover:underline"
                        >The Movie Database (TMDB)</a>.
                        This product uses the TMDB API but is not endorsed or certified by TMDB.
                    </p>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="flex flex-wrap gap-3 pb-4">
            <Button href="/movies" class="gap-2">
                <Film class="w-4 h-4" />
                Browse Movies
            </Button>
            <Button href="/tv" variant="outline" class="gap-2">
                <Tv class="w-4 h-4" />
                Browse TV Shows
            </Button>
            <Button href="/signup" variant="outline" class="gap-2">
                <Heart class="w-4 h-4" />
                Create account
            </Button>
        </section>

    </main>
</div>
