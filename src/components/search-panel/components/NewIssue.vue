<template>
  <v-btn
    color="primary"
    variant="flat"
    :ripple="false"
    class="new-issue-btn"
    data-tour="create-issue"
    :disabled="!workspaceSlug || isWorkspaceLoading"
    @click="openDialog"
  >
    <AddIcon />
    <span class="leading-none">{{ t('common.actions.create') }}</span>
  </v-btn>
  <IssueCreationDialog
    v-if="dialog"
    :workspace-slug="dialog.workspaceSlug"
    :initial-project="dialog.initialProject"
    @close="dialog = null"
  />
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, shallowRef } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import AddIcon from '@/components/icons/AddIcon.vue';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { getStringParam } from '@/utils/object';

const IssueCreationDialog = defineAsyncComponent(
  () =>
    import('@/modules/issues/components/create-issue/IssueCreationDialog.vue'),
);

const { t } = useI18n();
const route = useRoute();
const { currentWorkspaceSlug, isLoading: isWorkspaceLoading } =
  storeToRefs(useWorkspaceStore());
const workspaceSlug = computed(
  () => getStringParam(route.params.workspace) || currentWorkspaceSlug.value,
);
const dialog = shallowRef<{
  workspaceSlug: string;
  initialProject?: string;
} | null>(null);

const openDialog = () => {
  if (!workspaceSlug.value) return;
  dialog.value = {
    workspaceSlug: workspaceSlug.value,
    initialProject: getStringParam(route.params.project) || undefined,
  };
};
</script>
