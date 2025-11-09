<template>
  <ExpansionItem v-if="forms?.length" full-open itemName="forms">
    <template v-slot:header>
      <HeaderMenuItem @click-add-button="openAddForm" />
    </template>
    <template v-slot:content>
      <ContentMenuItem :forms="forms" />
    </template>
  </ExpansionItem>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';

import { useFormStore } from 'src/modules/ai-forms/stores/form-store';
import { useFormDialogStore } from 'src/modules/ai-forms/stores/form-dialog-store';

import ExpansionItem from '../ExpansionItem.vue';
import HeaderMenuItem from 'src/modules/ai-forms/shared/HeaderMenuItem.vue';
import ContentMenuItem from 'src/modules/ai-forms/shared/ContentMenuItem.vue';

const formStore = useFormStore();
const formDialogStore = useFormDialogStore();

const { forms } = storeToRefs(formStore);

const openAddForm = () => {
  formDialogStore.openForCreat();
};
</script>
