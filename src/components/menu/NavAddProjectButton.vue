<template>
  <q-btn
    flat
    dense
    style="margin-right: 5px"
    :disable="!hasPermission('create-project')"
    @click.stop.prevent
  >
    <q-icon name="add" dense size="18px" />
    <q-popup-proxy>
      <q-list>
        <q-item clickable @click="isProjectCreateOpen = !isProjectCreateOpen">
          <q-item-section v-close-popup> Создать проект </q-item-section>
        </q-item>
        <q-item
          :clickable="!isDemo"
          @click="isFormCreateOpen = !isFormCreateOpen"
        >
          <q-item-section v-close-popup>
            Создать форму
            <HintTooltip v-if="isDemo">
              Функционал АИФорм доступен в полной версии
            </HintTooltip>
          </q-item-section>
        </q-item>
        <q-item :clickable="!isDemo" @click="isImportOpen = true">
          <q-item-section v-close-popup> Импорт из Jira </q-item-section>
          <HintTooltip v-if="isDemo">
            Функционал импорта из Jira доступен в полной версии
          </HintTooltip>
        </q-item>
      </q-list>
    </q-popup-proxy>
  </q-btn>
  <ImportJiraDialog v-if="!isDemo" v-model="isImportOpen" />
  <NewProjectDialog v-model="isProjectCreateOpen" />
  <FormDialog v-model="isFormCreateOpen" @success-create="refreshForms" />
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
// services
import { useUtilsStore } from 'src/stores/utils-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useFormStore } from 'src/stores/form-store';
// components
import NewProjectDialog from 'src/components/dialogs/NewProjectDialog.vue';
import ImportJiraDialog from 'src/modules/import-jira/ui/ImportJiraDialog.vue';
import FormDialog from '../forms/dialogs/FormDialog.vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';

//hooks

// stroes
const utilsStore = useUtilsStore();
const formStore = useFormStore();
const workspaceStore = useWorkspaceStore();
const { hasPermission } = useRolesStore();

// store to refs
const { isDemo } = storeToRefs(utilsStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// dialogs vars
const isImportOpen = ref(false);
const isProjectCreateOpen = ref(false);
const isFormCreateOpen = ref(false);

const refreshForms = async () => {
  formStore.getFormList(currentWorkspaceSlug.value);
};
</script>
