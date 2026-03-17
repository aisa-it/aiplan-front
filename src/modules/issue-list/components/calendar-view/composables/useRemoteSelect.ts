import { ref } from 'vue';
import { debounce } from 'quasar';

export function useRemoteSelect<T>(options: {
  fetch: (search?: string) => Promise<T[]>;
  debounceMs?: number;
}) {
  const list = ref<T[]>([]);
  const searched = ref<T[] | null>(null);
  const search = ref('');

  const load = async () => {
    list.value = await options.fetch();
  };

  const handleSearch = debounce(async (val?: string) => {
    search.value = val ?? '';
    searched.value = val ? await options.fetch(val) : null;
  }, options.debounceMs ?? 700);

  return {
    list,
    searched,
    search,
    load,
    handleSearch,
  };
}
