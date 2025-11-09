<template>
  <q-list>
    <ItemListForms v-for="form in forms" :key="form.id" :form="form">
      <ActionButtonsFormItem
        @edit="() => openEditForm(form)"
        @copy="() => copyFormLink(form)"
        @delete="() => deleteForm(form)"
      />
    </ItemListForms>
  </q-list>

  <DeleteFormDialog v-model="isOpenDeletingForm" :form="formToDelete" />
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useFormDialogStore } from '../stores/form-dialog-store';

import { DtoFormLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import ItemListForms from '../components/ItemListForms.vue';
import ActionButtonsFormItem from '../ui/ActionButtonsFormItem.vue';
import DeleteFormDialog from '../dialogs/DeleteFormDialog.vue';

const isOpenDeletingForm = ref(false);
const formToDelete = ref({} as DtoFormLight);

const formDialogStore = useFormDialogStore();

defineProps<{ forms: DtoFormLight[] }>();

const openEditForm = (form: DtoFormLight) => {
  formDialogStore.openForEdit(form);
};

const deleteForm = (form: DtoFormLight) => {
  formToDelete.value = form;
  isOpenDeletingForm.value = true;
};

const copyFormLink = (form: DtoFormLight) => {
  navigator.clipboard.writeText(
    `${location.protocol}//${location.host}/f/${form?.slug}`,
  );
};
</script>
