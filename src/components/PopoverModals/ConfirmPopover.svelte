<script lang="ts">
  import { Popover } from '@skeletonlabs/skeleton-svelte';
  import type { Snippet } from 'svelte';
  import type { Placement } from '@floating-ui/dom';
  import { cl_join } from '~/tools/cl_join';

  let {
    children,
    popup_state = $bindable(),
    description,
    cancel_func,
    confirm_func,
    contentBase,
    placement,
    class: className,
    triggerBase
  }: {
    children: Snippet;
    confirm_func?: () => void;
    cancel_func?: () => void;
    description: string;
    popup_state: boolean;
    contentBase?: string;
    placement: Placement;
    class?: string;
    triggerBase?: string;
  } = $props();
</script>

<Popover
  open={popup_state}
  onOpenChange={(e) => (popup_state = e.open)}
  positioning={{ placement: placement }}
  arrow={false}
  contentBase={cl_join(
    'card z-70 space-y-2 p-2 rounded-lg shadow-xl bg-surface-100-900',
    contentBase
  )}
  triggerBase={cl_join(triggerBase)}
>
  {#snippet trigger()}
    {@render children()}
  {/snippet}
  {#snippet content()}
    <div class={cl_join('text-lg font-bold', className)}>{description}</div>
    <div class="space-x-2">
      <button
        class={cl_join(
          'btn rounded-lg bg-surface-200 font-semibold dark:bg-surface-700',
          className
        )}
        onclick={confirm_func}
      >
        Confirm
      </button>
      <button
        onclick={() => {
          popup_state = false;
          cancel_func && cancel_func();
        }}
        class={cl_join('preset-outline-surface-800-200 btn rounded-lg font-semibold', className)}
      >
        Cancel
      </button>
    </div>
  {/snippet}
</Popover>
