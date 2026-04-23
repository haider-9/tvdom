<script lang="ts">
  let { count = 3 }: { count?: number } = $props();
</script>

{#each Array(count) as _, i}
  <div class="bg-card rounded-xl border border-border overflow-hidden animate-pulse">
    <!-- Post Header -->
    <div class="p-4 sm:p-6">
      <div class="flex items-start gap-3 mb-4">
        <!-- Avatar skeleton -->
        <div class="w-11 h-11 bg-muted rounded-full flex-shrink-0"></div>
        
        <!-- User info skeleton -->
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-muted rounded w-32"></div>
          <div class="h-3 bg-muted rounded w-24"></div>
        </div>
        
        <!-- Menu button skeleton -->
        <div class="w-8 h-8 bg-muted rounded"></div>
      </div>

      <!-- Post content skeleton -->
      <div class="space-y-3 mb-4">
        <div class="h-4 bg-muted rounded w-full"></div>
        <div class="h-4 bg-muted rounded w-3/4"></div>
        <div class="h-4 bg-muted rounded w-1/2"></div>
      </div>

      <!-- Image skeleton -->
      <div class="aspect-video bg-muted rounded-lg mb-4"></div>

      <!-- Engagement stats skeleton -->
      <div class="flex items-center gap-4 py-3 border-t border-border">
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-muted rounded"></div>
          <div class="h-3 bg-muted rounded w-12"></div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-4 h-4 bg-muted rounded"></div>
          <div class="h-3 bg-muted rounded w-16"></div>
        </div>
      </div>
    </div>

    <!-- Actions skeleton -->
    <div class="px-4 sm:px-6 pb-4 border-t border-border">
      <div class="flex items-center gap-1">
        <div class="flex items-center gap-2 px-3 py-2">
          <div class="w-5 h-5 bg-muted rounded"></div>
          <div class="h-3 bg-muted rounded w-6"></div>
        </div>
        <div class="flex items-center gap-2 px-3 py-2">
          <div class="w-5 h-5 bg-muted rounded"></div>
          <div class="h-3 bg-muted rounded w-6"></div>
        </div>
        <div class="flex items-center gap-2 px-3 py-2">
          <div class="w-5 h-5 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  </div>
{/each}

<style>
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
</style>