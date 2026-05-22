import { RouteRecordRaw } from 'vue-router';
// ========== GIT EXTENSION ==========
// Импорт роутов из git расширения (src/modules/git)
// @see src/modules/git/router.ts
import { gitRoutes } from 'src/modules/git/index';
import { useUserStore } from 'src/stores/user-store';
// ===================================

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'main',
    component: () => import('src/layouts/MainLayout.vue'),
    async beforeEnter(to, from) {
      const userStore = useUserStore();

      await userStore.getUserInfo();
      await userStore.getUserWorkspaces();
      await userStore.getUserWorkspacesMemberships();
      await userStore.getUserProjectsMemberships();

      if (to.meta.requiredWorkspace === false) return;
      else if (!to.params.workspace) {
        const targetSlug =
          userStore.user?.last_workspace_slug ||
          userStore.userWorkspaces[0]?.slug;

        return `/${targetSlug}`;
      }
    },
    children: [
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue'),
        meta: { requiredWorkspace: false },
      },
      {
        path: ':workspace',
        component: () => import('pages/WorkspacePage.vue'),
        meta: { requiredWorkspace: true },
        children: [
          {
            path: '',
            name: 'workspace',
            component: () => import('pages/GeneralWorkspacePage.vue'),
            meta: { requiredWorkspace: true },
          },
          {
            path: 'projects',
            name: 'projects',
            component: () => import('pages/ProjectsPage.vue'),
            meta: { requiredWorkspace: true },
          },
          {
            path: 'sprints',
            name: 'sprints',
            component: () => import('pages/SprintsPage.vue'),
            meta: { requiredWorkspace: true },
          },
          {
            path: 'forms/:formSlug/',
            component: () => import('src/components/forms/pages/FormsPage.vue'),
            meta: { requiredWorkspace: true },
            children: [
              {
                path: '',
                component: () =>
                  import('src/components/forms/pages/FormsTable.vue'),
                meta: { requiredWorkspace: true },
              },
            ],
          },
          {
            path: 'settings',
            component: () => import('pages/WorkspaceSettingsPage.vue'),
            meta: { requiredWorkspace: true },
          },
          {
            path: 'aidoc',
            component: () => import('pages/AiDocPage.vue'),
            meta: { requiredWorkspace: true },
            children: [
              {
                path: ':doc/:commentId?',
                name: 'doc',
                meta: { requiredWorkspace: true },
                component: () => import('pages/AiDocPage.vue'),
              },
            ],
          },
          {
            path: 'projects/:project/',
            component: async () => import('pages/ProjectPage.vue'),
            meta: { requiredWorkspace: true },
            children: [
              {
                path: '',
                name: 'project-issues',
                meta: { requiredWorkspace: true },
                component: () => import('pages/ProjectIssuesPage.vue'),
              },
              {
                path: 'issues',
                name: 'project-issue',
                meta: { requiredWorkspace: true },
                component: () => import('pages/ProjectIssuesPage.vue'),
              },
              {
                path: 'settings',
                meta: { requiredWorkspace: true },
                name: 'project-settings',
                component: () => import('pages/ProjectSettingsPage.vue'),
              },

              {
                path: 'issues/:issue/:commentId?',
                name: 'issue',
                meta: { requiredWorkspace: true },
                component: () => import('pages/IssuePage.vue'),
              },
            ],
          },
          {
            path: 'user-activities/:id',
            meta: { requiredWorkspace: true },
            component: () => import('pages/UserActivitiesPage.vue'),
          },
          {
            path: 'sprints/:sprint',
            meta: { requiredWorkspace: true },
            component: () => import('src/pages/SprintPage.vue'),
          },
        ],
      },
    ],
  },

  // ========== GIT ROUTES (INDEPENDENT LAYOUT) ==========
  // Git роуты теперь на верхнем уровне с собственным GitLayout
  // @see src/modules/git/router.ts
  ...gitRoutes,
  // ====================================================

  {
    path: '/access-denied',
    component: () => import('pages/AccessDeniedPage.vue'),
  },
  {
    path: '/f/:workspaceSlug/:slug',
    component: () => import('src/components/forms/pages/FormPage.vue'),
  },
  {
    path: '/filters/:filterId',
    name: 'filters',
    component: () => import('src/layouts/MainLayout.vue'),
  },
  {
    path: '/signin',
    component: () => import('components/LoginPanel.vue'),
  },
  {
    path: '/signup',
    component: () => import('layouts/RegisterLayout.vue'),
  },
  {
    path: '/no-workspace',
    component: () => import('layouts/NoWorkspaceLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('components/NoWorkspacesBlock.vue'),
      },
      {
        path: '/no-workspace/profile',
        component: () => import('pages/ProfilePage.vue'),
      },
    ],
  },
  {
    path: '/onboarding',
    component: () => import('layouts/OnBoardingLayout.vue'),
  },
  {
    path: '/reset-password',
    component: () => import('layouts/ResetPasswordLayout.vue'),
  },
  {
    path: '/admin-panel',
    component: () => import('layouts/AdminPanelLayout.vue'),
    children: [
      {
        path: 'workspaces',
        component: () => import('src/pages/admin-panel-pages/AdminWsPage.vue'),
      },
      {
        path: 'users',
        component: () =>
          import('src/pages/admin-panel-pages/AdminUsersPage.vue'),
      },
      {
        path: ':user/user-settings',
        component: () =>
          import('src/pages/admin-panel-pages/UserSettingsPage.vue'),
      },
      {
        path: 'feedbacks',
        component: () =>
          import('src/pages/admin-panel-pages/AdminFeedbacksPage.vue'),
      },
      {
        path: ':workspace/projects',
        component: () =>
          import('src/pages/admin-panel-pages/AdminProjectsPage.vue'),
      },
      {
        path: 'release-notes',
        component: () =>
          import('src/pages/admin-panel-pages/AdminReleaseNotesPage.vue'),
      },
      {
        path: 'active-imports',
        component: () =>
          import('src/pages/admin-panel-pages/AdminImportsPage.vue'),
      },
      {
        path: 'create-notification',
        component: () =>
          import('src/pages/admin-panel-pages/AdminCreateNotificationPage.vue'),
      },
      {
        path: ':workspace/workspace-settings',
        component: () =>
          import('src/pages/admin-panel-pages/AdminWsSettingsPage.vue'),
      },
      {
        path: 'activities',
        component: () =>
          import('src/pages/admin-panel-pages/UserActivitiesPage.vue'),
      },
    ],
  },
  {
    path: '/service-unavailable',
    component: () => import('layouts/ServiceUnavailableLayout.vue'),
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/not-found',
    component: () => import('pages/ErrorNotFoundPage.vue'),
  },
  {
    path: '/conf',
    name: 'conference',
    component: () => import('pages/ConferencePage.vue'),
  },
  {
    path: '/conf/:roomName',
    name: 'conferenceByRoom',
    component: () => import('pages/ConferencePage.vue'),
  },

  {
    path: '/:catchAll(.*)*',
    name: 'Error404',
    component: () => import('pages/ErrorNotFoundPage.vue'),
  },
];

export default routes;
