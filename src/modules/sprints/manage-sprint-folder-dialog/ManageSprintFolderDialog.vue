<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="(val) => emits('update:modelValue', val)"
  >
    <q-card style="width: 400px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Управление папками</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Существующие папки:</div>
        <q-list bordered separator class="q-mb-md">
          <q-item
            v-if="sprintFolders.length === 0"
            class="text-grey text-center"
          >
            <q-item-section>Нет созданных папок</q-item-section>
          </q-item>
          <q-item
            v-for="folder in sprintFolders"
            :key="folder.id"
            clickable
            @click="selectFolder(folder.id)"
          >
            <q-item-section>
              <q-item-label>{{ folder.name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                flat
                dense
                icon="delete"
                color="negative"
                :disable="folder.sprints.length > 0"
                @click.stop="deleteFolder(folder.id)"
              >
                <q-tooltip v-if="folder.sprints.length > 0"
                  >Нельзя удалить непустую папку</q-tooltip
                >
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>

        <q-input
          v-model="newFolderName"
          outlined
          dense
          placeholder="Новое название папки"
        />
        <div class="row justify-end q-mt-sm">
          <q-btn
            color="primary"
            label="Создать новую"
            :disable="!newFolderName.trim()"
            @click="createFolder"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Убрать из папки"
          color="negative"
          @click="removeFromFolder"
        />
        <q-btn flat label="Отмена" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  modelValue: boolean;
  sprintId: string;
}>();

const emits = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const sprintStore = useSprintStore();
const workspaceStore = useWorkspaceStore();
const { sprintFolders } = storeToRefs(sprintStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const newFolderName = ref('');

const createFolder = () => {
  if (newFolderName.value.trim() && currentWorkspaceSlug.value) {
    sprintStore.createSprintFolder(
      currentWorkspaceSlug.value,
      newFolderName.value.trim(),
    );
    newFolderName.value = '';
  }
};

const deleteFolder = (id: string) => {
  if (currentWorkspaceSlug.value) {
    try {
      sprintStore.deleteSprintFolder(currentWorkspaceSlug.value, id);
    } catch (e) {
      console.error(e);
    }
  }
};

const selectFolder = (id: string) => {
  if (currentWorkspaceSlug.value) {
    sprintStore.moveSprintToFolder(
      currentWorkspaceSlug.value,
      props.sprintId,
      id,
    );
    emits('success');
    emits('update:modelValue', false);
  }
};

const removeFromFolder = () => {
  if (currentWorkspaceSlug.value) {
    sprintStore.moveSprintToFolder(
      currentWorkspaceSlug.value,
      props.sprintId,
      null,
    );
    emits('success');
    emits('update:modelValue', false);
  }
};
</script>
