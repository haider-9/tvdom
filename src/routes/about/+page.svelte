<script lang="ts">
    import {
        Film,
        Tv,
        Users,
        Star,
        Heart,
        Bell,
        Palette,
        Database,
        Zap,
        Shield,
        Smartphone,
        Globe,
        Github,
        ExternalLink,
        Code,
        Sparkles,
        Activity,
        Search,
        Eye,
        MessageCircle,
        TrendingUp,
        Clock,
        Settings,
        Lock,
        CheckCircle,
    } from "lucide-svelte";

    const githubUser = "haider-9";
    const avatar = `https://github.com/${githubUser}.png`;

    const features = [
        {
            icon: Search,
            name: "Advanced Search",
            description:
                "Search movies, TV shows, and people with intelligent filtering",
        },
        {
            icon: Users,
            name: "Social Following",
            description:
                "Follow other users and see their activity in real-time",
        },
        {
            icon: Bell,
            name: "Smart Notifications",
            description:
                "Get notified about follows, ratings, and system updates",
        },
        {
            icon: Star,
            name: "Rating & Reviews",
            description: "Rate movies and TV shows, write detailed reviews",
        },
        {
            icon: Heart,
            name: "Watchlist Management",
            description:
                "Create and manage your personal watchlist with priorities",
        },
        {
            icon: Eye,
            name: "Watch History",
            description: "Track what you've watched with dates and ratings",
        },
        {
            icon: Activity,
            name: "Activity Feeds",
            description: "See what people you follow are watching and rating",
        },
        {
            icon: Palette,
            name: "Theme System",
            description:
                "Choose from Light, Dark, or Bubblegum themes that persist",
        },
        {
            icon: Lock,
            name: "Privacy Controls",
            description:
                "Make your profile private and control what others see",
        },
        {
            icon: TrendingUp,
            name: "Statistics",
            description:
                "Detailed stats about your viewing habits and preferences",
        },
    ];

    const techStack = [
        {
            category: "Frontend Framework",
            items: [
                {
                    name: "Svelte 5",
                    description: "Latest version with new runes system",
                },
                {
                    name: "SvelteKit",
                    description: "Full-stack framework with SSR",
                },
                { name: "TypeScript", description: "Type-safe development" },
            ],
        },
        {
            category: "Styling & UI",
            items: [
                {
                    name: "Tailwind CSS",
                    description: "Utility-first CSS framework",
                },
                {
                    name: "shadcn-svelte",
                    description: "Beautiful UI components",
                },
                { name: "Lucide Icons", description: "Consistent icon system" },
                { name: "Bits UI", description: "Headless UI primitives" },
            ],
        },
        {
            category: "Backend & Database",
            items: [
                {
                    name: "MongoDB",
                    description: "NoSQL database for user data",
                },
                { name: "Mongoose", description: "MongoDB object modeling" },
                {
                    name: "Node.js",
                    description: "Server-side JavaScript runtime",
                },
            ],
        },
        {
            category: "APIs & Services",
            items: [
                { name: "TMDB API", description: "Movie and TV show data" },
                {
                    name: "Cloudinary",
                    description: "Image upload and optimization",
                },
                {
                    name: "Custom REST API",
                    description: "User management and social features",
                },
            ],
        },
        {
            category: "Development Tools",
            items: [
                { name: "Vite", description: "Fast build tool and dev server" },
                {
                    name: "PostCSS",
                    description: "CSS processing and optimization",
                },
                {
                    name: "ESLint & Prettier",
                    description: "Code quality and formatting",
                },
            ],
        },
    ];

    const recentUpdates = [
        {
            version: "2.1.0",
            date: "December 2024",
            title: "Social Features & Notifications",
            features: [
                "Complete notification system with real-time updates",
                "Follow/unfollow functionality with activity feeds",
                "User profile enhancements with follow lists",
                "Notification management and filtering",
            ],
        },
        {
            version: "2.0.0",
            date: "December 2024",
            title: "Theme System & UI Overhaul",
            features: [
                "Persistent theme system (Light, Dark, Bubblegum)",
                "Enhanced responsive design",
                "Improved mobile experience",
                "Better accessibility and keyboard navigation",
            ],
        },
        {
            version: "1.5.0",
            date: "November 2024",
            title: "User Management & Profiles",
            features: [
                "User authentication and registration",
                "Profile customization with avatars and banners",
                "Privacy settings and profile visibility",
                "Personal statistics and viewing history",
            ],
        },
    ];

    const stats = [
        { label: "Movies & TV Shows", value: "1M+", icon: Film },
        { label: "User Accounts", value: "Growing", icon: Users },
        { label: "Ratings & Reviews", value: "Active", icon: Star },
        { label: "Uptime", value: "99.9%", icon: Zap },
    ];
