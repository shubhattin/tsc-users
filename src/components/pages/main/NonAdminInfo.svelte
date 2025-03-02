<script lang="ts">
  import { client } from '~/api/client';
  import { createQuery } from '@tanstack/svelte-query';
  import { Tabs } from '@skeletonlabs/skeleton-svelte';

  const projects_info = createQuery({
    queryKey: ['projects_info'],
    queryFn: async () => {
      const res = await client.user.user_info.$get();
      return await res.json();
    }
  });

  let selected_project_id = $state<string>('');

  $effect(() => {
    // select the first project
    if (!$projects_info.data?.is_approved || $projects_info.data?.projects.length === 0) return;
    selected_project_id = $projects_info.data!.projects[0]?.project_id.toString();
  });
</script>

{#if !$projects_info.isFetching && $projects_info.isSuccess}
  {@const data = $projects_info.data}
  {#if !data.is_approved}
    <div class="dark:text-warning-500 text-warning-600">
      Your Account has not been approved yet. <span class="text-xs">Contact the admin</span>
    </div>
  {:else}
    {@const projects = data.projects}
    {#if projects.length === 0}
      <div>You Have not been assigned to any projects yet.</div>
    {:else}
      <Tabs bind:value={selected_project_id} base="mt-6">
        {#snippet list()}
          {#each projects as project (project.project_id)}
            <Tabs.Control
              labelClasses="rounded-md font-semibold"
              value={project.project_id.toString()}>{project.project_name}</Tabs.Control
            >
          {/each}
        {/snippet}
        {#snippet content()}
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
              <div class="mt-2">You have not been alloted any Languages to work upon.</div>
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
        {/snippet}
      </Tabs>
    {/if}
  {/if}
{:else}
  <div class="placeholder h-40 animate-pulse rounded-md"></div>
{/if}
