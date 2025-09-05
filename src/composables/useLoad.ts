import { ref } from 'vue';

export function useLoad<T>(asyncFunction: (...args: any[]) => Promise<T>) {
  const loading = ref(false);

  const onLoad = async (
    ...args: Parameters<typeof asyncFunction>
  ): Promise<T | undefined> => {
    if (loading.value) return;
    loading.value = true;
    try {
      return await asyncFunction(...args);
    } finally {
      loading.value = false;
    }
  };

  return { loading, onLoad };
}
