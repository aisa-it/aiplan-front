import { watch } from 'vue';
import { useQuasar } from 'quasar';

export function appVisibleTimeout<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
) {
  const $q = useQuasar();
  let lastTime: number;
  watch(
    () => $q?.appVisible,
    (newValue) => {
      if (!newValue) {
        lastTime = new Date().getTime();
      }
      const currentTime = new Date().getTime();
      if (newValue && currentTime - lastTime >= 5000) {
        return asyncFunction();
      }
    },
  );
}
