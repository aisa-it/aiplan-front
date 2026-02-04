<template>
  <div
    v-if="localStates.length"
    class="list-container"
    ref="listContainerRef"
    :key="listKey"
    @update.stop
    @add.stop
    @remove.stop
  >
    <div
      v-for="state in localStates"
      class="drag-card"
      :key="state.id"
      :data-id="state.id"
    >
      <SingleState
        :singleState="state"
        :key="state.id"
        :statesList="states"
        @delete="onDeleteOpen"
        @edit="onEditOpen"
        @success="(msg) => onSuccess(msg)"
      />
    </div>

    <EditStateDialog
      v-model="isEditOpen"
      :currentState="state"
      @error="(msg) => onError()"
      @success="(msg) => onSuccess(msg)"
    />
    <DeleteStateDialog
      v-model="isDeleteOpen"
      :currentState="state"
      @error="(msg) => onError()"
      @success="(msg) => onSuccess(msg)"
    />
  </div>
</template>

<script setup lang="ts">
// core
import { onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';
import { useSortable } from 'src/composables/useSortable';

// components
import SingleState from 'src/modules/project-settings/states/ui/SingleState.vue';
import EditStateDialog from 'src/modules/project-settings/states/ui/dialogs/EditStateDialog.vue';
import DeleteStateDialog from 'src/modules/project-settings/states/ui/dialogs/DeleteStateDialog.vue';

// interfaces
import { DtoStateLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// services
import { updateState } from '../services/api';

const props = defineProps<{
  states: Record<string, DtoStateLight>;
}>();
const emit = defineEmits(['update', 'refresh', 'refresh-states']);

const { setNotificationView } = useNotificationStore();
// vars
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const state = ref<DtoStateLight>();
// flags for dialogs
const isDeleteOpen = ref(false);
const isEditOpen = ref(false);
const listContainerRef = ref();
const localStates = ref([]);
const saveTimer = ref<ReturnType<typeof setTimeout> | null>(null);
const listKey = ref(0);

onMounted(() => {
  initSortable();
});

const onError = async () => {
  emit('update');
  emit('refresh-states');
};

const onSuccess = async (msg?: string) => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_UPDATE_DATA,
  });
  emit('refresh');
  emit('update');
  emit('refresh-states');
};

const onEditOpen = (s: DtoStateLight) => {
  state.value = s;
  isEditOpen.value = true;
};

const onDeleteOpen = (s: DtoStateLight) => {
  state.value = s;
  isDeleteOpen.value = true;
};

const changeGroupSequence = async (state: DtoStateLight, index: number) => {
  await updateState(
    currentWorkspaceSlug.value || '',
    currentProjectID.value,
    state.id as string,
    Object.assign(state, { group_seq_id: index + 1 }),
  ).then(() => {
    emit('refresh');
    emit('refresh-states');
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Порядок статусов изменен',
    });
  });
};

const { initSortable } = useSortable(listContainerRef, {
  draggable: '.drag-card',
  handle: '.drag-handle',
  ghostClass: 'sortable-ghost',
  animation: 150,
  forceFallback: true,
  fallbackOnBody: true,
  fallbackTolerance: 5,
  onStart: () => {
    console.log('lol');
    if (saveTimer.value !== null) {
      clearTimeout(saveTimer.value);
      saveTimer.value = null;
    }
  },
  onEnd: async ({ oldIndex, newIndex, evt }) => {
    evt.stopPropagation();
    evt.preventDefault();
    if (oldIndex === newIndex) return;

    const stateToChangeSequence = localStates.value[oldIndex];
    console.log(stateToChangeSequence);
    const movedItem = localStates.value.splice(oldIndex, 1)[0];
    localStates.value.splice(newIndex, 0, movedItem);

    changeGroupSequence(stateToChangeSequence, newIndex);
    listKey.value += 1;
    await initSortable();
  },
});

watch(
  () => props.states,
  () => {
    localStates.value = props.states;
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.list-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-content {
  flex: 1;
}

.card-handle {
  cursor: move;
}
</style>
