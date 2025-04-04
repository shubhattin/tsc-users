<script lang="ts">
  import { client } from '~/api/client';
  import { createQuery } from '@tanstack/svelte-query';
  import { Segment, Tabs } from '@skeletonlabs/skeleton-svelte';
  import NonAdminInfo from './NonAdminInfo.svelte';
  import { selected_user_id, selected_user_type } from '~/state/main';
  import RevokeSessions from './RevokeSessions.svelte';

  const users_list = createQuery({
    queryKey: ['users_list'],
    queryFn: async () => {
      const res = await client.user.list_users.$get();
      return await res.json();
    }
  });

  $effect(() => {
    // on tab change reset the selected user id
    if ($selected_user_type) $selected_user_id = null;
  });

  const get_filtered_users = () => {
    const users = $users_list.data!;
    if ($selected_user_type === 'admin') {
      return users.filter((user) => user.role === 'admin');
    } else if ($selected_user_type === 'regular') {
      return users.filter((user) => user.role === 'user' && user.is_approved);
    } else if ($selected_user_type === 'unapproved') {
      return users.filter((user) => user.role !== 'admin' && !user.is_approved);
    }
  };

  const get_string_trimmed = (str: string, limit: number = 15) => {
    if (str.length > limit) return str.substring(0, limit) + '...';
    return str;
  };
</script>

{#if !$users_list.isFetching && $users_list.isSuccess}
  <Tabs
    value={$selected_user_type}
    base="mt-6"
    onValueChange={(e) => ($selected_user_type = e.value as typeof $selected_user_type)}
  >
    {#snippet list()}
      <Tabs.Control labelClasses="rounded-md font-semibold" value="admin">Admin</Tabs.Control>
      <Tabs.Control labelClasses="rounded-md font-semibold" value="regular">Regular</Tabs.Control>
      <Tabs.Control labelClasses="rounded-md font-semibold text-sm" value="unapproved"
        >Unapproved</Tabs.Control
      >
    {/snippet}
    {#snippet content()}
      {@const users = get_filtered_users()!}
      {@const user = users.find((user) => user.id === $selected_user_id)}
      {#key $selected_user_type}
        {#if users.length === 0}
          <div class="text-warning-600 dark:text-warning-500">No Users Found</div>
        {:else}
          <div
            class="flex flex-col items-center justify-center space-y-2.5 sm:flex-row sm:items-start sm:justify-normal sm:space-x-3"
          >
            <div>
              <Segment
                name="size"
                orientation="vertical"
                onValueChange={(e) => ($selected_user_id = e.value!)}
                gap="gap-y-1 sm:gap-y-1.5"
              >
                {#each users as user (user.id)}
                  <Segment.Item labelClasses="text-base" value={user.id}>
                    {get_string_trimmed(user.name)}
                  </Segment.Item>
                {/each}
              </Segment>
            </div>
            <div class="mt-2 ml-0 w-full sm:ml-2">
              {#if user}
                {#if $selected_user_type === 'regular' || $selected_user_type === 'unapproved'}
                  <NonAdminInfo user_info={user} admin_edit={true} />
                {:else if $selected_user_type === 'admin'}
                  <div class="mt-2 text-base font-semibold">{user.name}</div>
                  <a
                    class="text-xs text-slate-500 sm:text-sm dark:text-slate-400"
                    href={`emailto:${user.email}`}>{user.email}</a
                  >
                  <RevokeSessions user_id={user.id} />
                {/if}
              {/if}
            </div>
          </div>
        {/if}
      {/key}
    {/snippet}
  </Tabs>
{:else}
  <div class="h-96 placeholder animate-pulse rounded-md"></div>
{/if}
