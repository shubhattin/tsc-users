import { writable } from 'svelte/store';
import { queryClient } from '~/state/queryClient';
import { createQuery } from '@tanstack/svelte-query';
import { client } from '~/api/client';
import ms from 'ms';

export let selected_user_id = writable<string | null>('');
export let selected_user_type = writable<'admin' | 'regular' | 'unapproved'>('regular');

export const language_list = createQuery(
  {
    queryKey: ['language_list'],
    queryFn: async () => {
      const res = await client.project.list_languages.$get();
      return await res.json();
    },
    staleTime: ms('30mins')
  },
  queryClient
);
export const project_list = createQuery(
  {
    queryKey: ['project_list'],
    queryFn: async () => {
      const res = await client.project.list_projects.$get();
      return await res.json();
    },
    staleTime: ms('30mins')
  },
  queryClient
);
