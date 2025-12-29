<script lang="ts">
    import { userStore } from "$lib/stores/user.svelte.js";
    import {
        Edit3,
        Camera,
        MapPin,
        Globe,
        Calendar,
        Users,
        Star,
        Film,
        Tv,
        Heart,
        Eye,
        Settings,
        Upload,
        X,
        Check,
        Twitter,
        Instagram,
    } from "lucide-svelte";
    import type { UserUpdateData } from "$lib/user-types.js";

    // Props
    let { userId = userStore.user?.id }: { userId?: string } = $props();

    // Local state using Svelte 5 runes
    let isEditing = $state(false);
    let isUploadingAvatar = $state(false);
    let isUploadingBanner = $state(false);
    let showAvatarUpload = $state(false);
    let showBannerUpload = $state(false);

    // Edit form state
    let editForm = $state({
        displayName: "",
        bio: "",
        location: "",
        website: "",
        twitter: "",
        instagram: "",
    });

    // File input references
    let avatarInput: HTMLInputElement;
    let bannerInput: HTMLInputElement;

    // Computed values
    let isOwnProfile = $derived(userId === userStore.user?.id);
    let currentUser = $derived(userStore.user);

    // Initialize edit form when editing starts
    function startEditing() {
        if (!currentUser) return;

        editForm = {
            displayName: currentUser.displayName || "",
            bio: currentUser.bio || "",
            location: currentUser.location || "",
            website: currentUser.website || "",
            twitter: "", // Would come from socialLinks in full implementation
            instagram: "",
        };
        isEditing = true;
    }

    function cancelEditing() {
        isEditing = false;
        editForm = {
            displayName: "",
            bio: "",
            location: "",
            website: "",
            twitter: "",
            instagram: "",
        };
    }

    async function saveProfile() {
        if (!currentUser) return;

        const updateData: UserUpdateData = {
            displayName: editForm.displayName,
            bio: editForm.bio,
            location: editForm.location,
            website: editForm.website,
            socialLinks: {
                twitter: editForm.twitter || undefined,
                instagram: editForm.instagram || undefined,
            },
        };

        await userStore.updateProfile(updateData);
        isEditing = false;
    }

    function triggerAvatarUpload() {
        avatarInput?.click();
    }

    function triggerBannerUpload() {
        bannerInput?.click();
    }

    async function handleAvatarUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (JPG, PNG, WebP, or GIF)");
            return;
        }

        // Validate file size (10MB max for Cloudinary)
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB");
            return;
        }

        isUploadingAvatar = true;
        try {
            await userStore.uploadAvatar(file);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Avatar upload failed";
            alert(`Upload failed: ${errorMessage}`);
        } finally {
            isUploadingAvatar = false;
            input.value = "";
        }
    }

    async function handleBannerUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file (JPG, PNG, WebP, or GIF)");
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB");
            return;
        }

        isUploadingBanner = true;
        try {
            await userStore.uploadBanner(file);
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Banner upload failed";
            alert(`Upload failed: ${errorMessage}`);
        } finally {
            isUploadingBanner = false;
            input.value = "";
        }
    }

    function formatDate(date: Date): string {
        return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "long",
        }).format(date);
    }

    function formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M";
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K";
        }
        return num.toString();
    }
</script>

