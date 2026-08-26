import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/user-store';
import { useWorkspacesStore } from '@/stores/workspaces-store';
import { getStringParam } from '@/utils/object';
import { useProjectStore } from '@/stores/project-store';

const AUTH_ROUTES = ['/signin', '/signup'];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
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
          path: '',
          name: 'main',
          component: () => import('@/pages/GeneralWorkspacePage.vue'),
          beforeEnter() {
            const userStore = useUserStore();
            const workspacesStore = useWorkspacesStore();
            const workspaces = workspacesStore.workspaces;
            const slug =
              userStore.user?.last_workspace_slug || workspaces[0]?.slug;

            if (slug) {
              return {
                name: 'general-workspace',
                params: { workspace: slug },
              };
            }
          },
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
        },
        {
          path: ':workspace/projects/:project',
          name: 'project',
          component: () => import('@/pages/ProjectPage.vue'),
          props: (route) => ({
            workspaceSlug: getStringParam(route.params.workspace),
            projectId: getStringParam(route.params.project),
          }),
          async beforeEnter(to) {
            const workspace = getStringParam(to.params.workspace);
            const project = getStringParam(to.params.project);

            if (!workspace || !project) {
              return { name: 'not-found' };
            }

            try {
              useProjectStore().getProjectInfo(workspace, project);
            } catch (error: any) {
              if (error?.response?.status === 404) {
                return { name: 'not-found' };
              }

              throw error;
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
