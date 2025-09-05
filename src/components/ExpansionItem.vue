<template>
  <div
    ref="menuItemRefs"
    class="scrollable-content"
    :class="[
      'menu-item',
      isExpanded
        ? props.fullOpen
          ? 'menu-item--open-full'
          : 'menu-item--open'
        : 'menu-item--closed',
      defineClass(),
    ]"
  >
    <div class="menu-item-header" @click="toggleDropdown()">
      <slot name="header" style="cursor: pointer"></slot>
      <ArrowUp
        v-if="!isOpenDisable"
        :class="{ 'rotate-180': isExpanded, 'arrow-up': true }"
      />
    </div>

    <div v-show="isExpanded" class="menu-item-content scrollable-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, inject, onMounted } from 'vue';
import ArrowUp from './icons/ArrowUp.vue';
import { EventBus, useQuasar } from 'quasar';

const props = defineProps<{
  fullOpen?: boolean;
  type?: string;
  isDefaultOpen?: boolean;
  isExpanding?: boolean;
  itemName: string;
  isOpenDisable?: boolean;
}>();

const $q = useQuasar();
const bus = inject('bus') as EventBus;

const isExpanded = ref(props.isDefaultOpen ?? false);
const toggleDropdown = () => {
  if (props.isOpenDisable) return;
  if ($q.platform.is?.mobile === true) {
    bus.emit('open', props.itemName);
  }

  isExpanded.value = !isExpanded.value;
};

onMounted(() => {
  bus.on('open', (name) => {
    if (name !== props.itemName) isExpanded.value = false;
  });
});
const defineClass = () => {
  switch (props.type) {
    case 'help':
      return 'menu-item--help';
    case 'jitsi':
      return 'menu-item--jitsi';
  }
};

watch(
  () => props.isExpanding,
  () => {
    if (props.isExpanding === true && isExpanded.value === false)
      isExpanded.value = true;
  },
);

defineExpose({
  isExpanded,
});
</script>
