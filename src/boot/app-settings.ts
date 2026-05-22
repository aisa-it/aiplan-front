import { boot } from 'quasar/wrappers';
import { useUtilsStore } from 'src/stores/utils-store';
import { isServerVersionNewer } from 'src/utils/helpers';

/**
 * Boot файл для инициализации App settings store
 *
 */
export default boot(async () => {
  const utilsStore = useUtilsStore();

  try {
    await utilsStore.getVersion().then(async (data) => {
      await utilsStore.getReleaseNotes().then((d) => {
        if (!d?.length) return;

        if (d[0].tag_name !== data.version) return;

        if (isServerVersionNewer(data.version)) {
          localStorage.setItem('appVersion', data.version);
          utilsStore.openReleaseNote = true;
        }
      });
    });
  } catch (error) {
    // Ошибки уже обрабатываются в store, просто логируем
    console.error(
      '[Boot:App-settings] Failed to initialize App-settings store:',
      error,
    );
  }
});
