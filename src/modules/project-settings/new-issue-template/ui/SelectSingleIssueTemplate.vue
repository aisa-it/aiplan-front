<template>
  <q-select
    :model-value="template"
    :options="options"
    :loading="loading"
    :virtual-scroll-item-size="48"
    label="Шаблоны задач"
    class="q-ml-sm base-selector"
    style="flex: 1"
    dense
    fill-input
    clearable
    map-options
    option-value="id"
    option-label="name"
    :popup-content-class="'scrollable-content fit-popup'"
    @update:model-value="(val) => emit('update:modelValue', val)"
    @virtual-scroll="(args) => emit('virtual-scroll', args)"
    @clear="emit('clear')"
  >
    <template v-slot:option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <div class="flex justify-between items-center">
            <q-item-label>{{ scope.opt.name || scope.opt.id }}</q-item-label>
            <q-btn
              v-if="!newIssue"
              avatar
              dense
              flat
              @click.stop="confirmDelete(scope.opt.id, scope.opt.name)"
              class="option-delete-btn"
            >
              <q-icon name="delete" class="light-red" />
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </template>

    <template v-slot:no-option>
      <q-item>
        <q-item-section class="text-italic text-grey">
          Нет шаблонов
        </q-item-section>
      </q-item>
    </template>
  </q-select>

  <q-dialog v-model="deleteDialog">
    <q-card>
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Удаление шаблона</h6>
        <span>
          Вы уверены, что хотите удалить задачу
          <b v-if="templateNameToDelete">"{{ templateNameToDelete }}"</b>?
        </span>
        <span>Данную операцию нельзя будет отменить.</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          style="width: 100px"
          v-close-popup
          @click="deleteDialog = false"
        />
        <q-btn
          flat
          no-caps
          class="delete-btn"
          style="width: 100px"
          label="Удалить"
          @click="handleDelete"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
//core
import { defineProps, defineEmits, computed, ref } from 'vue';

const props = defineProps<{
  modelValue: any;
  options: any[];
  loading?: boolean;
  newIssue?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void;
  (e: 'virtual-scroll', args: any): void;
  (e: 'delete', id: string): void;
  (e: 'clear'): void;
}>();

//computeds
const template = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

//state
const deleteDialog = ref(false);
const templateIdToDelete = ref<string | null>(null);
const templateNameToDelete = ref<string | null>(null);

//methods
function confirmDelete(id: string, name: string) {
  templateNameToDelete.value = name;
  templateIdToDelete.value = id;
  deleteDialog.value = true;
}

function handleDelete() {
  if (templateIdToDelete.value) {
    emit('delete', templateIdToDelete.value);
  }
  deleteDialog.value = false;
  templateIdToDelete.value = null;
}
</script>
<style lang="scss" scoped>
.light-red {
  color: $light-red;
}

.option-delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}
.q-item:hover .option-delete-btn {
  opacity: 1;
}
</style>
