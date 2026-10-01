import { createRouter, createWebHistory } from 'vue-router';
import { mainGuard } from './guards/mainGuard';
import { onboardingGuard } from './guards/onboardingGuard';
import { globalGuard } from './guards/globalGuard';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:workspace?',
      name: 'main',
      component: () => import('@/layouts/MainLayout.vue'),
      beforeEnter: mainGuard,
      children: [
        {
          path: '',
          name: 'general-workspace',
          component: () => import('@/pages/GeneralWorkspacePage.vue'),
          props: (route) => ({ slug: route.params.workspace }),
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/pages/Profile.vue'),
          props: (route) => ({ slug: route.params.workspace }),
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

router.beforeEach(globalGuard);

export default router;
