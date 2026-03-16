<script lang="ts">
  import { draggable } from '@neodrag/svelte';
  import Close from 'phosphor-svelte/lib/X';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { scale } from 'svelte/transition';
  import { twMerge } from 'tailwind-merge';

  type Props = Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'class'> & {
    /**
     * The title of the window.
     */
    title?: Snippet;
    /**
     * Additional action buttons in the title bar.
     */
    titleBarActions?: Snippet;
    /**
     * The window content.
     */
    children?: Snippet;
    /**
     * Additional classes to apply to the root.
     */
    class?: string;
    /**
     * Callback when the window is closed.
     */
    onClose?: () => void;
  };

  let { title, titleBarActions, children, onClose, class: className, ...props }: Props = $props();

  let dragHandleElement: HTMLDivElement | undefined = $state();
</script>

<div
  in:scale={{ duration: 200 }}
  use:draggable={{ bounds: 'body', handle: dragHandleElement }}
  class={twMerge('z-40 w-[15rem] rounded-md bg-pir-panel drop-shadow-lg', className)}
  {...props}
>
  <!-- Title bar -->
  <div class="flex">
    <div
      bind:this={dragHandleElement}
      class="flex flex-1 cursor-move items-center gap-2 bg-pir-dark px-4 py-2"
    >
      {@render title?.()}
    </div>
    <div class="ml-auto flex">
      {@render titleBarActions?.()}
      <button
        onclick={onClose}
        class="bg-pir-dark px-5 py-3 text-slate-300 transition hover:bg-pir-red hover:text-white active:bg-red-800 active:text-white"
      >
        <Close weight="bold" />
      </button>
    </div>
  </div>

  <!-- Content -->
  <div class="p-4">
    {@render children?.()}
  </div>
</div>
