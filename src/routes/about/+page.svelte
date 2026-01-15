<script lang="ts">
    import { Film, Users, Star, Heart, Github } from "lucide-svelte";

    const githubUser = "haider-9";
    const avatar = `https://github.com/${githubUser}.png`;
</script>

<svelte:head>
    <title>About - TVDom</title>
</svelte:head>

<div class="about-page">
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="icon-wrapper">
                <Film class="w-12 h-12" />
            </div>
            <h1>About TVDom</h1>
            <p class="tagline">Your personal movie and TV show companion</p>
        </div>

        <!-- What is TVDom -->
        <section class="section">
            <h2>What is TVDom?</h2>
            <p>
                TVDom is a platform for discovering, tracking, and sharing your favorite movies and TV shows. 
                Keep track of what you've watched, create watchlists, rate content, and connect with other enthusiasts.
            </p>
        </section>

        <!-- Features -->
        <section class="section">
            <h2>Features</h2>
            <div class="features-grid">
                <div class="feature">
                    <Film class="feature-icon" />
                    <h3>Discover</h3>
                    <p>Browse trending movies and TV shows</p>
                </div>
                <div class="feature">
                    <Heart class="feature-icon" />
                    <h3>Track</h3>
                    <p>Manage your watchlist and viewing history</p>
                </div>
                <div class="feature">
                    <Star class="feature-icon" />
                    <h3>Rate</h3>
                    <p>Rate and review what you watch</p>
                </div>
                <div class="feature">
                    <Users class="feature-icon" />
                    <h3>Connect</h3>
                    <p>Follow friends and see what they're watching</p>
                </div>
            </div>
        </section>

        <!-- Developer -->
        <section class="section">
            <h2>Developer</h2>
            <div class="developer-card">
                <img src={avatar} alt="Haider" class="avatar" />
                <div class="developer-info">
                    <h3>Haider</h3>
                    <p>
                        Built TVDom as a personal project to explore modern web technologies 
                        and create something useful for movie and TV show fans.
                    </p>
                    <a 
                        href="https://github.com/{githubUser}" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        class="github-link"
                    >
                        <Github class="w-4 h-4" />
                        View on GitHub
                    </a>
                </div>
            </div>
        </section>

        <!-- Tech Stack -->
        <section class="section">
            <h2>Built With</h2>
            <div class="tech-list">
                <span class="tech-tag">SvelteKit</span>
                <span class="tech-tag">TypeScript</span>
                <span class="tech-tag">MongoDB</span>
                <span class="tech-tag">Tailwind CSS</span>
                <span class="tech-tag">TMDB API</span>
            </div>
        </section>

        <!-- Data Source -->
        <section class="section">
            <h2>Data Source</h2>
            <p>
                Movie and TV show data is provided by 
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" class="link">
                    The Movie Database (TMDB)
                </a>. 
                This product uses the TMDB API but is not endorsed or certified by TMDB.
            </p>
        </section>
    </div>
</div>

<style>
    .about-page {
        min-height: 100vh;
        padding: 4rem 0;
    }

    .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 0 1.5rem;
    }

    .header {
        text-align: center;
        margin-bottom: 4rem;
    }

    .icon-wrapper {
        display: inline-flex;
        padding: 1rem;
        background: hsl(var(--primary) / 0.1);
        border-radius: 1rem;
        color: hsl(var(--primary));
        margin-bottom: 1.5rem;
    }

    h1 {
        font-size: 2.5rem;
        font-weight: 700;
        color: hsl(var(--foreground));
        margin-bottom: 0.75rem;
    }

    .tagline {
        font-size: 1.125rem;
        color: hsl(var(--muted-foreground));
    }

    .section {
        margin-bottom: 3rem;
    }

    h2 {
        font-size: 1.75rem;
        font-weight: 600;
        color: hsl(var(--foreground));
        margin-bottom: 1rem;
    }

    p {
        font-size: 1rem;
        line-height: 1.7;
        color: hsl(var(--muted-foreground));
    }

    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-top: 1.5rem;
    }

    .feature {
        padding: 1.5rem;
        background: hsl(var(--card));
        border: 1px solid hsl(var(--border));
        border-radius: 0.75rem;
        text-align: center;
    }

    .feature-icon {
        width: 2rem;
        height: 2rem;
        color: hsl(var(--primary));
        margin: 0 auto 1rem;
    }

    .feature h3 {
        font-size: 1.125rem;
        font-weight: 600;
        color: hsl(var(--foreground));
        margin-bottom: 0.5rem;
    }

    .feature p {
        font-size: 0.875rem;
        color: hsl(var(--muted-foreground));
    }

    .developer-card {
        display: flex;
        gap: 1.5rem;
        padding: 2rem;
        background: hsl(var(--card));
        border: 1px solid hsl(var(--border));
        border-radius: 0.75rem;
        margin-top: 1.5rem;
    }

    .avatar {
        width: 5rem;
        height: 5rem;
        border-radius: 50%;
        object-fit: cover;
        flex-shrink: 0;
    }

    .developer-info {
        flex: 1;
    }

    .developer-info h3 {
        font-size: 1.25rem;
        font-weight: 600;
        color: hsl(var(--foreground));
        margin-bottom: 0.5rem;
    }

    .developer-info p {
        margin-bottom: 1rem;
    }

    .github-link {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: hsl(var(--primary));
        color: white;
        border-radius: 0.5rem;
        text-decoration: none;
        font-size: 0.875rem;
        font-weight: 500;
        transition: opacity 0.2s;
    }

    .github-link:hover {
        opacity: 0.9;
    }

    .tech-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        margin-top: 1.5rem;
    }

    .tech-tag {
        padding: 0.5rem 1rem;
        background: hsl(var(--muted));
        color: hsl(var(--foreground));
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .link {
        color: hsl(var(--primary));
        text-decoration: underline;
    }

    .link:hover {
        text-decoration: none;
    }

    @media (max-width: 640px) {
        .about-page {
            padding: 2rem 0;
        }

        h1 {
            font-size: 2rem;
        }

        h2 {
            font-size: 1.5rem;
        }

        .developer-card {
            flex-direction: column;
            text-align: center;
        }

        .avatar {
            margin: 0 auto;
        }

        .features-grid {
            grid-template-columns: 1fr;
        }
    }
</style>
