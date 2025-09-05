/* eslint-disable */

/// <reference types="vite/client" />

// Mocks all files ending in `.vue` showing them as plain Vue instances
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Типизизация глобального компонента
import { QTooltipProps, QTooltipSlots, GlobalComponentConstructor } from 'quasar';

declare module '@vue/runtime-core' {
  export interface GlobalComponents {
    HintTooltip: GlobalComponentConstructor<QTooltipProps, QTooltipSlots>;
  }
}
