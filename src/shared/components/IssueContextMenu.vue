<template>
  <q-menu
    ref="menuRef"
    class="context-menu"
    :style="`z-index: ${isTransferOpen || isDeletingOpen || isManageSprintsOpen ? 6000 : 9001}`"
    v-bind="menuProps"
    touch-position
  >
    <q-list class="context-menu__options-list" separator>
      <q-item
        v-if="!isPinned"
        clickable
        v-close-popup
        @click="
          pinIssue(props.row, workspaceSlug, project.identifier, project.id)
        "
      >
        <q-item-section thumbnail class="q-px-md">
          <PinIcon />
        </q-item-section>
        <q-item-section>Закрепить</q-item-section>
      </q-item>
      <q-item
        v-else
        clickable
        v-close-popup
        @click="
          unpinIssue(props.row, workspaceSlug, project.identifier, project.id)
        "
      >
        <q-item-section thumbnail class="q-px-md">
          <UnpinIcon />
        </q-item-section>
        <q-item-section>Открепить</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="copyIssueLink">
        <q-item-section thumbnail class="q-px-md">
          <CopyLinkIcon />
        </q-item-section>
        <q-item-section>Скопировать ссылку</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="openInNewTab">
        <q-item-section thumbnail class="q-px-md">
          <OpenNewTabIcon :height="24" />
        </q-item-section>
        <q-item-section>Открыть в новой вкладке</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="openInNewWindow">
        <q-item-section thumbnail class="q-px-md">
          <OpenNewWindowIcon />
        </q-item-section>
        <q-item-section>Открыть в новом окне</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="copyIssueTitle">
        <q-item-section thumbnail class="q-px-md">
          <CopyNameIcon />
        </q-item-section>
        <q-item-section>Скопировать название</q-item-section>
      </q-item>
      <q-item v-if="isAdmin" clickable @click="manageIssueSprints">
        <q-item-section thumbnail class="q-px-md">
          <SprintIcon />
        </q-item-section>
        <q-item-section>Добавить в спринт</q-item-section>
      </q-item>
      <q-item clickable @click="transferIssue">
        <q-item-section thumbnail class="q-px-md">
          <CopyTransferIcon />
        </q-item-section>
        <q-item-section>Копировать/перенести</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="addNewIssue">
        <q-item-section thumbnail class="q-px-md">
          <ParentIcon />
        </q-item-section>
        <q-item-section>Создать подзадачу</q-item-section>
      </q-item>
      <q-item
        class="context-menu__options-item_red"
        clickable
        @click="deleteIssue"
      >
        <q-item-section thumbnail class="q-px-md">
          <BinIcon color="#cd5c5c" />
        </q-item-section>
        <q-item-section>Удалить</q-item-section>
      </q-item>
    </q-list>
    <TransferTaskDialog
      v-model="isTransferOpen"
      :issue="props.row"
      @refresh="emit('refresh')"
    />
    <DeleteIssueDialog
      v-model="isDeletingOpen"
      :issue="props.row"
      @refresh="emit('refresh')"
    />
    <ManageIssueSprintsDialog
      v-model="isManageSprintsOpen"
      :issue="props.row"
      @refresh="emit('refresh')"
    />
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useQuasar } from 'quasar';

import { useProjectStore } from 'src/stores/project-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

import DeleteIssueDialog from 'src/components/dialogs/IssueDialogs/DeleteIssueDialog.vue';
import TransferTaskDialog from 'src/components/dialogs/TransferTaskDialogs/TransferTaskDialog.vue';
import ManageIssueSprintsDialog from 'src/components/dialogs/IssueDialogs/ManageIssueSprintsDialog.vue';
import NewIssueDialog from 'src/components/NewIssueDialog.vue';

import CopyLinkIcon from 'src/components/icons/CopyLinkIcon.vue';
import OpenNewTabIcon from 'src/components/icons/OpenNewTabIcon.vue';
import OpenNewWindowIcon from 'src/components/icons/OpenNewWindowIcon.vue';
import CopyNameIcon from 'src/components/icons/CopyNameIcon.vue';
import CopyTransferIcon from 'src/components/icons/CopyTransferIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import PinIcon from 'src/components/icons/PinIcon.vue';
import UnpinIcon from 'src/components/icons/UnpinIcon.vue';
import SprintIcon from 'src/components/icons/SprintIcon.vue';
import ParentIcon from 'src/components/icons/ParentIcon.vue';

const props = defineProps<{
  row: object | null;
  anchorEvent?: MouseEvent | null;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const menuRef = ref<any>(null);

const isControlled = computed(() => !!props.anchorEvent);

const menuProps = computed(() => {
  return isControlled.value ? {} : { 'context-menu': true };
});

const { sprintsList } = storeToRefs(useSprintStore());
const { project } = storeToRefs(useProjectStore());
const { pinIssue, unpinIssue } = useIssuesStore();
const { pinnedIssues } = storeToRefs(useIssuesStore());
const { setNotificationView } = useNotificationStore();
const { hasPermission } = useRolesStore();

const $q = useQuasar();

const route = useRoute();
const workspaceSlug = computed<string>(() => {
  return route.params.workspace as string;
});

let issueLink = props.row?.short_url;
const isDeletingOpen = ref<boolean>(false);
const isTransferOpen = ref<boolean>(false);
const isManageSprintsOpen = ref<boolean>(false);

const isPinned = computed<boolean>(() => {
  return pinnedIssues.value?.some((issue) => issue.id === props.row?.id);
});

const isAdmin = computed(() => {
  return hasPermission('create-sprint');
});

const copyIssueLink = (): void => {
  try {
    navigator.clipboard.writeText(issueLink);
  } catch {
    console.error('Произошла ошибка при копировании ссылки');
  }
};

const openInNewTab = (): void => {
  window.open(issueLink, '_blank');
};

const openInNewWindow = (): void => {
  window.open(issueLink, '_blank', 'popup');
};

const copyIssueTitle = (): void => {
  try {
    navigator.clipboard.writeText(
      `${props.row?.project_detail?.identifier}-${props.row?.sequence_id} – ${props.row?.name}`,
    );
  } catch {
    console.error('Произошла ошибка при копировании названия');
  }
};

const transferIssue = (): void => {
  isTransferOpen.value = true;
};

const deleteIssue = (): void => {
  isDeletingOpen.value = true;
};

const manageIssueSprints = (): void => {
  if (!sprintsList.value.length) {
    setNotificationView({
      open: true,
      type: 'error',
      customMessage:
        'Нет активных спринтов. Чтобы добавить задачу, сначала создайте спринт.',
    });
    return;
  }
  isManageSprintsOpen.value = true;
};

const addNewIssue = () => {
  $q.dialog({
    component: NewIssueDialog,
    componentProps: {
      parent: props.row?.id,
      project: props.row?.project_detail,
    },
  }).onOk(() => emit('refresh'));
};

watch(
  () => props.anchorEvent,
  async (evt) => {
    if (evt && menuRef.value) {
      menuRef.value.hide();
      await nextTick();
      menuRef.value.show(evt);
      issueLink = props.row?.short_url;
    }
  },
);
</script>

<style lang="scss" scoped>
.context-menu {
  &__options-item {
    &_red {
      color: red;
    }
  }

  &__options-item_red {
    > .q-item__section {
      color: #cd5c5c !important;
    }

    &:hover > .q-item__section {
      color: red !important;
      ::v-deep(svg path) {
        fill: red !important;
      }
    }
  }
}
</style>
