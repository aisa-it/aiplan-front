<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Удаление формы</h6>
        <span>
          Вы уверены, что хотите удалить форму
          <b>"{{ form?.title }}"</b>?
        </span>
        <span>Данную операцию нельзя будет отменить.</span>
      </q-card-section>

      <q-card-actions align="right">
        <CancelButton v-close-popup />
        <DeleteButton @click="handleDeleteForm" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router';

import CancelButton from 'src/components/buttons/CancelButton.vue';
import DeleteButton from 'src/components/buttons/DeleteButton.vue';

import { useNotificationStore } from 'src/stores/notification-store';
import { useFormStore } from 'src/modules/ai-forms/stores/form-store';

import { SUCCESS_FORM_DELETING } from 'src/constants/notifications';

import { DtoFormLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  form?: DtoFormLight;
}>();

const formStore = useFormStore();

const { setNotificationView } = useNotificationStore();

const route = useRoute();
const router = useRouter();

const handleDeleteForm = async () => {
  await formStore
    .deleteForm(route.params.workspace as string, props.form?.slug as string)
    .then(() => {
      if (route.params.formSlug === props.form?.slug) {
        router.push(`/${route.params.workspace}`);
      }
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_FORM_DELETING,
      });
    });
};
</script>
