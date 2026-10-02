import type { NavigationGuard } from 'vue-router';

const AUTH_ROUTES = ['/signin', '/signup'];

export const globalGuard: NavigationGuard = (to) => {
  if (
    AUTH_ROUTES.includes(to.path) ||
    to.path === '/onboarding' ||
    to.path.includes('/f/')
  ) {
    return;
  }

  localStorage.setItem('next_url', to.fullPath);
};