{#if currentUser}
    <div
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden"
    >
        <!-- Banner Section -->
        <div
            class="relative h-48 md:h-64 bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden group"
        >
            {#if currentUser.banner}
                <img
                    src={currentUser.banner}
                    alt="Profile banner"
                    class="w-full h-full object-cover"
                />
            {/if}

            <!-- Banner Upload Overlay -->
            {#if isOwnProfile}
                <div
                    class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                >
                    <button
                        onclick={triggerBannerUpload}
                        disabled={isUploadingBanner}
                        class="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {#if isUploadingBanner}
                            <div
                                class="animate-spin w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full"
                            ></div>
                            Uploading to cloud...
                        {:else}
                            <Camera class="w-4 h-4" />
                            Change Banner
                        {/if}
                    </button>
                </div>
            {/if}

            <!-- Edit Profile Button -->
            {#if isOwnProfile && !isEditing}
                <button
                    onclick={startEditing}
                    class="absolute top-4 right-4 bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                    <Edit3 class="w-4 h-4" />
                    Edit Profile
                </button>
            {/if}
        </div>

        <!-- Profile Content -->
        <div class="relative px-6 pb-6">
            <!-- Avatar -->
            <div
                class="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 mb-6"
            >
                <div class="relative group">
                    <div
                        class="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-700"
                    >
                        {#if currentUser.avatar}
                            <img
                                src={currentUser.avatar}
                                alt="{currentUser.displayName}'s avatar"
                                class="w-full h-full object-cover"
                            />
                        {:else}
                            <div
                                class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600"
                            >
                                <span class="text-white text-3xl font-bold">
                                    {currentUser.displayName
                                        .charAt(0)
                                        .toUpperCase()}
                                </span>
                            </div>
                        {/if}
                    </div>

                    {#if isOwnProfile}
                        <button
                            onclick={triggerAvatarUpload}
                            disabled={isUploadingAvatar}
                            class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-full flex items-center justify-center disabled:opacity-75"
                            title={isUploadingAvatar
                                ? "Uploading to cloud..."
                                : "Change avatar"}
                        >
                            {#if isUploadingAvatar}
                                <div
                                    class="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                                ></div>
                            {:else}
                                <Camera class="w-6 h-6 text-white" />
                            {/if}
                        </button>
                    {/if}
                </div>

                <div class="flex-1 sm:mb-4">
                    {#if !isEditing}
                        <!-- Display Mode -->
                        <div class="space-y-2">
                            <div class="flex items-center gap-3">
                                <h1
                                    class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white"
                                >
                                    {currentUser.displayName}
                                </h1>
                                {#if currentUser.isVerified}
                                    <div
                                        class="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                                        title="Verified user"
                                    >
                                        <Check class="w-4 h-4 text-white" />
                                    </div>
                                {/if}
                            </div>
                            <p class="text-gray-600 dark:text-gray-400">
                                @{currentUser.username}
                            </p>
                        </div>
                    {:else}
                        <!-- Edit Mode -->
                        <div
                            class="space-y-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
                        >
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Display Name
                                </label>
                                <input
                                    type="text"
                                    bind:value={editForm.displayName}
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Your display name"
                                />
                            </div>
                        </div>
                    {/if}
                </div>
            </div>

            <!-- Bio Section -->
            <div class="space-y-4">
                {#if !isEditing}
                    {#if currentUser.bio}
                        <p
                            class="text-gray-700 dark:text-gray-300 leading-relaxed"
                        >
                            {currentUser.bio}
                        </p>
                    {/if}
                {:else}
                    <div>
                        <label
                            class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                        >
                            Bio
                        </label>
                        <textarea
                            bind:value={editForm.bio}
                            rows="3"
                            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                            placeholder="Tell us about yourself..."
                        ></textarea>
                    </div>
                {/if}

                <!-- Profile Info -->
                <div
                    class="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400"
                >
                    {#if !isEditing}
                        {#if currentUser.location}
                            <div class="flex items-center gap-1">
                                <MapPin class="w-4 h-4" />
                                {currentUser.location}
                            </div>
                        {/if}

                        {#if currentUser.website}
                            <div class="flex items-center gap-1">
                                <Globe class="w-4 h-4" />
                                <a
                                    href={currentUser.website.startsWith("http")
                                        ? currentUser.website
                                        : `https://${currentUser.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    {currentUser.website}
                                </a>
                            </div>
                        {/if}

                        <div class="flex items-center gap-1">
                            <Calendar class="w-4 h-4" />
                            Joined {formatDate(currentUser.joinedAt)}
                        </div>
                    {:else}
                        <!-- Edit Mode - Location and Website -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Location
                                </label>
                                <input
                                    type="text"
                                    bind:value={editForm.location}
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Where are you located?"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Website
                                </label>
                                <input
                                    type="url"
                                    bind:value={editForm.website}
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="Your website URL"
                                />
                            </div>
                        </div>

                        <!-- Social Links -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Twitter
                                </label>
                                <input
                                    type="text"
                                    bind:value={editForm.twitter}
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="@username"
                                />
                            </div>
                            <div>
                                <label
                                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                                >
                                    Instagram
                                </label>
                                <input
                                    type="text"
                                    bind:value={editForm.instagram}
                                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    placeholder="@username"
                                />
                            </div>
                        </div>

                        <!-- Edit Actions -->
                        <div class="flex gap-3 pt-4">
                            <button
                                onclick={saveProfile}
                                disabled={userStore.isLoading}
                                class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                {#if userStore.isLoading}
                                    <div
                                        class="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                                    ></div>
                                {:else}
                                    Save Changes
                                {/if}
                            </button>
                            <button
                                onclick={cancelEditing}
                                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    {/if}
                </div>

                {#if !isEditing}
                    <!-- Stats -->
                    <div
                        class="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div class="text-center">
                            <div
                                class="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white"
                            >
                                <Users class="w-5 h-5" />
                                {formatNumber(currentUser.followerCount)}
                            </div>
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400"
                            >
                                Followers
                            </div>
                        </div>

                        <div class="text-center">
                            <div
                                class="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white"
                            >
                                <Eye class="w-5 h-5" />
                                {formatNumber(currentUser.followingCount)}
                            </div>
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400"
                            >
                                Following
                            </div>
                        </div>

                        <div class="text-center">
                            <div
                                class="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white"
                            >
                                <Star class="w-5 h-5" />
                                {formatNumber(currentUser.totalRatings)}
                            </div>
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400"
                            >
                                Ratings
                            </div>
                        </div>

                        <div class="text-center">
                            <div
                                class="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900 dark:text-white"
                            >
                                <Heart class="w-5 h-5" />
                                {formatNumber(currentUser.watchedCount)}
                            </div>
                            <div
                                class="text-sm text-gray-600 dark:text-gray-400"
                            >
                                Watched
                            </div>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    {#if isOwnProfile}
                        <div class="flex gap-3 pt-4">
                            <button
                                onclick={() =>
                                    userStore.setActiveTab("ratings")}
                                class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Star class="w-4 h-4" />
                                View Ratings
                            </button>
                            <button
                                onclick={() =>
                                    userStore.setActiveTab("watchlist")}
                                class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Film class="w-4 h-4" />
                                Watchlist
                            </button>
                        </div>
                    {/if}
                {/if}
            </div>
        </div>
    </div>
{/if}

<!-- Hidden file inputs -->
<input
    bind:this={avatarInput}
    type="file"
    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
    onchange={handleAvatarUpload}
    class="hidden"
/>

<input
    bind:this={bannerInput}
    type="file"
    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
    onchange={handleBannerUpload}
    class="hidden"
/>
