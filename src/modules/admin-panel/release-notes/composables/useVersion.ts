import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useUtilsStore } from 'src/stores/utils-store';

const utilsStore = useUtilsStore();

export function useVersion() {
  const { version } = storeToRefs(utilsStore);

  onMounted(async () => {
    if (!version.value) await utilsStore.getVersion();
  });

  return { version };
}
