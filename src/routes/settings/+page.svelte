<script lang="ts">
  import { Settings, Palette, Moon, Sun, User, Bell, Shield, Globe, Zap, Skull, Layers, Edit, Lock, Download, Save } from 'lucide-svelte';
  import { Button } from '$lib/components/ui/button';
  import * as Card from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Switch } from '$lib/components/ui/switch';
  import { themeStore, type Theme } from '$lib/stores/theme.svelte.js';
  import { userStore } from '$lib/stores/user.svelte.js';
  import { toast } from 'svelte-sonner';
  import { goto } from '$app/navigation';

  // Redirect if not authenticated
  if (!userStore.isAuthenticated) {
    if (typeof window !== 'undefined') {
      goto('/login');
    }
  }

  const currentTheme = $derived(themeStore.theme);
  const isInitialized = $derived(themeStore.isInitialized);

  const themes: { value: Theme; label: string; description: string; icon: any }[] = [
    {
      value: 'bubblegum',
      label: 'Bubblegum',
      description: 'Colorful and vibrant',
      icon: Palette
    },
    {
      value: 'light',
      label: 'Light',
      description: 'Clean and bright',
      icon: Sun
    },
    {
      value: 'dark',
      label: 'Dark',
      description: 'Easy on the eyes',
      icon: Moon
    },
    {
      value: 'cyberpunk',
      label: 'Cyberpunk',
      description: 'Neon futuristic',
      icon: Zap
    },
    {
      value: 'doom65',
      label: 'Doom65',
      description: 'Retro gaming',
      icon: Skull
    },
    {
      value: 'claymorphism',
      label: 'Claymorphism',
      description: 'Soft modern design',
      icon: Layers
    }
  ];

  function selectTheme(theme: Theme) {
    themeStore.setTheme(theme);
    toast.success(`Theme changed to ${themes.find(t => t.value === theme)?.label}`);
  }

  let activeSection = $state<'appearance' | 'account' | 'notifications' | 'privacy'>('appearance');

  // Notification settings
  let notificationSettings = $state({
    newFollowers: true,
    ratingsReviews: true,
    systemUpdates: true,
    emailNotifications: false
  });

  // Privacy settings
  let privacySettings = $state({
    privateProfile: userStore.user?.isPrivate || false,
    showActivity: true,
    showWatchlist: true
  });

  // Account form data
  let accountForm = $state({
    displayName: userStore.user?.displayName || '',
    bio: userStore.user?.bio || '',
    location: userStore.user?.location || '',
    website: userStore.user?.website || ''
  });

  let isUpdatingAccount = $state(false);
  let isUpdatingPrivacy = $state(false);

  async function updateAccount() {
    if (!userStore.user) return;
    
    isUpdatingAccount = true;
    try {
      await userStore.updateProfile({
        displayName: accountForm.displayName,
        bio: accountForm.bio,
        location: accountForm.location,
        website: accountForm.website
      });
      toast.success('Account updated successfully!');
    } catch (error) {
      toast.error('Failed to update account');
      console.error('Account update error:', error);
    } finally {
      isUpdatingAccount = false;
    }
  }

  async function togglePrivateProfile() {
    isUpdatingPrivacy = true;
    try {
      await userStore.updateProfile({
        isPrivate: !privacySettings.privateProfile
      });
      privacySettings.privateProfile = !privacySettings.privateProfile;
      toast.success(`Profile is now ${privacySettings.privateProfile ? 'private' : 'public'}`);
    } catch (error) {
      toast.error('Failed to update privacy settings');
      console.error('Privacy update error:', error);
    } finally {
      isUpdatingPrivacy = false;
    }
  }

  function saveNotificationSettings() {
    toast.success('Notification preferences saved!');
  }

  function exportData() {
    const userData = {
      profile: userStore.user,
      ratings: userStore.userRatings,
      watchlist: userStore.userWatchlist,
      watched: userStore.userWatched,
      follows: userStore.userFollows,
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tvdom-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  }
</script>

<svelte:head>
  <title>Settings - TVDom</title>
</svelte:head>

<div class="min-h-screen bg-background">
  {#if userStore.isAuthenticated && userStore.user}
    <main class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <Settings class="w-6 h-6 text-primary" />
          <h1 class="text-3xl font-bold">Settings</h1>
        </div>
        <p class="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar Navigation -->
        <div class="lg:col-span-1">
          <Card.Root>
            <Card.Content class="p-4">
              <nav class="space-y-1">
                <button
                  onclick={() => activeSection = 'appearance'}
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors {activeSection === 'appearance' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
                >
                  <Palette class="w-4 h-4" />
                  <span>Appearance</span>
                </button>
               
                <button
                  onclick={() => activeSection = 'notifications'}
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors {activeSection === 'notifications' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
                >
                  <Bell class="w-4 h-4" />
                  <span>Notifications</span>
                </button>
                <button
                  onclick={() => activeSection = 'privacy'}
                  class="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors {activeSection === 'privacy' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}"
                >
                  <Shield class="w-4 h-4" />
                  <span>Privacy</span>
                </button>
              </nav>
            </Card.Content>
          </Card.Root>
        </div>

        <!-- Main Content -->
        <div class="lg:col-span-3">
          {#if activeSection === 'appearance'}
            <!-- Appearance Settings -->
            <Card.Root>
              <Card.Header>
                <Card.Title class="flex items-center py-4 gap-2">
                  <Palette class="w-5 h-5" />
                  Theme
                </Card.Title>
                <Card.Description>
                  Choose your preferred theme
                </Card.Description>
              </Card.Header>
              <Card.Content class="space-y-6 py-5">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {#each themes as theme}
                    <button
                      onclick={() => selectTheme(theme.value)}
                      disabled={!isInitialized}
                      class="relative p-4 border-2 rounded-lg transition-all hover:shadow-md disabled:opacity-50 {currentTheme === theme.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
                    >
                      <div class="flex flex-col items-center text-center space-y-3">
                        <div class="p-3 rounded-full {currentTheme === theme.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}">
                          <theme.icon class="w-5 h-5" />
                        </div>
                        <div>
                          <h4 class="font-medium">{theme.label}</h4>
                          <p class="text-xs text-muted-foreground">{theme.description}</p>
                        </div>
                        {#if currentTheme === theme.value}
                          <Badge variant="default" class="absolute top-2 right-2 text-xs">
                            Active
                          </Badge>
                        {/if}
                      </div>
                    </button>
                  {/each}
                </div>
                {#if !isInitialized}
                  <p class="text-sm text-muted-foreground">
                    Loading theme settings...
                  </p>
                {/if}
              </Card.Content>
            </Card.Root>

         

          {:else if activeSection === 'notifications'}
            <!-- Notifications Settings -->
            <Card.Root>
              <Card.Header>
                <Card.Title class="flex items-center py-6 gap-2">
                  <Bell class="w-5 h-5" />
                  Notifications
                </Card.Title>
                <Card.Description>
                  Control what notifications you receive
                </Card.Description>
              </Card.Header>
              <Card.Content class="space-y-4">
                <div class="space-y-4">
                  <div class="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 class="font-medium">New Followers</h4>
                      <p class="text-sm text-muted-foreground">Get notified when someone follows you</p>
                    </div>
                    <Switch bind:checked={notificationSettings.newFollowers} />
                  </div>

                  <div class="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 class="font-medium">Ratings & Reviews</h4>
                      <p class="text-sm text-muted-foreground">Notifications about ratings from people you follow</p>
                    </div>
                    <Switch bind:checked={notificationSettings.ratingsReviews} />
                  </div>

                  <div class="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 class="font-medium">System Updates</h4>
                      <p class="text-sm text-muted-foreground">Important updates about TVDom</p>
                    </div>
                    <Switch bind:checked={notificationSettings.systemUpdates} />
                  </div>

                  <div class="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 class="font-medium">Email Notifications</h4>
                      <p class="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch bind:checked={notificationSettings.emailNotifications} />
                  </div>
                </div>

                <div class="pb-4">
                  <Button onclick={saveNotificationSettings} class="gap-2">
                    <Save class="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </Card.Content>
            </Card.Root>

          {:else if activeSection === 'privacy'}
            <!-- Privacy Settings -->
            <div class="space-y-6 ">
              <Card.Root>
                <Card.Header>
                  <Card.Title class="flex items-center py-3 ">
                    <Shield class="w-5 h-5" />
                    Privacy & Security
                  </Card.Title>
                  <Card.Description>
                    Control your privacy settings
                  </Card.Description>
                </Card.Header>
                <Card.Content class="space-y-4 py-3">
                  <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 border rounded-lg">
                      <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg {privacySettings.privateProfile ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'}">
                          {#if privacySettings.privateProfile}
                            <Lock class="w-4 h-4 text-red-600 dark:text-red-400" />
                          {:else}
                            <Globe class="w-4 h-4 text-green-600 dark:text-green-400" />
                          {/if}
                        </div>
                        <div>
                          <h4 class="font-medium">Private Profile</h4>
                          <p class="text-sm text-muted-foreground">
                            {privacySettings.privateProfile ? 'Your profile is private' : 'Your profile is public'}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onclick={togglePrivateProfile}
                        disabled={isUpdatingPrivacy}
                        class="gap-2"
                      >
                        {#if isUpdatingPrivacy}
                          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        {:else if privacySettings.privateProfile}
                          <Globe class="w-4 h-4" />
                        {:else}
                          <Lock class="w-4 h-4" />
                        {/if}
                        {privacySettings.privateProfile ? 'Make Public' : 'Make Private'}
                      </Button>
                    </div>

                    <div class="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 class="font-medium">Show Activity</h4>
                        <p class="text-sm text-muted-foreground">Let others see your recent ratings and reviews</p>
                      </div>
                      <Switch bind:checked={privacySettings.showActivity} />
                    </div>

                    <div class="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 class="font-medium">Show Watchlist</h4>
                        <p class="text-sm text-muted-foreground">Allow others to see your watchlist</p>
                      </div>
                      <Switch bind:checked={privacySettings.showWatchlist} />
                    </div>
                  </div>
                  <div class="flex items-center justify-between p-3  border rounded-lg">
                    <div class="">
                      <h4 class="font-medium">Export Data</h4>
                      <p class="text-sm text-muted-foreground">Download a copy of all your data</p>
                    </div>
                    <Button variant="outline" size="sm" onclick={exportData} class="gap-2 ">
                      <Download class="w-4 h-4" />
                      Export
                    </Button>
                  </div>
                </Card.Content>
              </Card.Root>

            </div>
          {/if}
        </div>
      </div>
    </main>
  {:else}
    <!-- Not authenticated -->
    <div class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <Settings class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 class="text-2xl font-bold mb-4">Please sign in to access settings</h1>
        <Button onclick={() => goto('/login')}>Sign In</Button>
      </div>
    </div>
  {/if}
</div>