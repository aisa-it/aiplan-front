import type { DtoFormLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { computed, ref, watch, type Ref } from 'vue';

import { FormService } from '../api/forms.service';

export function useFormsList(workspaceSlug: Ref<string>) {
  const forms = ref<DtoFormLight[]>([]);
  const searchQuery = ref<string | null>('');
  const loading = ref(false);
  const loadFailed = ref(false);
  const deleting = ref(false);
  const refreshCount = ref(0);

  const filteredForms = computed(() => {
    const query = searchQuery.value?.trim().toLowerCase();
    if (!query) return forms.value;

    return forms.value.filter((form) =>
      `${form.title ?? ''} ${form.slug ?? ''}`.toLowerCase().includes(query),
    );
  });

  watch(
    [workspaceSlug, refreshCount],
    async ([slug], [previousSlug], onCleanup) => {
      if (slug !== previousSlug) forms.value = [];

      const controller = new AbortController();
      const { signal } = controller;
      onCleanup(() => controller.abort());

      loading.value = true;
      loadFailed.value = false;
      try {
        const result = await FormService.getForms(slug, signal);
        if (!signal.aborted) forms.value = result;
      } catch {
        if (!signal.aborted) loadFailed.value = true;
      } finally {
        if (!signal.aborted) loading.value = false;
      }
    },
    { immediate: true },
  );

  async function deleteForm(formSlug: string) {
    if (deleting.value) return false;

    const slug = workspaceSlug.value;
    deleting.value = true;
    try {
      await FormService.deleteForm(slug, formSlug);
      if (slug === workspaceSlug.value) {
        forms.value = forms.value.filter((form) => form.slug !== formSlug);
        refreshCount.value++;
      }
      return true;
    } catch {
      // Ошибку запроса показывает общий interceptor.
      return false;
    } finally {
      deleting.value = false;
    }
  }

  return { searchQuery, filteredForms, loading, loadFailed, deleting, deleteForm };
}
