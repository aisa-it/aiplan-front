import { computed, ref } from 'vue';
import { useDisplay } from 'vuetify';
import { useResizeObserver } from '@vueuse/core';

const isMobileDevice =
  typeof navigator !== 'undefined' &&
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(
    navigator.userAgent,
  );

export function useEditorMobileLayout() {
  const { width } = useDisplay();
  const editorRootRef = ref<HTMLElement | null>(null);
  const editorToolbarHeight = ref(0);

  const isMobile = computed(() => isMobileDevice && width.value < 1024);

  useResizeObserver(editorRootRef, (entries) => {
    if (!isMobile.value) return;
    const entry = entries[0];
    if (entry) editorToolbarHeight.value = entry.contentRect.height;
  });

  return { isMobile, editorRootRef, editorToolbarHeight };
}
