<template>
  <q-page class="flex justify-center items-center">
    <div class="flex flex-col items-center">
      <AIDocIcon :width="120" :height="120" />
      <span style="font-size: 25px">{{
        aidocStore.rootDocs.length > 0
          ? 'Выберите документ'
          : 'Создайте документ'
      }}</span>
      <q-btn
        v-if="aidocStore.rootDocs.length > 0 && currentUserRole > 5"
        flat
        dense
        no-caps
        class="primary-btn q-mt-lg"
        label="Изменить порядок иерархии"
        @click="openHierarchyDocDialog"
      />
    </div>
    <HierarchyDocDialog
      v-model="showHierarchyDialog"
      :document="documentValue"
      :isAdminOrAuthor="isAdminOrAuthor"
    />
  </q-page>
</template>

<script lang="ts" setup>
//core
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
//stores
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
//components
import HierarchyDocDialog from './dialogs/AIDocDialogs/HierarchyDocDialog.vue';
//icons
import AIDocIcon from './icons/AIDocIcon.vue';

defineProps<{
  isAdminOrAuthor: boolean;
}>();

//stores
const aidocStore = useAiDocStore();
const workspaceStore = useWorkspaceStore();

//storesToRefs
const { workspaceInfo } = storeToRefs(workspaceStore);

//variables
const showHierarchyDialog = ref(false);
const documentValue = ref({});

//computeds
const currentUserRole = computed(() => {
  if (!workspaceInfo || !workspaceInfo.value) return 0;
  return workspaceInfo.value?.current_user_membership?.role ?? 0;
});

//methods
const openHierarchyDocDialog = () => {
  showHierarchyDialog.value = true;
  aidocStore.isHierarchyOpened = true;
};
</script>
