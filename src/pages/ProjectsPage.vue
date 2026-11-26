<template>
  <div class="px-4 py-4">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="my-[0.375em] text-2xl leading-[1.2] font-normal sm:text-[2.125rem]">
        {{ t('projects.title') }}
      </h1>
      <ProjectCreateMenu
        v-if="canCreateProject"
        class="shrink-0"
        @create="isCreateOpen = true"
      />
    </div>

    <ProjectsTable :workspace-slug="workspaceSlug" />
    <NewProjectDialog v-model="isCreateOpen" :workspace-slug="workspaceSlug" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import NewProjectDialog from '@/components/dialogs/NewProjectDialog.vue';
import ProjectCreateMenu from '@/modules/projects/components/ProjectCreateMenu.vue';
import ProjectsTable from '@/modules/projects/components/ProjectsTable.vue';
import { useUserStore } from '@/stores/user-store';
import { checkPermissionByWs } from '@/utils/permissions';

const props = defineProps<{ workspaceSlug: string }>();
const { t } = useI18n();
const { workspaceRoleName } = storeToRefs(useUserStore());
const canCreateProject = computed(() =>
  checkPermissionByWs(workspaceRoleName.value, 'create-project'),
);
const isCreateOpen = ref(false);

watch(() => props.workspaceSlug, () => {
  isCreateOpen.value = false;
});
</script>
