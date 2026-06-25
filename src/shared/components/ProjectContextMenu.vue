<template>
  <q-menu
    ref="menuRef"
    class="context-menu"
    context-menu
    touch-position
    no-parent-event
    @hide="emit('resetContext')"
  >
    <q-list class="context-menu__options-list" separator>
      <q-item
        v-if="
          hasPermissionByProject(props.project as DtoProject, 'project-settings')
        "
        clickable
        @click="openSettings"
      >
        <q-item-section thumbnail class="q-px-md">
          <SettingsIcon />
        </q-item-section>
        <q-item-section>Настройки</q-item-section>
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
      <q-item clickable v-close-popup @click="copyProjectTitle">
        <q-item-section thumbnail class="q-px-md">
          <CopyNameIcon />
        </q-item-section>
        <q-item-section>Скопировать название</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';

import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';

import SettingsIcon from 'src/components/icons/SettingsIcon.vue';
import OpenNewTabIcon from 'src/components/icons/OpenNewTabIcon.vue';
import OpenNewWindowIcon from 'src/components/icons/OpenNewWindowIcon.vue';
import CopyNameIcon from 'src/components/icons/CopyNameIcon.vue';
import {
  DtoProject,
  DtoProjectLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  project: DtoProjectLight | null;
  anchorEvent?: MouseEvent | null;
}>();

const emit = defineEmits<{
  refresh: [];
  resetContext: [];
}>();

const router = useRouter();
const menuRef = ref<any>(null);
const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { hasPermissionByProject } = useRolesStore();

const openSettings = () => {
  if (!props.project) return;
  router.push(
    `/${currentWorkspaceSlug.value}/projects/${props.project.identifier || props.project.id}/settings`,
  );
};

const projectLink = computed(
  () =>
    `/${currentWorkspaceSlug.value}/projects/${props.project?.identifier || props.project?.id}`,
);

const openInNewTab = (): void => {
  window.open(projectLink.value, '_blank');
};

const openInNewWindow = (): void => {
  window.open(projectLink.value, '_blank', 'popup');
};

const copyProjectTitle = (): void => {
  try {
    navigator.clipboard.writeText(props.project?.name as string);
  } catch {
    console.error('Произошла ошибка при копировании названия');
  }
};

watch(
  () => props.anchorEvent,
  async (evt) => {
    if (!evt || !props.project) menuRef.value.hide();
    if (evt && menuRef.value && props.project) {
      menuRef.value.hide();
      await nextTick();
      menuRef.value.show(evt);
    }
  },
);
</script>
