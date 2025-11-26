<template>
  <q-menu
    class="context-menu"
    :style="`z-index: ${isTransferOpen || isDeletingOpen ? 6000 : 9001}`"
    context-menu
    touch-position
  >
    <q-list class="context-menu__options-list" separator>
      <q-item
        v-if="!props.unpin"
        clickable
        v-close-popup
        @click="pinIssue(props.row, workspaceSlug, projectId)"
      >
        <q-item-section>Закрепить</q-item-section>
      </q-item>
      <q-item v-else clickable v-close-popup @click="unpinIssue(props.row, workspaceSlug, projectId)">
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
      <q-item clickable @click="transferIssue">
        <q-item-section thumbnail class="q-px-md">
          <CopyTransferIcon />
        </q-item-section>
        <q-item-section>Копировать/перенести</q-item-section>
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
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import { useIssuesStore } from 'src/stores/issues-store';

import DeleteIssueDialog from 'src/components/dialogs/IssueDialogs/DeleteIssueDialog.vue';
import TransferTaskDialog from 'src/components/dialogs/TransferTaskDialogs/TransferTaskDialog.vue';
import { useRoute } from 'vue-router';
import CopyLinkIcon from 'src/components/icons/CopyLinkIcon.vue';
import OpenNewTabIcon from 'src/components/icons/OpenNewTabIcon.vue';
import OpenNewWindowIcon from 'src/components/icons/OpenNewWindowIcon.vue';
import CopyNameIcon from 'src/components/icons/CopyNameIcon.vue';
import CopyTransferIcon from 'src/components/icons/CopyTransferIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';

const props = defineProps<{
  row: object | null;
  unpin?: boolean;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const { pinIssue, unpinIssue } = useIssuesStore();

const route = useRoute()
const workspaceSlug = computed(() => {
  return (route.params.workspace as string);
});
const projectId = computed(() => {
  return route.params.project as string;
});

const issueLink = props.row?.short_url;
const isDeletingOpen = ref<boolean>(false);
const isTransferOpen = ref<boolean>(false);

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
