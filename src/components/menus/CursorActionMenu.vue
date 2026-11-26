<template>
  <v-menu
    :model-value="modelValue"
    :target="target"
    location="bottom start"
    :offset="0"
    :close-on-content-click="true"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="cursor-action-menu" role="menu">
      <div
        v-for="item in items"
        :key="item.label"
        class="cursor-action-menu-row"
        :tabindex="item.disabledTooltip ? 0 : undefined"
        :aria-label="item.disabledTooltip ? item.label : undefined"
        @click="item.disabled && $event.stopPropagation()"
      >
        <button
          class="cursor-action-menu-item"
          :class="{ 'cursor-action-menu-item--destructive': item.destructive }"
          :disabled="item.disabled"
          type="button"
          role="menuitem"
          @click="item.onClick?.()"
        >
          <component
            :is="item.icon"
            :width="24"
            :height="24"
            color="currentColor"
          />
          <span>{{ item.label }}</span>
        </button>
        <v-tooltip
          v-if="item.disabledTooltip"
          activator="parent"
          location="bottom"
          :text="item.disabledTooltip"
        />
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  modelValue: boolean;
  target?: [number, number];
  items: {
    label: string;
    icon: Component;
    onClick?: () => void;
    disabled?: boolean;
    disabledTooltip?: string;
    destructive?: boolean;
  }[];
}>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
</script>

<style scoped>
.cursor-action-menu {
  min-width: 244px;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 16px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-text));
  box-shadow: 0 3px 6px #0005;
}
.cursor-action-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 48px;
  gap: 16px;
  padding: 8px 16px;
  font-size: 14px;
  text-align: left;
  white-space: nowrap;
}
.cursor-action-menu-row + .cursor-action-menu-row {
  border-top: 1px solid rgb(var(--v-theme-border));
}
.cursor-action-menu-item:enabled:hover,
.cursor-action-menu-item:focus-visible {
  background: rgba(var(--v-theme-on-background), 0.05);
}
.cursor-action-menu-item--destructive {
  color: #cd5c5c;
}
.cursor-action-menu-item:disabled {
  opacity: 0.5;
  pointer-events: none;
}
</style>
