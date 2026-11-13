import { ref, shallowRef, watch } from 'vue';

import type { EditorSpecialLink } from '../model/editor.types';

export function useEditorLinkPreview<T>(
  link: () => EditorSpecialLink,
  resolver: () =>
    | ((link: EditorSpecialLink) => Promise<T | undefined>)
    | undefined,
) {
  const loading = ref(false);
  const preview = shallowRef<T>();
  const error = shallowRef<unknown>();

  watch(
    [link, resolver],
    async ([value, resolve], _, onCleanup) => {
      let cancelled = false;
      onCleanup(() => {
        cancelled = true;
      });
      preview.value = undefined;
      error.value = undefined;
      loading.value = !!resolve;
      if (!resolve) return;

      try {
        const result = await resolve(value);
        if (!cancelled) preview.value = result;
      } catch (reason) {
        if (!cancelled) error.value = reason;
      } finally {
        if (!cancelled) loading.value = false;
      }
    },
    { immediate: true },
  );

  return { loading, preview, error };
}
