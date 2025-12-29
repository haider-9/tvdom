<script lang="ts">
    import "../app.css";
    import { Toaster } from "svelte-sonner";
    import Navbar from "$lib/components/Navbar.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import favicon from "$lib/assets/favicon.svg";

    // Import user authentication components
    import LoginModal from "$lib/components/auth/LoginModal.svelte";
    import RegisterModal from "$lib/components/auth/RegisterModal.svelte";
    import UserProfile from "$lib/components/user/UserProfile.svelte";
    import { userStore } from "$lib/stores/user.svelte.js";

    let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2
      ?family=Montserrat:wght@300;400;500;600;700
      &family=Fira+Code:wght@400;500
      &family=Oxanium:wght@400;500;600;700
      &family=Source+Code+Pro:wght@400;500;600
      &family=Poppins:wght@400;500;600;700
      &family=Outfit:wght@400;500;600;700
      &family=Plus+Jakarta+Sans:wght@400;500;600;700
      &family=Roboto+Mono:wght@400;500;600
      &family=Lora:wght@400;500;600;700
      &display=swap"
    rel="stylesheet"
  />
</svelte:head>

<Toaster richColors position="top-right" />

<!-- User Navigation (replaces original Navbar for user features) -->
<Navbar />

<!-- Authentication Modals -->
<LoginModal />
<RegisterModal />

<!-- Profile Modal -->
{#if userStore.isProfileModalOpen}
    <div
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
        <div
            class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
            <div
                class="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between"
            >
                <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                    Profile
                </h2>
                <button
                    onclick={userStore.closeProfileModal}
                    class="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                    <svg
                        class="w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M6 18L18 6M6 6l12 12"
                        ></path>
                    </svg>
                </button>
            </div>
            <div class="p-6">
                <UserProfile />
            </div>
        </div>
    </div>
{/if}

<div class="flex flex-col min-h-screen">
    <div class="flex-1">
        {@render children()}
    </div>
    <Footer />
</div>
