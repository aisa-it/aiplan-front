<template>
  <v-menu
    :model-value="modelValue"
    :target="target"
    location="bottom start"
    :offset="0"
    :close-on-content-click="true"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="sidebar-project-context-menu" role="menu">
      <button
        v-for="item in items"
        :key="item.label"
        class="sidebar-project-context-item"
        type="button"
        role="menuitem"
        @click="item.onClick?.()"
      >
        <component :is="item.icon" :width="24" :height="24" color="currentColor" />
        <span>{{ item.label }}</span>
      </button>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  modelValue: boolean
  target: [number, number]
  items: { label: string; icon: Component; onClick?: () => void }[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped>
.sidebar-project-context-menu { min-width: 244px; overflow: hidden; border: 1px solid rgb(var(--v-theme-border)); border-radius: 16px; background: rgb(var(--v-theme-background)); color: rgb(var(--v-theme-text)); box-shadow: 0 3px 6px #0005; }
.sidebar-project-context-item { display: flex; align-items: center; width: 100%; min-height: 48px; gap: 16px; padding: 8px 16px; font-size: 14px; text-align: left; white-space: nowrap; }
.sidebar-project-context-item + .sidebar-project-context-item { border-top: 1px solid rgb(var(--v-theme-border)); }
.sidebar-project-context-item:hover, .sidebar-project-context-item:focus-visible { background: rgba(var(--v-theme-on-background), .05); }
</style>