</script>

<svelte:head>
    <title>About TVDom - Your Personal Movie & TV Companion</title>
    <meta
        name="description"
        content="Learn about TVDom's features, technology stack, and the team behind your favorite movie and TV show discovery platform."
    />
</svelte:head>

<div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <section
        class="bg-gradient-to-br from-primary/5 via-background to-accent/5 border-b border-border"
    >
        <div class="max-w-6xl mx-auto px-4 py-16">
            <div class="text-center mb-12">
                <div class="flex items-center justify-center gap-3 mb-4">
                    <div class="p-3 bg-primary/10 rounded-2xl">
                        <Film class="w-8 h-8 text-primary" />
                    </div>
                    <h1 class="text-4xl font-bold text-foreground">TVDom</h1>
                </div>
                <p class="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Your personal companion for discovering, tracking, and
                    sharing your favorite movies and TV shows
                </p>
            </div>

            <!-- Stats Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                {#each stats as stat}
                    <div
                        class="text-center p-6 bg-card border border-border rounded-lg"
                    >
                        <stat.icon class="w-8 h-8 text-primary mx-auto mb-2" />
                        <div class="text-2xl font-bold text-foreground mb-1">
                            {stat.value}
                        </div>
                        <div class="text-sm text-muted-foreground">
                            {stat.label}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
        <div class="max-w-6xl mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-foreground mb-4">
                    Powerful Features
                </h2>
                <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Everything you need to discover, track, and share your movie
                    and TV show experiences
                </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each features as feature}
                    <div
                        class="group p-6 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                    >
                        <div class="flex items-center gap-3 mb-3">
                            <div
                                class="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors"
                            >
                                <feature.icon class="w-5 h-5 text-primary" />
                            </div>
                            <h3 class="font-semibold text-foreground">
                                {feature.name}
                            </h3>
                        </div>
                        <p class="text-sm text-muted-foreground">
                            {feature.description}
                        </p>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Recent Updates Section -->
    <section class="py-16 bg-muted/20">
        <div class="max-w-6xl mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-foreground mb-4">
                    Recent Updates
                </h2>
                <p class="text-lg text-muted-foreground">
                    We're constantly improving TVDom with new features and
                    enhancements
                </p>
            </div>

            <div class="space-y-8">
                {#each recentUpdates as update, index}
                    <div class="relative">
                        {#if index < recentUpdates.length - 1}
                            <div
                                class="absolute left-6 top-14 bottom-0 w-px bg-border"
                            ></div>
                        {/if}

                        <div class="flex gap-6">
                            <div class="flex-shrink-0">
                                <div
                                    class="w-12 h-12 bg-primary rounded-full flex items-center justify-center relative z-10"
                                >
                                    <Sparkles
                                        class="w-6 h-6 text-primary-foreground"
                                    />
                                </div>
                            </div>

                            <div class="flex-1 pb-8">
                                <div
                                    class="bg-card border border-border rounded-lg p-6"
                                >
                                    <div
                                        class="flex items-center justify-between mb-3"
                                    >
                                        <h3
                                            class="text-xl font-semibold text-foreground"
                                        >
                                            {update.title}
                                        </h3>
                                        <div
                                            class="text-sm text-muted-foreground"
                                        >
                                            <span
                                                class="font-mono bg-muted px-2 py-1 rounded"
                                                >{update.version}</span
                                            >
                                            <span class="ml-2"
                                                >{update.date}</span
                                            >
                                        </div>
                                    </div>
                                    <ul class="space-y-2">
                                        {#each update.features as feature}
                                            <li
                                                class="flex items-start gap-2 text-sm text-muted-foreground"
                                            >
                                                <CheckCircle
                                                    class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                                                />
                                                {feature}
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Technology Stack Section -->
    <section class="py-16">
        <div class="max-w-6xl mx-auto px-4">
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-foreground mb-4">
                    Technology Stack
                </h2>
                <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Built with modern, cutting-edge technologies for the best
                    performance and user experience
                </p>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {#each techStack as category}
                    <div class="bg-card border border-border rounded-lg p-6">
                        <h3
                            class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2"
                        >
                            <Code class="w-5 h-5 text-primary" />
                            {category.category}
                        </h3>
                        <div class="space-y-3">
                            {#each category.items as item}
                                <div class="border-l-2 border-primary/20 pl-4">
                                    <h4 class="font-medium text-foreground">
                                        {item.name}
                                    </h4>
                                    <p class="text-sm text-muted-foreground">
                                        {item.description}
                                    </p>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </section>

    <!-- Developer Section -->
    <section class="py-16 bg-muted/20">
        <div class="max-w-4xl mx-auto px-4">
            <div class="bg-card border border-border rounded-lg p-8">
                <div class="flex flex-col md:flex-row items-center gap-6">
                    <img
                        src={avatar}
                        alt="Haider's GitHub avatar"
                        class="w-28 h-28 rounded-full ring-4 ring-primary/20 object-cover"
                    />

                    <div class="flex-1 text-center md:text-left">
                        <h2 class="text-2xl font-bold text-foreground mb-2">
                            Built by Haider
                        </h2>
                        <p class="text-muted-foreground mb-4">
                            Full-stack developer passionate about creating
                            beautiful, functional web applications. TVDom
                            started as a personal project to explore modern web
                            technologies and has grown into a comprehensive
                            movie and TV show tracking platform.
                        </p>

                        <div
                            class="flex items-center justify-center md:justify-start gap-4"
                        >
                            <a
                                href="https://github.com/{githubUser}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <Github class="w-4 h-4" />
                                GitHub Profile
                            </a>
                            <a
                                href="https://github.com/{githubUser}/tvdom"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                            >
                                <Code class="w-4 h-4" />
                                View Source
                                <ExternalLink class="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Mission & Future Section -->
    <section class="py-16">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <h2 class="text-3xl font-bold text-foreground mb-6">Our Mission</h2>
            <p class="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
                To create the most intuitive and feature-rich platform for movie
                and TV show enthusiasts. We believe in combining powerful
                functionality with beautiful design to enhance your
                entertainment discovery and tracking experience.
            </p>

            <div class="grid md:grid-cols-3 gap-6 mb-12">
                <div class="p-6 bg-card border border-border rounded-lg">
                    <Shield class="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 class="font-semibold text-foreground mb-2">
                        Privacy First
                    </h3>
                    <p class="text-sm text-muted-foreground">
                        Your data is yours. We prioritize privacy and give you
                        full control over your information.
                    </p>
                </div>
                <div class="p-6 bg-card border border-border rounded-lg">
                    <Zap class="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 class="font-semibold text-foreground mb-2">
                        Lightning Fast
                    </h3>
                    <p class="text-sm text-muted-foreground">
                        Built with performance in mind. Fast loading times and
                        smooth interactions.
                    </p>
                </div>
                <div class="p-6 bg-card border border-border rounded-lg">
                    <Smartphone class="w-8 h-8 text-primary mx-auto mb-3" />
                    <h3 class="font-semibold text-foreground mb-2">
                        Mobile Ready
                    </h3>
                    <p class="text-sm text-muted-foreground">
                        Fully responsive design that works beautifully on all
                        devices.
                    </p>
                </div>
            </div>

            <div
                class="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 border border-primary/20"
            >
                <h3 class="text-xl font-semibold text-foreground mb-3">
                    What's Coming Next?
                </h3>
                <p class="text-muted-foreground mb-4">
                    We're constantly working on new features and improvements.
                    Here's what's on our roadmap:
                </p>
                <div class="flex flex-wrap justify-center gap-2">
                    <span
                        class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >Mobile App</span
                    >
                    <span
                        class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >Advanced Recommendations</span
                    >
                    <span
                        class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >Social Groups</span
                    >
                    <span
                        class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >Streaming Integration</span
                    >
                    <span
                        class="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                        >Export Data</span
                    >
                </div>
            </div>
        </div>
    </section>

    <!-- Footer CTA -->
    <section class="py-12 bg-primary text-primary-foreground">
        <div class="max-w-4xl mx-auto px-4 text-center">
            <h2 class="text-2xl font-bold mb-4">
                Ready to Start Your Journey?
            </h2>
            <p class="text-primary-foreground/90 mb-6">
                Join thousands of movie and TV show enthusiasts already using
                TVDom
            </p>
            <div class="flex items-center justify-center gap-4">
                <a
                    href="/signup"
                    class="inline-flex items-center gap-2 px-6 py-3 bg-background text-foreground rounded-lg hover:bg-background/90 transition-colors"
                >
                    Get Started Free
                </a>
                <a
                    href="/"
                    class="inline-flex items-center gap-2 px-6 py-3 border border-primary-foreground/20 rounded-lg hover:bg-primary-foreground/10 transition-colors"
                >
                    Explore Features
                </a>
            </div>
        </div>
    </section>
</div>
