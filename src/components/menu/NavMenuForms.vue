<template>
  <ExpansionItem v-if="forms?.length" full-open itemName="forms">
    <template v-slot:header>
      <div class="row centered-horisontally justify-between full-w">
        <q-item-section avatar>
          <MenuFormsIcon :is-dark="$q.dark.isActive" />
        </q-item-section>
        <q-item-section>Формы</q-item-section>
        <q-btn
          flat
          dense
          style="margin-right: 5px"
          @click.stop.prevent="
            () => {
              currentFormSlug = null;
              isOpenEditingForm = true;
            }
          "
          ><q-icon name="add" dense size="18px" />
          <HintTooltip>Создать форму</HintTooltip>
        </q-btn>
      </div>
    </template>
    <template v-slot:content>
      <q-list>
        <q-item
          v-for="form in forms"
          class="centered-horisontally menu-link"
          clickable
          :key="form?.id"
          :active="$route.params.formSlug === form.slug"
          @click="$router.push(`/${currentWorkspaceSlug}/forms/${form.slug}`)"
        >
          <DocumentIcon class="q-mr-sm" />
          <span class="abbriviated-text">
            {{ form.title }}
          </span>
          <MenuActions :items="getFormMenuItems(form)" @click.stop />
        </q-item>
      </q-list>

      <FormDialog
        v-model="isOpenEditingForm"
        :form-slug="currentFormSlug"
        @success-create="refresh"
        @success-edit="refresh"
      />
      <DeleteFormDialog
        v-model="isOpenDeletingForm"
        :form="formToDelete!"
        @success-delete="refresh"
      />
    </template>
  </ExpansionItem>
</template>

<script setup lang="ts">
// core
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useFormStore } from 'src/stores/form-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

//api
import { getFormList } from 'src/components/forms/services/api';

// components
import LinkIcon from '../icons/LinkIcon.vue';
import ExpansionItem from '../ExpansionItem.vue';
import DocumentIcon from '../icons/DocumentIcon.vue';
import EditIcon from '../icons/EditIcon.vue';
import FormDialog from '../forms/dialogs/FormDialog.vue';
import BinIcon from '../icons/BinIcon.vue';
import DeleteFormDialog from '../forms/dialogs/DeleteFormDialog.vue';
import MenuActions from './MenuActions.vue';

// interfaces
import { IForms } from 'src/interfaces/forms';
import MenuFormsIcon from '../icons/MenuFormsIcon.vue';
import { useQuasar } from 'quasar';

const formStore = useFormStore();
const workspaceStore = useWorkspaceStore();
const $q = useQuasar();

const { forms } = storeToRefs(formStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const isOpenEditingForm = ref(false);
const isOpenDeletingForm = ref(false);
const currentFormSlug = ref<string | null>(null);
const formToDelete = ref<IForms>();

const refresh = async () => {
  if (!currentWorkspaceSlug.value) return;
  await getFormList(currentWorkspaceSlug.value).then(
    (res) => (formStore.forms = res),
  );
};

const deleteForm = async (form: IForms) => {
  formToDelete.value = form;
  isOpenDeletingForm.value = true;
};

const getFormMenuItems = (form: IForms) => {
  return [
    {
      text: 'Редактировать форму',
      icon: EditIcon,
      onClick: () => {
        currentFormSlug.value = form.slug ?? '';
        isOpenEditingForm.value = true;
      },
    },
    {
      text: 'Скопировать ссылку',
      icon: LinkIcon,
      onClick: () => {
        if (form?.slug) {
          formStore.copyFormLink(form.slug);
        }
      },
    },
    {
      text: 'Удалить форму',
      icon: BinIcon,
      onClick: () => {
        deleteForm(form);
      },
    },
  ];
};
</script>
