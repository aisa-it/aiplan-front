import { ref, computed } from 'vue';
import { IUserSettingsTab } from '../interfaces/types';

export function useTabs(tabsConfig: IUserSettingsTab[], initialTab = 0) {
  const activeTab = ref(initialTab);

  const activeComponent = computed(
    () => tabsConfig.find((tab) => tab.name === activeTab.value)?.component,
  );

  const setActiveTab = (tabId: number) => {
    activeTab.value = tabId;
  };

  return {
    activeTab,
    activeComponent,
    setActiveTab,
    tabsConfig,
  };
}
