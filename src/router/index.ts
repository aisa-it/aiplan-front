import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';

const AUTH_ROUTES = ['/signin', '/signup'];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:workspace?',
      name: 'main',
      component: () => import('@/layouts/MainLayout.vue'),
      async beforeEnter(to) {
        const userStore = useUserStore();
        const workspacesStore = useWorkspacesStore();

        try {
          await userStore.getUserInfo();
          await workspacesStore.getUserWorkspaces();
        } catch {
          return '/signin';
        }

        if (!userStore.user?.is_onboarded) {
          return '/onboarding';
        }

        if (!to.params.workspace && to.name === 'general-workspace') {
          const workspaces = workspacesStore.workspaces;
          const slug =
            userStore.user?.last_workspace_slug || workspaces[0]?.slug;

          if (slug) return `/${slug}`;
        }
      },
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
      async beforeEnter() {
        const userStore = useUserStore();

        try {
          await userStore.getUserInfo();
        } catch {
          return '/signin';
        }

        if (userStore.user?.is_onboarded) {
          const workspacesStore = useWorkspacesStore();
          await workspacesStore.getUserWorkspaces();
          const workspaces = workspacesStore.workspaces;
          const slug =
            userStore.user?.last_workspace_slug || workspaces[0]?.slug;

          return slug ? `/${slug}` : '/';
        }
      },
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
  if (
    AUTH_ROUTES.includes(to.path) ||
    to.path === '/onboarding' ||
    to.path.includes('/f/')
  ) {
    return;
  }

  localStorage.setItem('next_url', to.fullPath);
});

export default router;
