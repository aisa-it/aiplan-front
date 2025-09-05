import GeneralUserSettings from './components/GeneralUserSettings.vue';
import PermissionUserSettings from './components/PermissionUserSettings.vue';
import { IUserSettingsTab } from './interfaces/types';

export const USER_SETTINGS_TABS: IUserSettingsTab[] = [
  {
    name: 0,
    label: 'Основные',
    component: GeneralUserSettings,
  },
  {
    name: 1,
    label: 'Доступ',
    component: PermissionUserSettings,
  },
];
