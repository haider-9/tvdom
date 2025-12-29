<script lang="ts">
  import { userStore } from "$lib/stores/user.svelte.js";
  import { goto } from "$app/navigation";
  import {
    User,
    Mail,
    MapPin,
    Globe,
    Camera,
    Save,
    X,
    Eye,
    EyeOff,
  } from "lucide-svelte";
  import { toast } from "$lib/components/ui/toast";
  import Button from "$lib/components/ui/button/button.svelte";

  // Redirect if not authenticated
  if (!userStore.isAuthenticated) {
    if (typeof window !== "undefined") {
      goto("/login");
    }
  }

  let isLoading = $state(false);

  // Form data
  let formData = $state({
    displayName: userStore.user?.displayName || "",
    username: userStore.user?.username || "",
    email: userStore.user?.email || "",
    bio: userStore.user?.bio || "",
    location: userStore.user?.location || "",
    website: userStore.user?.website || "",
    isPrivate: userStore.user?.isPrivate || false,
  });

  // Avatar upload
  let avatarInput: HTMLInputElement;
  let avatarPreview = $state<string | null>(null);

  // Banner upload
  let bannerInput: HTMLInputElement;
  let bannerPreview = $state<string | null>(null);

  function handleAvatarChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleBannerChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        bannerPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!userStore.user) return;

    isLoading = true;

    try {
      // Create promises for uploads
      const uploadPromises = [];

      if (bannerInput.files?.[0]) {
        uploadPromises.push(
          toast.promise(userStore.uploadBanner(bannerInput.files[0]), {
            loading: "Uploading banner...",
            success: "Banner uploaded successfully!",
            error: "Failed to upload banner",
          })
        );
      }

      if (avatarInput.files?.[0]) {
        uploadPromises.push(
          toast.promise(userStore.uploadAvatar(avatarInput.files[0]), {
            loading: "Uploading avatar...",
            success: "Avatar uploaded successfully!",
            error: "Failed to upload avatar",
          })
        );
      }

      // Wait for uploads to complete
      await Promise.all(uploadPromises);

      // Update profile
      await toast.promise(userStore.updateProfile(formData), {
        loading: "Updating profile...",
        success: "Profile updated successfully!",
        error: "Failed to update profile",
      });

      setTimeout(() => {
        goto("/profile");
      }, 1000);
    } catch (error) {
      // Error is already handled by toast.promise
      console.error("Profile update error:", error);
    } finally {
      isLoading = false;
    }
  }

  function cancelEdit() {
    goto("/profile");
  }
</script>

<svelte:head>
  <title>Edit Profile - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
  <div class="max-w-2xl mx-auto px-4">
    <!-- Header -->
    <div class="mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Profile
          </h1>
          <p class="text-gray-600 dark:text-gray-400 mt-1">
            Update your personal information and preferences
          </p>
        </div>
        <button
          onclick={cancelEdit}
          class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Cancel"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Success Message -->
    <!-- Error Message -->

    <form onsubmit={handleSubmit} class="space-y-8">
      <!-- Banner Section -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Cover Banner
        </h2>

        <div class="space-y-4">
          <!-- Banner Preview -->
          <div
            class="relative h-32 md:h-48 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"
          >
            {#if bannerPreview}
              <img
                src={bannerPreview}
                alt="Banner preview"
                class="w-full h-full object-cover"
              />
            {:else if userStore.user?.banner}
              <img
                src={userStore.user.banner}
                alt="Current banner"
                class="w-full h-full object-cover"
              />
            {/if}
            <div class="absolute inset-0 bg-black/20"></div>

            <!-- Upload overlay -->
            <div class="absolute inset-0 flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                bind:this={bannerInput}
                onchange={handleBannerChange}
                class="hidden"
                id="banner-upload"
              />
              <label
                for="banner-upload"
                class="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg cursor-pointer transition-colors"
              >
                <Camera class="w-4 h-4" />
                Change Banner
              </label>
            </div>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400">
            Recommended size: 1200x300px. JPG, PNG or GIF. Max size 10MB.
          </p>
        </div>
      </div>

      <!-- Profile Picture Section -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Profile Picture
        </h2>

        <div class="flex items-center gap-6">
          <!-- Current/Preview Avatar -->
          <div class="relative">
            <div
              class="w-20 h-20 rounded-full overflow-hidden border-3 border-gray-200 dark:border-gray-600"
            >
              {#if avatarPreview}
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  class="w-full h-full object-cover"
                />
              {:else if userStore.user?.avatar}
                <img
                  src={userStore.user.avatar}
                  alt="Current avatar"
                  class="w-full h-full object-cover"
                />
              {:else}
                <div
                  class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <span class="text-white text-xl font-bold">
                    {userStore.user?.displayName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              {/if}
            </div>
          </div>

          <!-- Upload Button -->
          <div>
            <input
              type="file"
              accept="image/*"
              bind:this={avatarInput}
              onchange={handleAvatarChange}
              class="hidden"
              id="avatar-upload"
            />
            <label
              for="avatar-upload"
              class="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
            >
              <Camera class="w-4 h-4" />
              Change Photo
            </label>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
              JPG, PNG or GIF. Max size 5MB.
            </p>
          </div>
        </div>
      </div>

      <!-- Basic Information -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Basic Information
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              for="displayName"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Display Name
            </label>
            <div class="relative">
              <User
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="text"
                id="displayName"
                bind:value={formData.displayName}
                required
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Your display name"
              />
            </div>
          </div>

          <div>
            <label
              for="username"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              bind:value={formData.username}
              required
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="@username"
            />
          </div>

          <div class="md:col-span-2">
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Email Address
            </label>
            <div class="relative">
              <Mail
                class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
              />
              <input
                type="email"
                id="email"
                bind:value={formData.email}
                required
                class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Information -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Additional Information
        </h2>

        <div class="space-y-4">
          <div>
            <label
              for="bio"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Bio
            </label>
            <textarea
              id="bio"
              bind:value={formData.bio}
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
              placeholder="Tell us about yourself..."
            ></textarea>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.bio.length}/160 characters
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="location"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Location
              </label>
              <div class="relative">
                <MapPin
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                />
                <input
                  type="text"
                  id="location"
                  bind:value={formData.location}
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="City, Country"
                />
              </div>
            </div>

            <div>
              <label
                for="website"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Website
              </label>
              <div class="relative">
                <Globe
                  class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                />
                <input
                  type="url"
                  id="website"
                  bind:value={formData.website}
                  class="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div
        class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Privacy Settings
        </h2>

        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            {#if formData.isPrivate}
              <EyeOff class="w-5 h-5 text-gray-400" />
            {:else}
              <Eye class="w-5 h-5 text-gray-400" />
            {/if}
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                Private Profile
              </p>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Only approved followers can see your activity
              </p>
            </div>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              bind:checked={formData.isPrivate}
              class="sr-only peer"
            />
            <div
              class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
            ></div>
          </label>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center justify-end gap-4 pt-6">
        <Button
          variant="ghost"
          onclick={cancelEdit}
          class="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={isLoading}>
          {#if isLoading}
            <div
              class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></div>
          {:else}
            <Save class="w-4 h-4" />
          {/if}
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  </div>
</div>
