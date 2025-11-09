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
        <q-item :clickable="!isDemo" @click="formDialogStore.openForCreat">
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
  <FormDialog
    v-if="!isDemo"
    v-model="formDialogStore.isOpen"
    :form-for-edit="formDialogStore.form"
  />
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
// services
import { useUtilsStore } from 'src/stores/utils-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useFormDialogStore } from 'src/modules/ai-forms/stores/form-dialog-store';
// components
import NewProjectDialog from 'src/components/dialogs/NewProjectDialog.vue';
import ImportJiraDialog from 'src/modules/import-jira/ui/ImportJiraDialog.vue';
import FormDialog from '../../modules/ai-forms/dialogs/FormDialog.vue';

//hooks

// stroes
const utilsStore = useUtilsStore();
const formDialogStore = useFormDialogStore();
const { hasPermission } = useRolesStore();

// store to refs
const { isDemo } = storeToRefs(utilsStore);

// dialogs vars
const isImportOpen = ref(false);
const isProjectCreateOpen = ref(false);
</script>
