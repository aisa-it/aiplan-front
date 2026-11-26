<template>
  <v-menu :location="location ?? 'bottom start'" :offset="4" :close-on-content-click="true">
    <template #activator="{ props: menuProps }">
      <slot name="activator" :props="menuProps" />
    </template>
    <div
      class="action-menu"
      :class="{ 'action-menu--plain': plain }"
    >
      <button
        v-for="item in items"
        :key="item.label"
        type="button"
        class="action-menu-item"
        @click="item.onClick?.()"
      >
        <component
          :is="item.icon"
          v-if="item.icon"
          :width="16"
          :height="16"
          color="currentColor"
        />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

defineProps<{
  items: { label: string; icon?: Component; onClick?: () => void }[];
  plain?: boolean;
  location?: 'bottom start' | 'bottom end';
}>();
</script>

<style scoped>
.action-menu {
  min-width: 225px;
  overflow: hidden;
  border: 1px solid rgb(var(--v-theme-border));
  border-radius: 16px;
  background: rgb(var(--v-theme-background));
  color: rgb(var(--v-theme-text));
  box-shadow: 0 3px 6px #0005;
}
.action-menu--plain {
  min-width: 140px;
}
.action-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 48px;
  gap: 8px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  text-align: left;
  white-space: nowrap;
}
.action-menu--plain .action-menu-item {
  font-size: 14px;
}
.action-menu-item:hover,
.action-menu-item:focus-visible {
  background: rgba(var(--v-theme-on-background), 0.05);
}
</style>
