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
        v-model="color"
        :palette="palette.flat()"
        default-view="palette"
      />

      <teleport to=".color-picker .q-color-picker__footer" v-if="isOpen">
        <div class="buttons row justify-center items-center">
          <q-btn
            flat
            dense
            icon="check"
            color="white"
            class="button bg-positive"
            @click="clickComfirmHand"
          />
          <q-btn
            flat
            dense
            icon="close"
            color="white"
            class="button bg-negative"
            @click="clickCancelHand"
          />
        </div>
      </teleport>
    </q-popup-proxy>
  </q-icon>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePalette } from '../composables/usePalette';

const props = defineProps<{ currentColor?: string }>();
const emits = defineEmits<{ setColor: [color: string]; cancel: [] }>();

const { palette, getRandomcolorFromPalette } = usePalette();

const color = ref(props.currentColor ?? getRandomcolorFromPalette());

const popupRef = ref();
const isOpen = ref(false);

const clickComfirmHand = () => {
  emits('setColor', color.value);
  popupRef.value?.hide();
};

const clickCancelHand = () => {
  emits('cancel');
  popupRef.value?.hide();
};
</script>

<style scoped lang="scss">
.buttons {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 72px;
  width: 100%;
  gap: 8px;
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
  height: 400px;
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
  height: 120px !important;
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

.q-color-picker :deep(.q-color-picker__footer .q-tab[tabindex='-1']) {
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
