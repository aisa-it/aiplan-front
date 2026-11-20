import type { NavigationGuard, RouteLocationNormalized } from 'vue-router';

const signals = new WeakMap<RouteLocationNormalized, AbortSignal>();
let pendingLoad: AbortController | undefined;

export const startRouteLoad: NavigationGuard = (to) => {
  pendingLoad?.abort();
  pendingLoad = new AbortController();
  signals.set(to, pendingLoad.signal);
};

export const getRouteLoadSignal = (to: RouteLocationNormalized) =>
  signals.get(to);
