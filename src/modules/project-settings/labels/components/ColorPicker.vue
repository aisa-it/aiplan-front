<template>
  <q-icon name="colorize" class="cursor-pointer">
    <q-popup-proxy
      cover
      transition-show="scale"
      transition-hide="scale"
      ref="popupRef"
      @show="isOpen = true"
      @hide="isOpen = false"
    >
      <q-color
        class="color-picker"
        :class="{ 'palette-only': !customColorEnabled }"
        v-model="color"
        :palette="palette.flat()"
        :default-view="customColorEnabled ? 'spectrum' : 'palette'"
      />

      <teleport to=".color-picker .q-color-picker__footer" v-if="isOpen">
        <div class="custom-controls">
          <div class="checkbox-container">
            <q-checkbox
              v-model="customColorEnabled"
              label="Свой цвет"
            />
          </div>
          <div class="buttons-row">
            <q-btn
              flat
              dense
              icon="check"
              color="white"
              class="button bg-positive"
              @click="handleConfirm"
            />
            <q-btn
              flat
              dense
              icon="close"
              color="white"
              class="button bg-negative"
              @click="handleCancel"
            />
          </div>
        </div>
      </teleport>
    </q-popup-proxy>
  </q-icon>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { usePalette } from '../composables/usePalette';

const props = defineProps<{ currentColor?: string }>();
const emits = defineEmits<{ setColor: [color: string]; cancel: [] }>();

const { palette, getRandomColorFromPalette } = usePalette();

const color = ref(props.currentColor ?? getRandomColorFromPalette());

const popupRef = ref();
const isOpen = ref(false);
const customColorEnabled = ref(false);

watch(customColorEnabled, async (val) => {
  if (!val && isOpen.value) {
    await nextTick();
    const footer = document.querySelector('.color-picker .q-color-picker__footer');
    const tabs = footer?.querySelectorAll('.q-tab');
    const paletteTab = tabs?.[2]
    paletteTab?.click();
  }
});

const handleConfirm = () => {
  emits('setColor', color.value);
  popupRef.value?.hide();
};

const handleCancel = () => {
  emits('cancel');
  popupRef.value?.hide();
};
</script>

<style scoped lang="scss">
.custom-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 32px 0 8px;
  width: 100%;
  height: 100%;
}

.checkbox-container {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding-left: 16px;
}

.buttons-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.button {
  width: 140px;
  height: 40px;
  border-radius: 8px;
}

.button.bg-positive {
  background-color: #05bd8d !important;
}

.color-picker {
  width: 320px;
}
:deep(.q-color-picker__cube) {
  width: 44px !important;
  height: 44px;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 2px;
}

:deep(.q-color-picker__palette-rows) {
  height: 184px;
  padding: 2px;
  justify-content: space-evenly;
}

:deep(.q-color-picker__footer) {
  height: 150px !important;
  padding-bottom: 0 !important;
}

:deep(.q-color-picker__footer .q-tab) {
  height: 48px !important;
}

:deep(.q-color-picker__header-tabs),
:deep(.q-color-picker__header-tabs .q-tab),
:deep(.q-color-picker__header-banner) {
  height: 48px !important;
}

:deep(.q-color-picker__header input.fit),
:deep(.q-color-picker__header .q-tab__label) {
  font-size: 16px !important;
  letter-spacing: 0.5px !important;
  text-transform: uppercase !important;
}

.color-picker.palette-only :deep(.q-color-picker__footer .q-tab[tabindex='-1']) {
  pointer-events: none !important;
  opacity: 0.5 !important;
  cursor: not-allowed !important;
  background-color: var(--tab-color-picker-disable);
}

:deep(.q-color-picker__footer .q-tab--active) {
  box-shadow: none !important;
}

:deep(.q-color-picker__header .q-tab--inactive) {
  background: var(--tab-color-picker-header--inactive) !important;
  color: var(--tab-color-picker-header--inactive-text) !important;
}
</style>
