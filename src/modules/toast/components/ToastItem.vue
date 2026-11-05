<template>
  <article class="app-toast" :role="ariaRole" aria-atomic="true">
    <span
      class="app-toast__accent"
      :style="{ backgroundColor: toast.accentColor }"
      aria-hidden="true"
    />

    <div class="app-toast__content">
      <span class="material-symbols-rounded app-toast__icon" aria-hidden="true">
        {{ toast.icon }}
      </span>

      <div class="min-w-0 flex-1">
        <div class="text-lg leading-6.5 font-semibold">
          {{ toast.title }}
        </div>

        <div class="mt-2 text-sm leading-5 wrap-break-word">
          <template v-for="(part, index) in toast.message" :key="index">
            <a
              v-if="isLink(part) && getSafeHref(part.href)"
              class="text-primary hover:underline"
              :href="getSafeHref(part.href)"
              :target="part.target ?? '_blank'"
              rel="noopener noreferrer"
            >
              {{ part.text }}
            </a>
            <span v-else>{{ getPartText(part) }}</span>
          </template>
        </div>
      </div>
    </div>

    <v-btn
      class="app-toast__close"
      icon
      size="32"
      variant="text"
      :ripple="false"
      :aria-label="t('toast.closeNotification')"
      @click="emit('close')"
    >
      <span class="material-symbols-rounded text-2xl">close</span>
    </v-btn>

    <Transition name="toast-badge" mode="out-in">
      <span v-if="toast.count > 1" :key="toast.count" class="app-toast__badge">
        {{ toast.count }}
      </span>
    </Transition>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { ToastLink, ToastMessagePart, ToastView } from '../toast.types';

const { t } = useI18n();

const props = defineProps<{
  toast: ToastView;
}>();

const emit = defineEmits<{
  close: [];
}>();

const ariaRole = computed(() =>
  props.toast.type === 'error' || props.toast.type === 'warning'
    ? 'alert'
    : 'status',
);

const isLink = (part: ToastMessagePart): part is ToastLink =>
  typeof part !== 'string';

const getPartText = (part: ToastMessagePart) =>
  typeof part === 'string' ? part : part.text;

const getSafeHref = (href: string) => {
  try {
    const url = new URL(href, location.origin);

    return url.protocol === 'http:' || url.protocol === 'https:'
      ? href
      : undefined;
  } catch {
    return undefined;
  }
};
</script>

<style scoped lang="scss">
.app-toast {
  position: relative;
  width: 360px;
  min-height: 86px;
  flex-shrink: 0;
  overflow: visible;
  border-radius: 8px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-text));
  box-shadow:
    0 5px 26px 4px rgb(10 13 36 / 12%),
    0 14px 21px 2px rgb(10 13 36 / 14%),
    0 7px 9px -4px rgb(10 13 36 / 20%);
  pointer-events: auto;
}

.app-toast__accent {
  position: absolute;
  inset: 0 auto 0 0;
  width: 12px;
  border-radius: 8px 0 0 8px;
}

.app-toast__content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 40px 16px 24px;
}

.app-toast__icon {
  display: flex;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 16px;
}

.app-toast__close {
  position: absolute;
  top: 6px;
  right: 6px;
  color: rgb(var(--v-theme-text));
}

.app-toast__badge {
  position: absolute;
  z-index: 1;
  top: -7px;
  right: 0;
  display: flex;
  min-width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  border-radius: 4px;
  background: #dc3e3e;
  color: #fff;
  font-size: 12px;
  line-height: 1;
}

.toast-badge-enter-active,
.toast-badge-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.toast-badge-enter-from,
.toast-badge-leave-to {
  opacity: 0;
  transform: scale(0.7);
}

@media (max-width: 400px) {
  .app-toast {
    width: calc(100vw - 16px);
  }
}
</style>
