<template>
  <q-item-section @click.stop>
    <div class="scrollable-content menu-item menu-item--open-full">
      <div class="menu-item-header">
        <q-item-section>
          <span style="font-weight: 800">{{ label }}</span>
        </q-item-section>
      </div>

      <div class="menu-item-content scrollable-content">
        <q-item
          v-for="(option, index) in options"
          :key="index"
          clickable
          @click="emit('select', option)"
        >
          <div style="display: flex; align-items: center">
            <q-badge
              v-if="option.value.color"
              rounded
              class="q-mr-sm"
              style="height: 12px; width: 12px"
              :style="{ backgroundColor: option.value.color }"
            />
            <span
              class="word-wrap"
              style="width: 95%"
              :class="{
                'item-selected': selected.includes(option.value.id),
              }"
            >
              {{ option.name ?? option.label}}
            </span>
          </div>
        </q-item>
      </div>
    </div>
  </q-item-section>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
  // quasar scope option
  options: any;
  selected: (string | number)[];
}>();

const emit = defineEmits(['select']);
</script>
