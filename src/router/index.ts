import { createRouter, createWebHistory } from 'vue-router';

import { getStringParam } from '@/utils/object';
import {
  loadProjectGuard,
  loadUserDataGuard,
  loadWorkspaceGuard,
  redirectToWorkspaceGuard,
} from './guards';

const AUTH_ROUTES = ['/signin', '/signup'];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      beforeEnter: loadUserDataGuard,
      children: [
        {
          path: '',
          name: 'main',
          component: () => import('@/pages/GeneralWorkspacePage.vue'),
          beforeEnter: redirectToWorkspaceGuard,
        },
        {
          path: 'profile',
          component: () => import('@/pages/Profile.vue'),
        },
        {
          path: ':workspace',
          name: 'general-workspace',
          component: () => import('@/pages/GeneralWorkspacePage.vue'),
          props: (route) => ({
            slug: getStringParam(route.params.workspace),
          }),
          beforeEnter: loadWorkspaceGuard,
        },
        {
          path: ':workspace/projects/:project',
          name: 'project',
          component: () => import('@/pages/ProjectPage.vue'),
          props: (route) => ({
            workspaceSlug: getStringParam(route.params.workspace),
            projectId: getStringParam(route.params.project),
          }),
          beforeEnter: [loadWorkspaceGuard, loadProjectGuard],
        },
      ],
    },
    {
      path: '/signin',
      component: () => import('@/pages/SignInPage.vue'),
    },
    {
      path: '/signup',
      component: () => import('@/pages/SignUpPage.vue'),
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
});

router.beforeEach((to) => {
  if (AUTH_ROUTES.includes(to.path) || to.path.includes('/f/')) return;

  localStorage.setItem('next_url', to.fullPath);
});

export default router;
