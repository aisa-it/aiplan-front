<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ml-md">Удаление документа</h6>
        <span>
          Вы уверены, что хотите удалить документ
          <b>"{{ props.document.title }}"</b>?
        </span>
        <span>Данную операцию нельзя будет отменить.</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Удалить"
          style="width: 96px"
          class="delete-btn"
          @click="deleteDocument"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useRouter, useRoute } from 'vue-router';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';
import {
  SUCCESS_DELETE_DOCUMENT,
  ERROR_DELETE_DOCUMENT,
} from 'src/constants/notifications';
import { useAiDocStore } from 'src/stores/aidoc-store';

const props = defineProps<{
  document: object;
}>();

const docStore = useAiDocStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const router = useRouter();
const route = useRoute();

const deleteDocument = async () => {
  if (props.document?.has_child_docs) {
    setNotificationView({
      type: 'error',
      open: true,
      customMessage: ERROR_DELETE_DOCUMENT,
    });
  } else {
    try {
      await docStore.deleteDocument(
        currentWorkspaceSlug?.value,
        route.params.doc,
      );
      setNotificationView({
        type: 'success',
        open: true,
        customMessage: SUCCESS_DELETE_DOCUMENT,
      });
      router.push(`/${currentWorkspaceSlug?.value}/aidoc`);
    } catch (e) {}
  }
};
</script>
