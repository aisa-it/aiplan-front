import { defineAsyncComponent, ref, type Component } from 'vue';
import PageLoader from '@/components/loaders/PageLoader.vue';

type ProfileTab = {
  name: string;
  label: string;
  component: Component | null;
};

const createAsyncTab = (loader: () => Promise<Component>) =>
  defineAsyncComponent({
    loader,
    loadingComponent: PageLoader,
    delay: 200,
    suspensible: false,
  });

const PROFILE_TABS: ProfileTab[] = [
  {
    name: 'general',
    label: 'Основные',
    component: createAsyncTab(
      () => import('../components/GeneralProfileSettings.vue'),
    ),
  },
  {
    name: 'activities',
    label: 'Активности',
    component: createAsyncTab(
      () => import('../components/ActivitiesProfileSettings.vue'),
    ),
  },
  {
    name: 'appearance',
    label: 'Оформление',
    component: null,
  },
];

export const useProfileTabs = () => {
  const profileSettingsTab = ref(PROFILE_TABS[0].name);

  return {
    listTabs: PROFILE_TABS,
    profileSettingsTab,
  };
};
