<template>
  <NodeViewWrapper as="span" ref="dateNode" @click="openDatePicker">
    <span class="parent-date-span">
      <span class="vertical-line-date"></span>
      <span
        style="display: inline-flex; vertical-align: middle; margin-left: 5px"
      >
        <CalendarIcon :width="18" :height="18" />
      </span>
      {{ node.attrs.date }}
    </span>

    <q-popup-proxy
      v-if="showPicker"
      v-model="showPicker"
      :target="anchorEl"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card v-if="!readonly">
        <q-date
          :model-value="selectedDate"
          @update:model-value="updateDate"
          @click.stop
          mask="DD.MM.YYYY"
        >
          <div class="row items-center no-wrap">
            <q-btn
              label="Отмена"
              class="secondary-btn full-w q-mr-sm"
              no-caps
              flat
              dense
              @click="showPicker = false"
            />
            <q-btn
              v-close-popup
              label="Выбрать"
              class="primary-btn full-w"
              no-caps
              flat
              dense
              @click="saveDate"
            />
          </div>
        </q-date>
      </q-card>
    </q-popup-proxy>
  </NodeViewWrapper>
</template>

<script setup>
import { NodeViewWrapper } from '@tiptap/vue-3';
import { ref, computed, inject } from 'vue';
import CalendarIcon from './icons/CalendarIcon.vue';

const props = defineProps({
  node: {
    type: Object,
    required: true,
  },
  updateAttributes: {
    type: Function,
    required: true,
  },
});

const selectedDate = ref(props.node.attrs.date);
const showPicker = ref(false);
const dateNode = ref(null);
const readonly = inject('isEditorReadOnly', ref(true));

const anchorEl = computed(() => {
  return dateNode.value?.$el || dateNode.value || null;
});

const openDatePicker = () => {
  if (readonly.value) return;
  showPicker.value = true;
};

const updateDate = (date) => {
  selectedDate.value = date;
};

const saveDate = () => {
  props.updateAttributes({ date: selectedDate.value });
  showPicker.value = false;
};
</script>

<style scoped>
.date-node {
  position: relative;
  display: inline-block;
  cursor: pointer;
}
</style>
