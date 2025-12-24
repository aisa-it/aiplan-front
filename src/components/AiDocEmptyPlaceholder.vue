<template>
  <q-page class="flex justify-center" :class="!ny ? 'items-center' : 'items-start'">
    <div class="flex flex-col items-center">
      <div v-if="ny" style="padding: 40px 0px;">
        <q-img
          fit="contain"
          :src="newYearTree"
          style="width: 250px"
        />
      </div>
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
import newYearTree from 'src/assets/newYearTree.svg';
import { useUtilsStore } from 'src/stores/utils-store';

defineProps<{
  isAdminOrAuthor: boolean;
}>();

//stores
const aidocStore = useAiDocStore();
const workspaceStore = useWorkspaceStore();
const utilsStore = useUtilsStore();

//storesToRefs
const { workspaceInfo } = storeToRefs(workspaceStore);
const { ny } = storeToRefs(utilsStore);

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
