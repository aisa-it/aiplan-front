import { createRouter, createWebHistory } from 'vue-router';
import { getStringParam } from '@/utils/object';
import {
  loadProjectGuard,
  loadUserDataGuard,
  loadWorkspaceGuard,
  redirectToWorkspaceGuard,
  globalGuard,
  onboardingGuard,
} from './guards';

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
          name: 'global-profile',
          component: () => import('@/pages/Profile.vue'),
          beforeEnter: redirectToWorkspaceGuard,
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
          path: ':workspace/profile',
          name: 'profile',
          component: () => import('@/pages/Profile.vue'),
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
      path: '/conf',
      name: 'conference',
      component: () => import('@/pages/ConferencePage.vue'),
    },
    {
      path: '/conf/:roomName',
      name: 'conferenceByRoom',
      component: () => import('@/pages/ConferencePage.vue'),
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/pages/OnBoardingPage.vue'),
      beforeEnter: onboardingGuard,
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

router.beforeEach(globalGuard);

export default router;
