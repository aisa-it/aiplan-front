<template>
  <div class="all-states bordered-table">
    <div
      v-for="(state, idx) in props.states"
      class="drag-card"
      :key="idx"
      :draggable="startDrag ? true : false"
      @dragstart="handleDragStart($event, +idx, state)"
      @dragover.prevent="handleDragOver($event)"
      @dragend="handleDragEnd($event)"
      @drop="handleDrop($event, +idx)"
    >
      <div v-if="$q.platform.is.desktop === true" class="row justify-center">
        <div class="card-handle" @mousedown="startDragging($event, +idx)">☰</div>
      </div>
      <div
        v-if="$q.platform.is.mobile === true"
        class="q-pa-sm row justify-end"
      >
        <q-btn
          v-if="idx + 1 !== props.states.length"
          no-caps
          class="btn-only-icon-sm bordered q-mr-xs"
          @click="changeGroupSequence(state, +idx + 1)"
        >
          <HintTooltip>Переместить вниз</HintTooltip>
          <ArrowDown />
        </q-btn>
        <q-btn
          v-if="+idx !== 0"
          no-caps
          class="btn-only-icon-sm bordered"
          @click="changeGroupSequence(state, +idx - 1)"
        >
          <HintTooltip>Переместить вверх</HintTooltip>
          <ArrowDown class="rotate-180" />
        </q-btn>
      </div>
      <SingleState
        :singleState="state"
        :statesList="states"
        class="state"
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
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';

// stores
import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// utils
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';

// components
import SingleState from 'src/modules/project-settings/states/ui/SingleState.vue';
import ArrowDown from 'src/components/icons/ArrowDown.vue';
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
const $q = useQuasar();
// vars
const statesStore = useStatesStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const state = ref<DtoStateLight>();
const startDrag = ref(false);
// flags for dialogs
const isDeleteOpen = ref(false);
const isEditOpen = ref(false);
const draggableState = ref<DtoStateLight>();

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

let draggingIndex = -1;

const startDragging = (event: MouseEvent, index: number) => {
  startDrag.value = true;
  draggingIndex = index;
};

const handleDragStart = (event: any, index: number, state: DtoStateLight) => {
  if (draggingIndex !== -1) {
    statesStore.setDraggingState(state.group as string);
    draggableState.value = state;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', '');
    event.currentTarget.classList.add('dragging-state');
  }
};

const handleDragOver = (event: DragEvent) => {
  event.dataTransfer.dropEffect = 'move';
};

const handleDrop = async (event: Event, dropIndex: number) => {
  if (
    draggingIndex !== -1 &&
    draggingIndex !== dropIndex &&
    statesStore.draggingState === props.states[0]?.group &&
    draggableState.value
  ) {
    await changeGroupSequence(draggableState.value, dropIndex);
  } else if (
    dropIndex === draggingIndex &&
    statesStore.draggingState === props.states[0]?.group
  ) {
    return;
  } else
    return setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Перемещать статусы можно только внутри группы',
    });

  statesStore.setDraggingState('');
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
const handleDragEnd = (event: any) => {
  event.currentTarget.classList.remove('dragging-state');
  startDrag.value = false;
};
</script>

<style scoped lang="scss">
.card-content {
  flex: 1;
}

.card-handle {
  cursor: move;
}
</style>
