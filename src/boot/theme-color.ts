import { boot } from 'quasar/wrappers';
import { useThemeColor } from 'src/composables/useThemeColor';

export default boot(() => {
  useThemeColor();
});
