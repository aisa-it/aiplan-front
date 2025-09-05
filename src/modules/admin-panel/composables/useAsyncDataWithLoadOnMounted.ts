import { ref, onMounted } from 'vue';
import { useLoad } from 'src/composables/useLoad';
import type { Ref } from 'vue';

export function useAsyncDataWithLoadOnMounted<T, Args extends any[] = any[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  initial: T,
  args?: Args,
  catchFunction?: (err: any) => void,
) {
  const { loading, onLoad } = useLoad<T>(asyncFunction);
  const data = ref<T>(initial) as Ref<T>;

  let resolveReady!: () => void;
  const ready = new Promise<void>((resolve) => {
    resolveReady = resolve;
  });

  const execute = async (executeArgs?: Args): Promise<T> => {
    const actualArgs = executeArgs ?? args ?? ([] as unknown as Args);
    return onLoad(...actualArgs)
      .then((res) => (data.value = res ?? initial))
      .catch((e) => {
        if (catchFunction) catchFunction(e);
        return initial;
      });
  };

  onMounted(async () => {
    await execute();
    resolveReady();
  });

  return {
    loading,
    data,
    execute,
    ready,
  };
}
