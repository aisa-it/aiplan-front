import { ref, defineAsyncComponent, type Component } from 'vue';

interface ISettingsTab {
  name: number;
  label: string;
  dataId?: string;
  isDisabled?: boolean;
  component?: Component | null;
}

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

  const listTabs = [
    {
      name: 0,
      label: 'Основные',
      component: null,
      // component: asyncImport(
      //   () => import('../components/GeneralProfileSettings.vue'),
      // ),
    },
    {
      name: 1,
      label: 'Активности',
      component: null,
      // component: asyncImport(
      //   () => import('../components/ActivitiesProfileSettings.vue'),
      // ),
    },
    {
      name: 2,
      label: 'Оформление',
      component: null,
      // component: asyncImport(
      //   () => import('../components/DesignProfileSettings.vue'),
      // ),
    },
  ] as ISettingsTab[];

  const profileSettingsTab = ref<number>(0);
  const setTab = (value: number): void => {
    profileSettingsTab.value = value;
  };
  return { listTabs, profileSettingsTab, setTab, isLoadingComponent };
};
