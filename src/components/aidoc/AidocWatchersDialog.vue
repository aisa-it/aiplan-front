<template>
  <q-dialog
    :model-value="modelValue"
    persistent
    @before-show="setWatchers"
    @update:modelValue="updateModelValue"
  >
    <q-card class="dialog-card">
      <q-card-section class="row items-center">
        <div class="text-h6 text-weight-bold">Наблюдатели</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="col flex rounded-borders">
          <SelectMembers
            v-model="docWatchers"
            class="watchers-selector"
            :label="label"
            :refresh-members-func="fetchMembers"
            :on-change="update"
            @refresh="emit('refresh')"
            :isDisabled="!canEdit"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import SelectMembers from '../selects/SelectMembers.vue';
import { useAidocWatchers } from '../selects/composables/useAidocWatchers';

const props = defineProps<{
  modelValue: boolean;
  loading?: boolean;
  canEdit?: boolean;
  docId?: string;
  watchers?: any;
}>();

const emit = defineEmits(['refresh', 'update:modelValue']);

let { label, fetchMembers, update } = useAidocWatchers(props.docId ?? '');

const docWatchers = ref([]);

const setWatchers = () => {
  docWatchers.value = props.watchers?.map((user) => ({
    member: { ...user },
  }));
};

const updateModelValue = (value: boolean) => emit('update:modelValue', value);

watch(
  () => props.docId,
  (newId) => {
    if (!newId) return;
    const newSelectState = useAidocWatchers(newId);
    label = newSelectState.label;
    fetchMembers = newSelectState.fetchMembers;
    update = newSelectState.update;
  },
);
</script>

<style scoped>
.dialog-card {
  min-width: 600px;
}

@media screen and (max-width: 650px) {
  .dialog-card {
    min-width: unset;
  }
}
</style>
