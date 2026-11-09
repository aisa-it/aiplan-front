import { defineAsyncComponent, ref, type Component } from 'vue';
import PageLoader from '@/components/loaders/PageLoader.vue';

export type ProfileTabName = 'general' | 'activities' | 'design';

type ProfileTab = {
  name: ProfileTabName;
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
    component: createAsyncTab(
      () => import('../components/GeneralProfileSettings.vue'),
    ),
  },
  {
    name: 'activities',
    component: createAsyncTab(
      () => import('../components/ActivitiesProfileSettings.vue'),
    ),
  },
  {
    name: 'design',
    component: createAsyncTab(
      () => import('../components/DesignProfileSettings.vue'),
    ),
  },
];

export const useProfileTabs = () => {
  const profileSettingsTab = ref(PROFILE_TABS[0].name);

  return {
    listTabs: PROFILE_TABS,
    profileSettingsTab,
  };
};
