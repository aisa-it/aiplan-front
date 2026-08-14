import { markRaw, ref, type Component } from 'vue';

import GeneralProfileSettings from '../components/GeneralProfileSettings.vue';

type ProfileTab = {
  name: string;
  label: string;
  component: Component | null;
};

const PROFILE_TABS: ProfileTab[] = [
  {
    name: 'general',
    label: 'Основные',
    component: markRaw(GeneralProfileSettings),
  },
  {
    name: 'activities',
    label: 'Активности',
    component: null,
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
