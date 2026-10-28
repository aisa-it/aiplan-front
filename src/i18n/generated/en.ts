// АВТОГЕНЕРАЦИЯ — не править вручную.
// Источник: scripts/i18n-dictionaries.mjs (запускается плагином Vite и `yarn i18n:generate`).
import type ru from './ru';
import activitiesEn from '@/modules/activities/i18n/en';
import activityHotMapEn from '@/components/activity-hot-map/i18n/en';
import authEn from '@/modules/auth/i18n/en';
import dialogsEn from '@/components/dialogs/i18n/en';
import guidedToursEn from '@/modules/guided-tours/i18n/en';
import paginationEn from '@/components/pagination/i18n/en';
import profileEn from '@/modules/profile/i18n/en';
import selectWorkspaceEn from '@/components/select-workspace/i18n/en';
import toastEn from '@/modules/toast/i18n/en';
import userStatusEn from '@/components/user-status/i18n/en';

const messages = {
  activities: activitiesEn,
  activityHotMap: activityHotMapEn,
  auth: authEn,
  dialogs: dialogsEn,
  guidedTours: guidedToursEn,
  pagination: paginationEn,
  profile: profileEn,
  selectWorkspace: selectWorkspaceEn,
  toast: toastEn,
  userStatus: userStatusEn,
} satisfies typeof ru;

true satisfies (typeof ru extends typeof messages ? true : false);

export default messages;
