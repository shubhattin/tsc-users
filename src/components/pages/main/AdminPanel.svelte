<script lang="ts">
  import { client } from '~/api/client';
  import { createQuery } from '@tanstack/svelte-query';
  import { Segment, Tabs } from '@skeletonlabs/skeleton-svelte';

  const users_list = createQuery({
    queryKey: ['users_list'],
    queryFn: async () => {
      const res = await client.user.list_users.$get();
      return await res.json();
    }
  });

  let selected_user_id = $state<string | null>('');
  let selected_user_type = $state<'admin' | 'regular' | 'unapproved'>('regular');

  $effect(() => {
    // on tab change reset the selected user id
    if (selected_user_type) selected_user_id = null;
  });

  const get_filtered_users = () => {
    const users = $users_list.data!;
    if (selected_user_type === 'admin') {
      return users.filter((user) => user.role === 'admin');
    } else if (selected_user_type === 'regular') {
      return users.filter((user) => user.role === 'user');
    } else if (selected_user_type === 'unapproved') {
      return users.filter((user) => !user.user_info?.is_approved);
    }
  };

  const get_string_trimmed = (str: string, limit: number = 20) => {
    if (str.length > limit) return str.substring(0, limit) + '...';
    return str;
  };
</script>

{#if !$users_list.isFetching && $users_list.isSuccess}
  <Tabs bind:value={selected_user_type} base="mt-6">
    {#snippet list()}
      <Tabs.Control labelClasses="rounded-md font-semibold" value="admin">Admin</Tabs.Control>
      <Tabs.Control labelClasses="rounded-md font-semibold" value="regular">Regular</Tabs.Control>
      <Tabs.Control labelClasses="rounded-md font-semibold" value="unapproved"
        >Unapproved</Tabs.Control
      >
    {/snippet}
    {#snippet content()}
      {@const users = get_filtered_users()!}
      {@const user = users.find((user) => user.id === selected_user_id)}
      <div
        class="flex flex-col items-center justify-center space-y-2.5 sm:flex-row sm:items-start sm:justify-normal sm:space-x-3"
      >
        <Segment
          name="size"
          orientation="vertical"
          onValueChange={(e) => (selected_user_id = e.value!)}
          gap="gap-y-1 sm:gap-y-1.5"
        >
          {#each users as user (user.id)}
            <Segment.Item labelClasses="text-base" value={user.id}
              >{get_string_trimmed(user.name)}</Segment.Item
            >
          {/each}
        </Segment>
        <div class="mt-2">
          {#if user}
            {user.name}
          {/if}
        </div>
      </div>
    {/snippet}
  </Tabs>
{:else}
  <div class="placeholder h-40 animate-pulse rounded-md"></div>
{/if}
