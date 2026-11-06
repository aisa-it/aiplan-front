import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import type { MessageKey } from './index';

export const useTranslatedOptions = <V>(
  options: ReadonlyArray<{ labelKey: MessageKey; value: V }>,
) => {
  const { t } = useI18n();
  return computed(() =>
    options.map((option) => ({
      title: t(option.labelKey),
      value: option.value,
    })),
  );
};
