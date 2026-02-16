<template>
  <q-select
    :model-value="columnsToShow"
    dense
    label="Колонки"
    class="base-selector full-w"
    multiple
    map-options
    :options="columns"
    :option-label="(col) => col.label"
    :option-value="(col) => col.name"
    @update:model-value="(val) => emits('update:columnsToShow', val)"
  >
    <template v-slot:option="{ itemProps, opt, selected }">
      <q-item
        v-if="opt.name !== 'sequence_id'"
        v-bind="itemProps"
        class="selector-option__wrapper selector-option-columns__wrapper q-py-none"
        :class="{
          'drag-before': dragOverItem === opt.name + '__before',
          'drag-after': dragOverItem === opt.name + '__after',
        }"
        :draggable="!isMobile"
        @dragstart="(e) => onDragStart(e, opt)"
        @dragenter.prevent="(e) => onDragEnter(e, opt)"
        @dragend="onDragEnd"
        @dragover="(e) => onDragOver(e, opt)"
      >
        <q-item-section side>
          <q-checkbox
            :model-value="selected"
            @update:model-value="(val) => onToggle(opt.name, val)"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label>
            {{ opt.label }}
          </q-item-label>
        </q-item-section>

        <q-item-section side v-if="!isMobile">
          <q-icon name="drag_indicator" />
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { computed, ref, watch } from 'vue';

const props = defineProps<{
  columns: any[];
  columnsToShow: string[];
}>();

const emits = defineEmits<{ 'update:columnsToShow': [string[]] }>();

function onToggle(name: string, checked: boolean) {
  const set = new Set(props.columnsToShow);

  checked ? set.add(name) : set.delete(name);

  emits('update:columnsToShow', [...set]);
}

const q = useQuasar();

const isMobile = computed(() => q.platform.is.mobile);

let draggedItem: any = null;
const dragOverItem = ref<string | null>(null);

const onDragStart = (event: DragEvent, item: any) => {
  draggedItem = item;
  event.dataTransfer?.setData('text/plain', item.name);
  event.dataTransfer!.effectAllowed = 'move';
};

const onDragEnter = (event: DragEvent, targetItem: any) => {
  event.preventDefault();

  if (!draggedItem || draggedItem === targetItem) return;

  dragOverItem.value = targetItem.name;
};

const onDragOver = (event: DragEvent, targetItem: any) => {
  event.preventDefault();

  const target = event.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();

  const offset = event.clientY - rect.top;
  const half = rect.height / 2;

  if (offset > half) {
    dragOverItem.value = targetItem.name + '__after';
  } else {
    dragOverItem.value = targetItem.name + '__before';
  }
};

const columnsSelector = ref([...props.columns]);

const onDragEnd = () => {
  if (!dragOverItem.value || !draggedItem) {
    draggedItem = null;
    return;
  }

  const arr = columnsSelector.value;

  const from = arr.findIndex((i) => i.name === draggedItem.name);

  const [targetName, position] = dragOverItem.value.split('__');
  let to = arr.findIndex((i) => i.name === targetName);

  if (position === 'after') {
    to += 1;
  }

  arr.splice(to, 0, arr.splice(from, 1)[0]);

  draggedItem = null;
  dragOverItem.value = null;

  const newOrder = arr.map((c) => c.name);

  emits(
    'update:columnsToShow',
    newOrder.filter((name) => props.columnsToShow.includes(name)),
  );
};

watch(
  () => props.columns,
  (newVal) => {
    columnsSelector.value = [...newVal];
  },
);
</script>
<style lang="scss" scoped>
[draggable='true'] {
  cursor: grab;
}

.q-item.drag-over {
  background: #f0f0f0;
}

.drag-over {
  outline: 2px dashed #1976d2;
  border-radius: 6px;
}

.drag-before {
  border-top: 2px solid #1976d2;
}

.drag-after {
  border-bottom: 2px solid #1976d2;
}

.drag-before,
.drag-after {
  border-radius: 4px;
}

.selector-option-columns__wrapper {
  transition: transform 150ms ease;
}

.selector-option {
  &__wrapper {
    min-height: 40px;
  }

  &-columns__wrapper {
    padding-left: 12px;

    .q-item__section--side {
      padding-right: 12px;
    }
  }
}
</style>
