<script lang="ts">
    import { onMount } from "svelte";
    import {
        Bell, Check, CheckCheck, Trash2,
        User, Star, Heart, Eye, Globe,
        Film, Tv, TrendingUp, Calendar, Users, Zap,
    } from "lucide-svelte";
    import { Button } from "$lib/components/ui/button";
    import { Badge } from "$lib/components/ui/badge";
    import { notificationStore } from "$lib/stores/notification.svelte.js";
    import { userStore } from "$lib/stores/user.svelte";
    import { goto } from "$app/navigation";

    function timeAgo(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    const notifications = $derived(notificationStore.notifications);
    const unreadCount = $derived(notificationStore.unreadCount);
    const isLoading = $derived(notificationStore.isLoading);

    let selectedType = $state<string>('all');
    let showUnreadOnly = $state(false);

    const typeFilters = [
        { value: 'all',         label: 'All',        icon: Bell },
        { value: 'follow',      label: 'Follows',    icon: Users },
        { value: 'activity',    label: 'Activity',   icon: Zap },
        { value: 'new_release', label: 'Releases',   icon: Film },
        { value: 'upcoming',    label: 'Upcoming',   icon: Calendar },
        { value: 'trending',    label: 'Trending',   icon: TrendingUp },
        { value: 'rating',      label: 'Ratings',    icon: Star },
        { value: 'system',      label: 'System',     icon: Globe },
    ];

    const filtered = $derived.by(() => {
        let list = notifications;
        if (selectedType !== 'all') list = list.filter(n => n.type === selectedType);
        if (showUnreadOnly) list = list.filter(n => !n.read);
        return list;
    });

    function iconFor(type: string) {
        switch (type) {
            case 'follow': case 'unfollow': return Users;
            case 'activity': return Zap;
            case 'rating': case 'review': return Star;
            case 'new_release': return Film;
            case 'upcoming': return Calendar;
            case 'trending': return TrendingUp;
            case 'watchlist_add': return Heart;
            case 'watched_add': return Eye;
            case 'system': case 'api_change': return Globe;
            default: return Bell;
        }
    }

    function colorFor(type: string) {
        switch (type) {
            case 'follow': case 'unfollow': return 'bg-blue-500/15 text-blue-500';
            case 'activity': return 'bg-violet-500/15 text-violet-500';
            case 'rating': case 'review': return 'bg-yellow-500/15 text-yellow-500';
            case 'new_release': return 'bg-green-500/15 text-green-500';
            case 'upcoming': return 'bg-cyan-500/15 text-cyan-500';
            case 'trending': return 'bg-orange-500/15 text-orange-500';
            case 'watchlist_add': return 'bg-red-500/15 text-red-500';
            case 'system': case 'api_change': return 'bg-purple-500/15 text-purple-500';
            default: return 'bg-muted text-muted-foreground';
        }
    }

    function labelFor(type: string) {
        const map: Record<string, string> = {
            follow: 'Follow', unfollow: 'Unfollow',
            activity: 'Activity', rating: 'Rating', review: 'Review',
            new_release: 'New Release', upcoming: 'Upcoming',
            trending: 'Trending', watchlist_add: 'Watchlist',
            watched_add: 'Watched', system: 'System', api_change: 'Update',
        };
        return map[type] ?? 'Notification';
    }

    function posterUrl(path?: string) {
        if (!path) return null;
        if (path.startsWith('http')) return path;
        return `https://image.tmdb.org/t/p/w92${path}`;
    }

    function handleClick(n: any) {
        if (!n.read && !n.virtual) notificationStore.markAsRead(n.id);
        const d = n.data;
        if (!d) return;
        switch (n.type) {
            case 'follow': case 'unfollow':
                if (d.actorId) goto(`/user/${d.actorId}`); break;
            case 'activity':
                if (d.mediaId && d.mediaType) goto(`/${d.mediaType}/${d.mediaId}`);
                else if (d.actorId) goto(`/user/${d.actorId}`);
                break;
            case 'rating': case 'review':
                if (d.mediaId && d.mediaType) goto(`/${d.mediaType}/${d.mediaId}`); break;
            case 'new_release': case 'upcoming': case 'trending':
                if (d.mediaId && d.mediaType) goto(`/${d.mediaType}/${d.mediaId}`); break;
        }
    }

    onMount(() => {
        if (!userStore.isAuthenticated) { goto('/login'); return; }
        notificationStore.fetchNotifications(true);
    });
</script>

<svelte:head>
    <title>Notifications - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-background">
    <div class="max-w-3xl mx-auto px-4 py-8 pt-32">

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <div>
                <h1 class="text-3xl font-bold">Notifications</h1>
                <p class="text-muted-foreground text-sm mt-1">
                    {#if unreadCount > 0}
                        {unreadCount} unread
                    {:else}
                        All caught up
                    {/if}
                </p>
            </div>
            {#if unreadCount > 0}
                <Button onclick={() => notificationStore.markAllAsRead()} variant="outline" class="gap-2">
                    <CheckCheck class="w-4 h-4" />
                    Mark all read
                </Button>
            {/if}
        </div>

        <!-- Type filter pills -->
        <div class="flex gap-2 flex-wrap mb-4">
            {#each typeFilters as f}
                {@const Icon = f.icon}
                <button
                    onclick={() => selectedType = f.value}
                    class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                        {selectedType === f.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent'}"
                >
                    <Icon class="w-3 h-3" />
                    {f.label}
                </button>
            {/each}
            <button
                onclick={() => showUnreadOnly = !showUnreadOnly}
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ml-auto
                    {showUnreadOnly
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border hover:bg-accent'}"
            >
                <Bell class="w-3 h-3" />
                Unread only
            </button>
        </div>

        <!-- List -->
        {#if isLoading && notifications.length === 0}
            <div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <div class="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading notifications...</p>
            </div>
        {:else if filtered.length === 0}
            <div class="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Bell class="w-16 h-16 mb-4 opacity-20" />
                <h2 class="text-xl font-semibold mb-1">
                    {notifications.length === 0 ? 'No notifications yet' : 'No matching notifications'}
                </h2>
                <p class="text-sm">
                    {notifications.length === 0
                        ? 'Follow people and add to your watchlist to get notified'
                        : 'Try a different filter'}
                </p>
            </div>
        {:else}
            <div class="space-y-2">
                {#each filtered as n (n.id)}
                    {@const Icon = iconFor(n.type)}
                    {@const poster = posterUrl(n.data?.posterPath)}
                    <div
                        role="button"
                        tabindex="0"
                        onclick={() => handleClick(n)}
                        onkeydown={(e) => e.key === 'Enter' && handleClick(n)}
                        class="group flex items-start gap-3 p-4 rounded-xl border transition-all cursor-pointer
                            {!n.read && !n.virtual
                                ? 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                                : 'bg-card border-border/60 hover:bg-accent/50'}"
                    >
                        <!-- Left: avatar or icon -->
                        <div class="shrink-0 mt-0.5">
                            {#if n.data?.actorAvatar}
                                <div class="relative">
                                    <img src={n.data.actorAvatar} alt={n.data.actorName} class="w-11 h-11 rounded-full object-cover" />
                                    <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full {colorFor(n.type)} flex items-center justify-center">
                                        <Icon class="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            {:else if poster}
                                <div class="relative">
                                    <img src={poster} alt={n.data?.mediaTitle} class="w-11 h-14 rounded-lg object-cover" />
                                    <div class="absolute -bottom-1 -right-1 w-5 h-5 rounded-full {colorFor(n.type)} flex items-center justify-center">
                                        <Icon class="w-2.5 h-2.5" />
                                    </div>
                                </div>
                            {:else}
                                <div class="w-11 h-11 rounded-full {colorFor(n.type)} flex items-center justify-center">
                                    <Icon class="w-5 h-5" />
                                </div>
                            {/if}
                        </div>

                        <!-- Content -->
                        <div class="flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-2">
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center gap-2 flex-wrap mb-0.5">
                                        <span class="font-semibold text-sm {!n.read && !n.virtual ? 'text-foreground' : 'text-foreground/90'}">
                                            {n.title}
                                        </span>
                                        <span class="text-[0.65rem] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                                            {labelFor(n.type)}
                                        </span>
                                        {#if !n.read && !n.virtual}
                                            <span class="w-2 h-2 rounded-full bg-primary shrink-0"></span>
                                        {/if}
                                        {#if n.virtual}
                                            <span class="text-[0.6rem] px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground/70 border border-border/50">
                                                live
                                            </span>
                                        {/if}
                                    </div>
                                    <p class="text-sm text-muted-foreground leading-snug line-clamp-2">{n.message}</p>
                                    <time class="text-xs text-muted-foreground/60 mt-1 block">{timeAgo(n.createdAt)}</time>
                                </div>

                                <!-- Actions -->
                                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    {#if !n.read && !n.virtual}
                                        <button
                                            onclick={(e) => { e.stopPropagation(); notificationStore.markAsRead(n.id); }}
                                            class="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check class="w-3.5 h-3.5" />
                                        </button>
                                    {/if}
                                    {#if !n.virtual}
                                        <button
                                            onclick={(e) => { e.stopPropagation(); notificationStore.deleteNotification(n.id); }}
                                            class="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 class="w-3.5 h-3.5" />
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </div>
</div>
