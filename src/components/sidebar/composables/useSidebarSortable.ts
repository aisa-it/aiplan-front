import { nextTick, onBeforeUnmount, ref, watch, type Ref } from 'vue';
import Sortable from 'sortablejs';
import type { SidebarSectionId } from './useSidebarPreferences';

export function useSidebarSortable(
  sidebarMain: Ref<HTMLElement | null>,
  compact: Ref<boolean>,
  isAiDocRoute: Ref<boolean>,
  setVisibleOrder: (ids: SidebarSectionId[]) => void,
) {
  const ignoreNextClick = ref(false);
  let sortable: Sortable | null = null;

  watch(
    [compact, isAiDocRoute],
    async () => {
      await nextTick();
      sortable?.destroy();
      sortable = null;
      if (compact.value || isAiDocRoute.value || !sidebarMain.value) return;
      sortable = Sortable.create(sidebarMain.value, {
        draggable: '.sidebar-section',
        handle: '.sidebar-section-header',
        filter: 'button, a, .sidebar-height-handle',
        preventOnFilter: false,
        animation: 150,
        ghostClass: 'sidebar-sort-ghost',
        chosenClass: 'sidebar-sort-chosen',
        fallbackClass: 'sidebar-sort-fallback',
        forceFallback: true,
        fallbackOnBody: true,
        fallbackTolerance: 5,
        delay: 300,
        delayOnTouchOnly: true,
        touchStartThreshold: 5,
        onStart: () => {
          ignoreNextClick.value = true;
        },
        onEnd: (event) => {
          const item = event.item as HTMLElement;
          const ids = Array.from(event.to.children)
            .map((el) => (el as HTMLElement).dataset.sidebarSection)
            .filter(
              (id): id is SidebarSectionId =>
                id === 'projects' || id === 'sprints',
            );

          item.remove();
          event.from.insertBefore(
            item,
            event.from.children[event.oldIndex ?? 0] ?? null,
          );
          setVisibleOrder(ids);
          window.setTimeout(() => {
            ignoreNextClick.value = false;
          }, 200);
        },
      });
    },
    { immediate: true, flush: 'post' },
  );

  onBeforeUnmount(() => sortable?.destroy());
  return { ignoreNextClick };
}
