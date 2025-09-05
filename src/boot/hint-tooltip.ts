import { boot } from 'quasar/wrappers';
import HintTooltip from 'src/components/HintTooltip.vue';

export default boot(({ app }) => {
  app.component('HintTooltip', HintTooltip);
});