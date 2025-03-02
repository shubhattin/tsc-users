<script lang="ts">
  import { client } from '~/api/client';
  import { createQuery, useQueryClient } from '@tanstack/svelte-query';
  import ConfirmPopover from '~/components/PopoverModals/ConfirmPopover.svelte';
  import { project_list, selected_user_type } from '~/state/main';
  import Icon from '~/tools/Icon.svelte';
  import { BsPlusLg } from 'svelte-icons-pack/bs';
  import { cl_join } from '~/tools/cl_join';
  import { Popover } from '@skeletonlabs/skeleton-svelte';
  import { CgClose } from 'svelte-icons-pack/cg';

  const query_client = useQueryClient();

  let {
    user_info,
    admin_edit = false
  }: {
    user_info: { id: string; name: string; email: string; role: string | null };
    admin_edit?: boolean;
  } = $props();

  const projects_info = $derived(
    createQuery({
      queryKey: ['user_info', user_info.id],
      queryFn: async () => {
        const res = await client.user.user_info[`:id`].$get({
          param: {
            id: user_info.id
          }
        });
        return await res.json();
      }
    })
  );

  let selected_project_id = $state<string>('');

  $effect(() => {
    // select the first project
    if (!$projects_info.data?.is_approved || $projects_info.data?.projects.length === 0) return;
    selected_project_id = $projects_info.data!.projects[0]?.project_id.toString();
  });

  let approve_popup_state = $state(false);

  const approve_user_func = async () => {
    $projects_info.refetch();
    const req = await client.user.approve[':id'].$post({
      param: {
        id: user_info.id
      }
    });
    if (req.ok) {
      query_client.invalidateQueries({
        queryKey: ['user_info', user_info.id]
      });
      query_client.invalidateQueries({
        queryKey: ['users_list']
      });
      $selected_user_type = 'regular';
      // $selected_user_id = user_info.id;
    }
  };

  let add_project_popup = $state(false);
  let approve_add_project_popup = $state(false);

  const add_project_for_user = async (project_id: number) => {
    add_project_popup = false;
    const res = await client.project.add_to_project.$post({
      json: { user_id: user_info.id, project_id }
    });
    if (!res.ok) return;
    query_client.invalidateQueries({
      queryKey: ['user_info', user_info.id],
      exact: true
    });
  };

  let approve_remove_project_popup = $state(false);

  const project_remove = async (project_id: number) => {
    approve_remove_project_popup = false;
    const res = await client.project.remove_from_project.$post({
      json: { user_id: user_info.id, project_id }
    });
    if (!res.ok) return;
    query_client.invalidateQueries({
      queryKey: ['user_info', user_info.id],
      exact: true
    });
  };
</script>

{#if !$projects_info.isFetching && $projects_info.isSuccess}
  {@const data = $projects_info.data}
  {#if admin_edit}
    <div class="text-base font-semibold">{user_info.name}</div>
    <a
      class="text-xs text-slate-500 sm:text-sm dark:text-slate-400"
      href={`emailto:${user_info.email}`}>{user_info.email}</a
    >
  {/if}
  {#if !data.is_approved}
    {#if !admin_edit}
      <div class="dark:text-warning-500 text-warning-600">
        Your Account has not been approved yet. <span class="text-xs">Contact the admin</span>
      </div>
    {:else}
      <div class="dark:text-warning-500 text-warning-600 mt-2">
        This account has not been Approved.
      </div>
      <ConfirmPopover
        bind:popup_state={approve_popup_state}
        confirm_func={() => {
          approve_popup_state = false;
          approve_user_func();
        }}
        placement="right"
        description="Sure to Approve this User ?"
      >
        <span class="btn bg-primary-500 mt-1.5 px-1 py-0 text-sm font-bold">Approve</span>
      </ConfirmPopover>
    {/if}
  {:else}
    {@const projects = data.projects}
    {#if projects.length === 0}
      {#if !admin_edit}
        <div>You Have not been assigned to any projects yet.</div>
      {:else}
        <div class="mt-2 text-sm">No Projects Alloted to this user</div>
        <div class="mt-2.5">
          {@render add_project(true)}
        </div>
      {/if}
    {:else}
      <div class="mt-2.5">
        <label class="inline-block">
          <span class="label-text font-semibold">Project</span>
          <select bind:value={selected_project_id} class="select w-56 text-sm sm:w-60">
            {#each projects as project}
              <option value={project.project_id.toString()}>{project.project_name}</option>
            {/each}
          </select>
        </label>
        {@render add_project()}
        <ConfirmPopover
          bind:popup_state={approve_remove_project_popup}
          confirm_func={() => {
            approve_remove_project_popup = false;
            project_remove(project!.project_id);
          }}
          placement="bottom"
          description="Sure to unassign this Project ?"
          class="text-sm"
        >
          <span class="ml-2 hover:text-red-600 dark:hover:text-red-500">
            <Icon src={CgClose} class="text-xl" />
          </span>
        </ConfirmPopover>
      </div>
      {@const project = projects.find(
        (project) => project.project_id.toString() === selected_project_id
      )}
      {#if project}
        {#if project.project_description}
          <div class="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {project.project_description}
          </div>
        {/if}
        {@const languages = project.langugaes}
        {#if languages.length === 0}
          {#if !admin_edit}
            <div class="mt-2">You have not been alloted any Languages to work upon.</div>
          {/if}
        {:else}
          <div class="mt-2">
            <div class="flex gap-2 text-sm text-slate-600 dark:text-slate-200">
              <div>Languages</div>
              <div class="flex gap-2">
                {#each languages as language}
                  <div class="rounded-md bg-zinc-200 px-2 py-1 text-xs dark:bg-slate-700">
                    {language.lang_name}
                  </div>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      {/if}
    {/if}
  {/if}
{:else}
  <div class="placeholder h-40 w-full animate-pulse rounded-md"></div>
{/if}

{#snippet add_project(new_list = false)}
  {#if $project_list.isSuccess && $projects_info.data!.is_approved && $projects_info.data!.projects.length !== $project_list.data.length}
    <Popover
      bind:open={add_project_popup}
      positioning={{ placement: new_list ? 'right' : 'bottom' }}
      arrow={false}
      contentBase="card z-50 space-y-1 sm:space-y-1.5 rounded-lg px-2 py-1 shadow-xl bg-surface-100-900"
      triggerBase="ml-1"
    >
      {#snippet trigger()}
        <span
          class={cl_join(
            'dark:bg-primary-600 bg-primary-500 gap-1 rounded-md px-1 py-1 font-semibold text-white',
            new_list && 'px-2'
          )}
        >
          <Icon src={BsPlusLg} class="text-xl" />
          {#if new_list}
            Add Project
          {/if}
        </span>
      {/snippet}
      {#snippet content()}
        {#each $project_list.data as project}
          {#if $projects_info.data!.is_approved && !$projects_info.data!.projects.find((p) => p.project_id === project.id)}
            <div class="block w-full">
              <ConfirmPopover
                bind:popup_state={approve_add_project_popup}
                confirm_func={() => {
                  approve_add_project_popup = false;
                  add_project_for_user(project.id);
                }}
                placement="bottom"
                description={`Are you sure you want this user to '${project.name}' project ?`}
                class="text-sm"
                triggerBase="btn block w-full gap-1 space-x-1 rounded-md px-1 py-0 text-center hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {project.name}
              </ConfirmPopover>
            </div>
          {/if}
        {/each}
      {/snippet}
    </Popover>
  {/if}
{/snippet}
