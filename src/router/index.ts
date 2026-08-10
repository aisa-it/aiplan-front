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
      children: [
        {
          path: '',
          name: 'general-workspace',
          component: () => import('@/pages/GeneralWorkspacePage.vue'),
          props: (route) => ({ slug: route.query.workspace }),
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
              const slug =
                userStore.user?.last_workspace_slug ||
                workspacesStore.workspaces[0]?.slug;

              if (slug) return `/${slug}`;
            }
          },
        },
        {
          path: '/profile',
          component: () => import('@/pages/Profile.vue'),
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
  ],
});

router.beforeEach((to) => {
  if (AUTH_ROUTES.includes(to.path) || to.path.includes('/f/')) return;

  localStorage.setItem('next_url', to.fullPath);
});

export default router;
