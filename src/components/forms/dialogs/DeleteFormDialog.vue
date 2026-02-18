<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Удаление формы</h6>
        <span>
          Вы уверены, что хотите удалить форму
          <b v-if="form">"{{ form.title }}"</b>?
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

//api
import { deleteForm } from 'src/components/forms/services/api';

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

//core
const route = useRoute();
const router = useRouter();

//stores
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const handleDeleteForm = async () => {
  if (!props.form?.slug || !currentWorkspaceSlug.value) return;
  await deleteForm(currentWorkspaceSlug.value, props.form.slug).then(() => {
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
