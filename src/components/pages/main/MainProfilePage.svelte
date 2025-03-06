<script lang="ts">
  import { goto } from '$app/navigation';
  import { Modal, Popover } from '@skeletonlabs/skeleton-svelte';
  import { CgMenuGridO } from 'svelte-icons-pack/cg';
  import { BiLogOut } from 'svelte-icons-pack/bi';
  import { signOut, authClient } from '~/lib/auth-client';
  import Icon from '~/tools/Icon.svelte';
  import NonAdminInfo from './NonAdminInfo.svelte';
  import AdminPanel from './AdminPanel.svelte';
  import { useQueryClient, useIsFetching } from '@tanstack/svelte-query';
  import { LuRefreshCw } from 'svelte-icons-pack/lu';
  import { cl_join } from '~/tools/cl_join';

  const query_client = useQueryClient();

  type SessionType = typeof authClient.$Infer.Session;

  let { user }: { user: SessionType['user'] } = $props();

  let dot_popover_status = $state(false);
  let logout_modal_status = $state(false);

  const log_out = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          goto('/login');
        }
      }
    });
  };

  const refresh_data = async () => {
    await Promise.all([
      query_client.invalidateQueries({
        queryKey: ['user_info']
      }),
      user.role === 'admin' &&
        query_client.invalidateQueries({
          queryKey: ['users_list']
        })
    ]);
  };

  const user_info_is_fetching = useIsFetching({
    queryKey: ['user_info']
  });
  const users_list_is_fetching = useIsFetching({
    queryKey: ['users_list']
  });

  let is_fetching = $derived(
    user.role === 'admin' ? !!$users_list_is_fetching : !!$user_info_is_fetching
  );
</script>

<div>
  <span class="text-lg font-semibold sm:text-xl">{user.name}</span>
  <Popover
    bind:open={dot_popover_status}
    positioning={{ placement: 'bottom' }}
    arrow={false}
    contentBase="card z-50 space-y-2 rounded-lg px-1 py-1 shadow-xl bg-surface-100-900"
    triggerBase="m-0 ml-6 sm:mk-10"
  >
    {#snippet trigger()}
      <span
        class="rounded-full outline-hidden select-none hover:text-gray-500 dark:hover:text-gray-400"
      >
        <Icon src={CgMenuGridO} class="text-2xl" />
      </span>
    {/snippet}
    {#snippet content()}
      <Modal
        bind:open={logout_modal_status}
        contentBase="card z-60 space-y-2 rounded-lg px-3 py-2 shadow-xl bg-surface-100-900"
        backdropBackground="backdrop-blur-xs"
      >
        {#snippet trigger()}
          <span
            class="btn flex gap-1 space-x-1 rounded-md px-1 py-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Icon class="text-2xl" src={BiLogOut} />
            <span class="text-sm font-semibold">Logout</span>
          </span>
        {/snippet}
        {#snippet content()}
          <div class="text-lg font-bold">Are you sure to logout ?</div>
          <div class="space-x-2">
            <button
              class="btn bg-surface-200 dark:bg-surface-700 rounded-lg font-semibold"
              onclick={log_out}
            >
              Confirm
            </button>
            <button
              onclick={() => (logout_modal_status = false)}
              class="btn preset-outlined-surface-800-200 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        {/snippet}
      </Modal>
    {/snippet}
  </Popover>
  <button
    class={cl_join(
      'btn m-0 ml-3 p-0 text-sm outline-hidden select-none hover:text-gray-500 sm:ml-4 dark:hover:text-gray-400',
      is_fetching && 'animate-spin'
    )}
    onclick={refresh_data}
    disabled={is_fetching}
  >
    <Icon src={LuRefreshCw} class="text-lg" />
  </button>
</div>
<a class="text-sm text-slate-500 sm:text-base dark:text-slate-400" href={`emailto:${user.email}`}
  >{user.email}</a
>
<div class="mt-3">
  {#if user.role === 'user'}
    <NonAdminInfo user_info={user} />
  {:else if user.role === 'admin'}
    <AdminPanel />
  {/if}
</div>
