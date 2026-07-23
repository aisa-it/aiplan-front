import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';

import routes from './routes';
import { useWorkspaceStoreV2 } from 'src/stores/workspace-store-v2';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useProjectStore } from 'src/stores/project-store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  Router.beforeEach((to, from, next) => {
    if (
      to.meta.requiredWorkspace === true &&
      to.params.workspace !== from.params.workspace
    ) {
      const projectStore = useProjectStore();
      projectStore.$reset();
      const newSlug = to.params.workspace as string | undefined;

      const workspaceStoreV2 = useWorkspaceStoreV2();
      if (newSlug && newSlug !== 'undefined') {
        workspaceStoreV2.getWorkspaceInfo(newSlug);
      }

      const workspaceStore = useWorkspaceStore();
      workspaceStore.changeWorkspace(newSlug || null);
    }

    if (to.fullPath.includes('/reset-password')) {
      next();
      return;
    }

    const sanitizedPath = to.fullPath.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\/-]/g, '');
    if (sanitizedPath !== to.path) {
      next(sanitizedPath);
    } else {
      next();
    }
    if (
      to.fullPath === '/' ||
      to.fullPath === '/signin' ||
      to.fullPath === '/signup' ||
      to.path === '/onboarding' ||
      to.fullPath === '/#/' ||
      to.fullPath.includes('/f/')
    )
      return;
    localStorage.setItem('next_url', to.fullPath);
  });

  Router.onError((error) => {
    if (error.message.includes('Failed to fetch dynamically imported module')) {
      console.log(error);
      window.location.reload();
    }
  });

  return Router;
});
