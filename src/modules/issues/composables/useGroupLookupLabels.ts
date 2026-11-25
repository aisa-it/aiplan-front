import { shallowRef, watch } from 'vue';
import type { DtoProjectPropertyTemplate } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { httpClient } from '@/services/clients';

export const useGroupLookupLabels = (
  workspaceSlug: string,
  projectId: string | undefined,
  getTemplate: () => DtoProjectPropertyTemplate | undefined,
) => {
  const labels = shallowRef<Record<string, string>>({});
  watch(
    getTemplate,
    async (template, _, onCleanup) => {
      labels.value = {};
      // The server already returns dictionary_id, but the installed DTO omits it.
      const lookup = template as
        | (DtoProjectPropertyTemplate & { dictionary_id?: string | null })
        | undefined;
      if (!projectId || lookup?.type !== 'lookup' || !lookup.dictionary_id) return;

      const controller = new AbortController();
      onCleanup(() => controller.abort());
      const [workspace, project, dictionary] = [
        workspaceSlug,
        projectId,
        lookup.dictionary_id,
      ].map(encodeURIComponent);
      const endpoint = `/api/auth/workspaces/${workspace}/projects/${project}/dictionaries/${dictionary}/rows/`;
      const entries = new Map<string, string>();
      const limit = 500;
      let offset = 0;
      try {
        while (!controller.signal.aborted) {
          const { data } = await httpClient.get<{
            count?: number;
            result?: { id?: string; value?: string }[];
          }>(endpoint, {
            params: { offset, limit, include_archived: true },
            signal: controller.signal,
          });
          const rows = data.result ?? [];
          for (const row of rows) {
            if (row.id && row.value) entries.set(row.id, row.value);
          }
          offset += rows.length;
          if (
            !rows.length ||
            (data.count === undefined
              ? rows.length < limit
              : offset >= data.count)
          )
            break;
        }
        if (!controller.signal.aborted)
          labels.value = Object.fromEntries(entries);
      } catch {}
    },
    { immediate: true },
  );
  return labels;
};
