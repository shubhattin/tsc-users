<script lang="ts">
  import { ProgressRing } from '@skeletonlabs/skeleton-svelte';

  let value = $state(25);
  let max = 100;
</script>

<div class="grid grid-cols-1 justify-center gap-4">
  <ProgressRing {value} {max} />
  <input type="range" class="input max-w-32" bind:value {max} />
</div>
<div class="text-center text-xl font-bold">Good</div>
