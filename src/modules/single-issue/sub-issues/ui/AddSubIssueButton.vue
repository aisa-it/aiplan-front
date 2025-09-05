<template>
  <q-btn v-if="isDisabled" class="btn-only-icon-sm q-ml-sm" no-caps>
    <AddIcon />
    <q-popup-proxy>
      <q-list>
        <q-item clickable v-close-popup @click="addNewIssue">
          <q-item-section>
            <q-item-label>Создать новую</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-close-popup @click="isChildrenOpen = true">
          <q-item-section>
            <q-item-label>Добавить существующую</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-popup-proxy>
  </q-btn>
  <SelectIssueDialog
    v-model="isChildrenOpen"
    :loading="loading"
    :project="project"
    multi
    @refresh="onLoad"
    @multi-select="addIssue"
  />
</template>

<script setup lang="ts">
// core
import { useQuasar, EventBus } from 'quasar';
import { toRefs, ref, inject } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
// stores
import { useNotificationStore } from 'src/stores/notification-store';
import { useProjectStore } from 'src/stores/project-store';

// components
import AddIcon from 'src/components/icons/AddIcon.vue';
import NewIssueDialog from 'src/components/NewIssueDialog.vue';
import SelectIssueDialog from 'src/components/dialogs/IssueDialogs/SelectIssueDialog.vue';

// constants
import { SUCCESS_ADD_SUBISSUE } from 'src/constants/notifications';

// interfaces
import { IIssueSelectRequest } from 'src/interfaces/issues';
import { useLoad } from 'src/composables/useLoad';
import { getAvailableSubIssues, updateSubIssues } from '../services/api';

const props = defineProps<{
  projectid: string | null;
  issueid: string;
  isDisabled?: boolean;
}>();
const emits = defineEmits<{ refresh: [] }>();

const $q = useQuasar();
const { setNotificationView } = useNotificationStore();
const projectStore = useProjectStore();
const route = useRoute();
const bus = inject('bus') as EventBus;

const { project} = storeToRefs(projectStore)
const { issueid: parentId } = toRefs(props);
const isChildrenOpen = ref(false);

const addIssue = (items: Array<string>) => {
  if (!props.projectid) return;

  updateSubIssues(
    route.params.workspace as string,
    route.params.project as string,
    route.params.issue as string,
    items,
  ).then(() => {
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: SUCCESS_ADD_SUBISSUE,
    });
    emits('refresh');
  });
};

const addNewIssue = () => {
  $q.dialog({
    component: NewIssueDialog,
    componentProps: {
      parent: parentId.value,
      projectid: props.projectid,
    },
  }).onOk(() => emits('refresh'));
};

const onRequest = async (params: IIssueSelectRequest) => {
  getAvailableSubIssues(
    route.params.workspace as string,
    route.params.project as string,
    route.params.issue as string,
    params,
  ).then(({ data }) => bus.emit('updateSelectIssue', data));
};
const { loading, onLoad } = useLoad(onRequest);
</script>

<style lang="scss">
@media screen and (max-width: 500px) {
  .q-tabs--mobile-without-arrows {
    max-width: 100%;
  }
}
</style>

<style scoped lang="scss">
.q-item__section--main ~ .q-item__section--side {
  padding-left: 0;
  align-items: start;
}

@media screen and(max-width: 600px) {
  .btn {
    padding: 0 4px !important;
  }
}
</style>
