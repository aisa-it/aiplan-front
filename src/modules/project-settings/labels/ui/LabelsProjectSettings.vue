<template>
  <div class="q-mt-md">
    <div class="col">
      <h4 class="text-lg font-semibold text-brand-base">Теги</h4>
      <p class="text-sm text-brand-secondary">Управление тегами проекта</p>
      <q-btn no-caps class="secondary-btn" @click="onAddOpen">
        Новый тег
      </q-btn>
    </div>
    <div class="col">
      <div
        v-for="(label, index) in projectLabels"
        :key="index"
        class="bordered-table q-my-md"
      >
        <SingleLabel
          :singleLabel="label"
          @delete="onDeleteOpen"
          @edit="onEditOpen"
        />
      </div>
    </div>
  </div>

  <CreateLabelDialog v-model="isAddOpen" @close="isAddOpen = !isAddOpen" />
  <DeleteLabelDialog v-model="isDeleteOpen" :currentLabel="label" />
  <EditLabelDialog
    v-model="isEditOpen"
    :currentLabel="label"
    @close="onEditClose"
  />
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { onMounted, ref } from 'vue';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import SingleLabel from 'src/modules/project-settings/labels/ui/SingleLabel.vue';
import EditLabelDialog from 'src/modules/project-settings/labels/ui/dialogs/EditLabelDialog.vue';
import DeleteLabelDialog from 'src/modules/project-settings/labels/ui/dialogs/DeleteLabelDialog.vue';
import CreateLabelDialog from 'src/modules/project-settings/labels/ui/dialogs/CreateLabelDialog.vue';

// interfaces
import { DtoLabelLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

// store to refs
const { project, projectLabels } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const label = ref<DtoLabelLight>();

// dialogs vars
const isDeleteOpen = ref(false);
const isEditOpen = ref(false);
const isAddOpen = ref(false);

const refresh = async () => {
  await projectStore.getProjectLabels(
    currentWorkspaceSlug.value as string,
    project.value.id,
  );
};

const onAddOpen = () => {
  isAddOpen.value = true;
};

const onEditOpen = (l: DtoLabelLight) => {
  label.value = l;
  isEditOpen.value = true;
};

const onEditClose = () => {
  label.value = {};
  isEditOpen.value = false;
};

const onDeleteOpen = (l: DtoLabelLight) => {
  label.value = l;
  isDeleteOpen.value = true;
};

onMounted(async () => await refresh());
</script>
