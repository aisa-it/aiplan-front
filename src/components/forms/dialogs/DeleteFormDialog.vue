<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Удаление формы</h6>
        <span>
          Вы уверены, что хотите удалить форму
          <b>"{{ form.title }}"</b>?
        </span>
        <span>Данную операцию нельзя будет отменить.</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          style="width: 100px"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Удалить"
          class="delete-btn"
          style="width: 100px"
          @click="handleDeleteForm"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useFormStore } from 'src/stores/form-store';

// constants
import { SUCCESS_FORM_DELETING } from 'src/constants/notifications';

// interfaces
import { IForms } from 'src/interfaces/forms';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps<{
  form?: IForms;
}>();
const emits = defineEmits<{
  successDelete: [];
}>();
const formStore = useFormStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const route = useRoute();
const router = useRouter();
const handleDeleteForm = async () => {
  await formStore
    .deleteForm(currentWorkspaceSlug.value, props.form.slug)
    .then(() => {
      emits('successDelete');
      if (route.params.formSlug === props.form?.slug) {
        router.push(`/${currentWorkspaceSlug.value}`);
      }
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_FORM_DELETING,
      });
    });
};
</script>
