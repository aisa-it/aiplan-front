<template>
  <q-btn
    :class="['menu-link__btn', btnClass]"
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
export interface MenuActionItem {
  text: string;
  icon?: any;
  onClick: () => void;
  to?: string;
}

withDefaults(
  defineProps<{
    items: MenuActionItem[];
    icon?: string;
    btnStyle?: string;
    btnClass?: string;
    flat?: boolean;
    dense?: boolean;
  }>(),
  {
    icon: 'more_horiz',
    btnStyle: '',
    btnClass: '',
    flat: true,
    dense: false,
  },
);
</script>

