import { ref, defineAsyncComponent } from 'vue';
import { ISettingsTab } from 'src/shared/types/settings-tabs';

export const useProfileTabs = () => {
  const isLoadingComponent = ref(false);

  function asyncImport(loader: () => Promise<any>) {
    return defineAsyncComponent(async () => {
      isLoadingComponent.value = true;

      const component = await loader();

      isLoadingComponent.value = false;
      return component;
    });
  }
  // Вкладки настроек профиля
  const listTabs = [
    {
      name: 0,
      label: 'Основные',
      component: asyncImport(
        () => import('../components/GeneralProfileSettings.vue'),
      ),
    },
    {
      name: 1,
      label: 'Активности',
      component: asyncImport(
        () => import('../components/ActivitiesProfileSettings.vue'),
      ),
    },
    {
      name: 2,
      label: 'Оформление',
      component: asyncImport(
        () => import('../components/DesignProfileSettings.vue'),
      ),
    },
    {
      name: 3,
      label: 'Тариф',
      component: asyncImport(
        () => import('../components/TariffSettings.vue'),
      ),
    },
  ] as ISettingsTab[];

  const profileSettingsTab = ref<number>(0);
  const setTab = (value: number): void => {
    profileSettingsTab.value = value;
  };
  return { listTabs, profileSettingsTab, setTab, isLoadingComponent };
};
