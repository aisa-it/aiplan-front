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
          <q-btn
            class="menu-link__btn"
            flat
            icon="more_horiz"
            :style="'min-height: 18px !important; min-width: 18px; font-size: 12px; padding: 0; color: gray;'"
            @click.stop
          >
            <q-menu>
              <q-list :style="'min-width: 225px; !important'">
                <q-item>
                  <q-btn
                    flat
                    dense
                    no-caps
                    v-close-popup
                    :style="'font-size: 12px; line-height: 1;'"
                    class="full-w menu-link__settings-btn"
                    @click="
                      () => {
                        currentFormSlug = form.slug;
                        isOpenEditingForm = true;
                      }
                    "
                  >
                    <EditIcon :width="16" :height="16" class="q-mr-sm" />
                    <span>Редактировать форму</span>
                  </q-btn>
                </q-item>
                <q-item>
                  <q-btn
                    flat
                    dense
                    no-caps
                    :style="'font-size: 12px; line-height: 1;'"
                    v-close-popup
                    class="full-w menu-link__settings-btn"
                    @click.stop="formStore.copyFormLink(form?.slug)"
                  >
                    <LinkIcon :width="16" :height="16" class="q-mr-sm" />
                    Скопировать ссылку
                  </q-btn>
                </q-item>
                <q-item>
                  <q-btn
                    flat
                    dense
                    no-caps
                    :style="'font-size: 12px; line-height: 1;'"
                    v-close-popup
                    class="full-w menu-link__settings-btn"
                    @click.stop="deleteForm(form)"
                  >
                    <BinIcon :width="16" :height="16" class="q-mr-sm" />
                    Удалить форму
                  </q-btn>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-item>
      </q-list>
    </template>
  </ExpansionItem>
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

<script setup lang="ts">
// core
import { ref } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useFormStore } from 'src/stores/form-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import LinkIcon from '../icons/LinkIcon.vue';
import ExpansionItem from '../ExpansionItem.vue';
import DocumentIcon from '../icons/DocumentIcon.vue';
import EditIcon from '../icons/EditIcon.vue';
import FormDialog from '../forms/dialogs/FormDialog.vue';
import BinIcon from '../icons/BinIcon.vue';
import DeleteFormDialog from '../forms/dialogs/DeleteFormDialog.vue';

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
  await formStore.getFormList(currentWorkspaceSlug.value);
};

const deleteForm = async (form: IForms) => {
  formToDelete.value = form;
  isOpenDeletingForm.value = true;
};
</script>
