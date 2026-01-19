<template>
  <q-btn
    class="menu-link__btn"
    flat
    icon="more_horiz"
    :style="'min-height: 18px !important; min-width: 18px; font-size: 12px; padding: 0; color: gray;'"
    @click.prevent
  >
    <q-menu>
      <q-list :style="'min-width: 225px; !important;'">
        <q-item v-for="(item, index) in items" :key="index">
          <q-btn
            class="menu-link__settings-btn full-w"
            flat
            dense
            no-caps
            v-close-popup
            :to="item.to"
            :style="'font-size: 12px;'"
            @click="item.onClick"
          >
            <component
              :is="item.icon"
              v-if="item.icon"
              :width="16"
              :height="16"
              class="q-mr-sm"
            />
            <span>{{ item.text }}</span>
          </q-btn>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import type { DefineComponent } from 'vue';

export interface MenuActionItem {
  text: string;
  icon?: DefineComponent;
  onClick: () => void;
  to: string;
}

defineProps<{
  items: MenuActionItem[];
}>();
</script>

