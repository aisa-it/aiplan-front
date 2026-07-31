import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'main',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [],
  },
  {
    path: '/signin',
    component: () => import('@/modules/auth/pages/SignInPage.vue'),
  },
  {
    path: '/signup',
    component: () => import('@/modules/auth/pages/SignUpPage.vue'),
  },
];

export default routes;
