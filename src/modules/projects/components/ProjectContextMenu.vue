<template>
  <CursorActionMenu v-model="open" :target="target" :items="items" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import type { DtoProjectLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import CursorActionMenu from '@/components/menus/CursorActionMenu.vue';
import SettingsIcon from '@/components/icons/MenuSettingsIcon.vue';
import CopyNameIcon from '../icons/CopyNameIcon.vue';
import OpenNewTabIcon from '../icons/OpenNewTabIcon.vue';
import OpenNewWindowIcon from '../icons/OpenNewWindowIcon.vue';
import { toast } from '@/modules/toast';
import { getProjectRoute } from '../model/project-routes';

const open = defineModel<boolean>({ required: true });
const props = defineProps<{
  workspaceSlug: string;
  project: DtoProjectLight | null;
  target: [number, number];
  canOpenSettings: boolean;
}>();
const emit = defineEmits<{ navigate: [] }>();
const router = useRouter();
const { t } = useI18n();

const items = computed(() => {
  const project = props.project;
  if (!project) return [];
  const route = getProjectRoute(props.workspaceSlug, project);
  if (!route) return [];
  const { path, href } = router.resolve(route);

  return [
    ...(props.canOpenSettings
      ? [
          {
            label: t('projects.settings'),
            icon: SettingsIcon,
            onClick: () => {
              void router.push(`${path}/settings`);
              emit('navigate');
            },
          },
        ]
      : []),
    {
      label: t('projects.openNewTab'),
      icon: OpenNewTabIcon,
      onClick: () => window.open(href, '_blank', 'noopener'),
    },
    {
      label: t('projects.openNewWindow'),
      icon: OpenNewWindowIcon,
      onClick: () => window.open(href, '_blank', 'popup,noopener'),
    },
    {
      label: t('projects.copyName'),
      icon: CopyNameIcon,
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(project.name ?? '');
        } catch {
          toast.error();
        }
      },
    },
  ];
});
</script>
