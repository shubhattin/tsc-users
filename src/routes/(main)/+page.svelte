<script lang="ts">
  import { useSession } from '$lib/auth-client';
  import type { PageData } from './$types';
  import { browser } from '$app/environment';

  const session = useSession();

  let { data }: { data: PageData } = $props();

  let user_info_fetched = $state(false);

  let user_info = $derived(user_info_fetched ? $session.data?.user : data.user_info);

  $effect(() => {
    if (browser && $session.data?.user) {
      user_info_fetched = true;
    }
  });
</script>

<svelte:head>
  <title>Profile Page</title>
</svelte:head>

{#if user_info}
  {JSON.stringify(user_info)}
{/if}
