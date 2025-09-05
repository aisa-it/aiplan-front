import { ref } from 'vue';
import { ISettingsTab } from 'src/shared/types/settings-tabs';

export const useProfileTabs = () => {
  // Вкладки настроек профиля
  const listTabs = [
    {
      name: 0,
      label: 'Основные',
    },
    {
      name: 1,
      label: 'Активности',
    },
    {
      name: 2,
      label: 'Оформление',
    },
  ] as ISettingsTab[];

  const profileSettingsTab = ref<number>(0);
  const setTab = (value: number): void => {
    profileSettingsTab.value = value;
  };
  return { listTabs, profileSettingsTab, setTab };
};
