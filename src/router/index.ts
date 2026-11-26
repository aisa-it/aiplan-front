import { createRouter, createWebHistory } from 'vue-router';
import { getStringParam } from '@/utils/object';
import { applyLoadedProject } from './guards/load-project.guard';
import { startRouteLoad } from './guards/route-load';
import {
  loadUserDataGuard,
  loadWorkspaceGuard,
  resolveProjectGuard,
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
        },
        {
          path: ':workspace/profile',
          name: 'profile',
          component: () => import('@/pages/Profile.vue'),
          props: (route) => ({
            slug: getStringParam(route.params.workspace),
          }),
        },
        {
          path: ':workspace/forms',
          name: 'forms',
          component: () => import('@/modules/forms/pages/FormsPage.vue'),
          props: (route) => ({
            workspaceSlug: getStringParam(route.params.workspace),
          }),
        },
        // TODO: стенд для теста редактора, убрать после переноса страницы AIDOC
        {
          path: ':workspace/editor-playground',
          name: 'editor-playground',
          component: () =>
            import('@/modules/editor/pages/EditorPlaygroundPage.vue'),
        },
        {
          path: ':workspace/projects',
          name: 'workspace-projects',
          component: () => import('@/pages/ProjectsPage.vue'),
          props: (route) => ({
            workspaceSlug: getStringParam(route.params.workspace),
          }),
        },
        {
          path: ':workspace/projects/:project',
          name: 'project',
          component: () => import('@/pages/ProjectPage.vue'),
          props: (route) => ({
            workspaceSlug: getStringParam(route.params.workspace),
            projectId: getStringParam(route.params.project),
          }),
        },
        {
          path: ':workspace/sprints/:sprint',
          name: 'sprint',
          component: () => import('@/pages/SprintPage.vue'),
          props: (route) => ({
            workspaceSlug: getStringParam(route.params.workspace),
            sprintId: getStringParam(route.params.sprint),
          }),
        },
      ],
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

router.beforeEach(startRouteLoad);
router.beforeEach(globalGuard);
router.beforeResolve(loadWorkspaceGuard);
router.beforeResolve(resolveProjectGuard);
router.afterEach(applyLoadedProject);

export default router;
