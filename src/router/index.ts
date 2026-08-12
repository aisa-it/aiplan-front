import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';

const AUTH_ROUTES = ['/signin', '/signup'];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: () => import('@/layouts/MainLayout.vue'),
      async beforeEnter() {
        const userStore = useUserStore();
        const workspacesStore = useWorkspacesStore();

        try {
          await userStore.getUserInfo();
          await workspacesStore.getUserWorkspaces();
        } catch {
          return '/signin';
        }
      },
      children: [
        {
          path: '/profile',
          component: () => import('@/pages/Profile.vue'),
        },
        {
          path: ':workspace?',
          name: 'general-workspace',
          component: () => import('@/pages/GeneralWorkspacePage.vue'),
          props: (route) => ({ slug: route.query.workspace }),
          beforeEnter(to) {
            if (!to.params.workspace) {
              const userStore = useUserStore();
              const workspacesStore = useWorkspacesStore();
              const workspaces = workspacesStore.workspaces;
              const slug =
                userStore.user?.last_workspace_slug || workspaces[0]?.slug;

              if (slug) return `/${slug}`;
            }
          },
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
