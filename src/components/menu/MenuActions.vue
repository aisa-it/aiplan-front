<template>
  <q-btn
    class="menu-link__btn"
    :flat="flat"
    :dense="dense"
    :icon="icon"
    :style="
      btnStyle ||
      'min-height: 18px !important; min-width: 18px; font-size: 12px; padding: 0; color: gray;'
    "
    @click.stop.prevent
  >
    <q-menu>
      <q-list :style="'min-width: 225px; !important;'">
        <template v-for="(item, index) in items" :key="index">
          <q-item
            v-if="item.show !== false"
            :to="item.to"
            class="menu-link__item"
            dense
            clickable
            v-close-popup
            @click="item.onClick"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              :width="16"
              :height="16"
              class="q-mr-sm"
            />
            <span class="menu-link__item-text">{{ item.text }}</span>
          </q-item>
        </template>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import type { Component } from 'vue';

export interface MenuActionItem {
  text: string;
  icon?: Component;
  onClick: () => void;
  to?: string;
  show?: boolean;
}

withDefaults(
  defineProps<{
    items: MenuActionItem[];
    icon?: string;
    btnStyle?: string;
    flat?: boolean;
    dense?: boolean;
  }>(),
  {
    icon: 'more_horiz',
    btnStyle: '',
    flat: true,
    dense: false,
  },
);
</script>

<style scoped lang="scss">
.menu-link {
  &__item {
    display: flex;
    align-items: center;
    min-height: 48px;
    padding: 8px 16px;
  }

  &__item-text {
    font-size: 12px;
  }
}
</style>
