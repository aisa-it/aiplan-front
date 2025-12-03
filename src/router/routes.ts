import { RouteRecordRaw } from 'vue-router';

// ========== GIT EXTENSION ==========
// Импорт роутов из git расширения (src/modules/git)
// @see src/modules/git/router.ts
import { gitRoutes } from 'src/modules/git/index';
// ===================================

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [
      {
        path: 'profile',
        component: () => import('pages/ProfilePage.vue'),
      },
      {
        path: ':workspace',
        component: () => import('pages/WorkspacePage.vue'),
        children: [
          {
            path: '',
            component: () => import('pages/GeneralWorkspacePage.vue'),
          },
          {
            path: 'projects',
            component: () => import('pages/GeneralWorkspacePage.vue'),
          },
          {
            path: 'forms/:formSlug/',
            component: () => import('src/components/forms/pages/FormsPage.vue'),
            children: [
              {
                path: '',
                component: () =>
                  import('src/components/forms/pages/FormsTable.vue'),
              },
              // {
              //   path: 'settings',
              //   component: () =>
              //     import('src/components/forms/pages/FormSettingsPage.vue'),
              // },
            ],
          },
          {
            path: 'settings',
            component: () => import('pages/WorkspaceSettingsPage.vue'),
          },
          {
            path: 'aidoc',
            component: () => import('pages/AiDocPage.vue'),
            children: [
              {
                path: ':doc/:commentId?',
                name: 'doc',
                component: () => import('pages/AiDocPage.vue'),
              },
            ],
          },
          {
            path: 'projects/:project/issues',
            component: async () =>
              import('src/modules/issue-list/IssueList.vue'),
          },
          {
            path: 'projects/:project/',
            component: async () => import('pages/ProjectIssuesPage.vue'),
            children: [
              {
                path: 'settings',
                name: 'project-settings',
                component: () => import('pages/ProjectSettingsPage.vue'),
              },
              {
                path: '',
                component: async () =>
                  import('src/modules/issue-list/IssueList.vue'),
              },

              {
                path: 'issues/:issue/:commentId?',
                name: 'issue',
                component: () => import('pages/IssuePage.vue'),
              },
            ],
          },
          {
            path: 'user-activities/:id',
            component: () => import('pages/UserActivitiesPage.vue'),
          },
          {
            path: 'sprints/:sprint',
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
    path: '/f/:slug',
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
