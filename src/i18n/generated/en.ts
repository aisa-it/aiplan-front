// АВТОГЕНЕРАЦИЯ — не править вручную.
// Источник: scripts/i18n-dictionaries.mjs (запускается плагином Vite и `yarn i18n:generate`).
import type ru from './ru';
import activitiesEn from '@/modules/activities/i18n/en';
import activityHotMapEn from '@/components/activity-hot-map/i18n/en';
import authEn from '@/modules/auth/i18n/en';
import dialogsEn from '@/components/dialogs/i18n/en';
import docActivityEn from '@/modules/activities/renders/entities/doc-activity/i18n/en';
import guidedToursEn from '@/modules/guided-tours/i18n/en';
import issueActivityEn from '@/modules/activities/renders/entities/issue-activity/i18n/en';
import paginationEn from '@/components/pagination/i18n/en';
import profileEn from '@/modules/profile/i18n/en';
import projectActivityEn from '@/modules/activities/renders/entities/project-activity/i18n/en';
import selectWorkspaceEn from '@/components/select-workspace/i18n/en';
import sprintActivityEn from '@/modules/activities/renders/entities/sprint-activity/i18n/en';
import toastEn from '@/modules/toast/i18n/en';
import userStatusEn from '@/components/user-status/i18n/en';
import workspaceActivityEn from '@/modules/activities/renders/entities/workspace-activity/i18n/en';

const messages = {
  activities: activitiesEn,
  activityHotMap: activityHotMapEn,
  auth: authEn,
  dialogs: dialogsEn,
  docActivity: docActivityEn,
  guidedTours: guidedToursEn,
  issueActivity: issueActivityEn,
  pagination: paginationEn,
  profile: profileEn,
  projectActivity: projectActivityEn,
  selectWorkspace: selectWorkspaceEn,
  sprintActivity: sprintActivityEn,
  toast: toastEn,
  userStatus: userStatusEn,
  workspaceActivity: workspaceActivityEn,
} satisfies typeof ru;

true satisfies (typeof ru extends typeof messages ? true : false);

export default messages;
