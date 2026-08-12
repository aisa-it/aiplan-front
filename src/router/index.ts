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

        if (!to.params.workspace) {
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

import { useUtilsStore } from '@/stores/utils-store';

router.beforeEach(async (to) => {
  const utilsStore = useUtilsStore();
  if (!utilsStore.version) {
    await utilsStore.getVersion();
  }

  if (to.path.startsWith('/conf') && utilsStore.isEnabledJitsi === false) {
    return '/';
  }

  if (AUTH_ROUTES.includes(to.path) || to.path.includes('/f/')) return;

  localStorage.setItem('next_url', to.fullPath);
});

export default router;
