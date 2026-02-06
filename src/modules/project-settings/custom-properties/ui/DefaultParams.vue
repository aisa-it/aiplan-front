<template>
  <div class="params-grid">
    <div
      v-for="(column, colIndex) in columns"
      :key="colIndex"
      class="params-column"
    >
      <div v-for="item in column" :key="item.name" class="params-item">
        <component :is="item.icon" class="params-icon" :color="item.color" />

        <div class="params-label">
          {{ item.label }}
        </div>

        <q-icon
          :name="item.show ? 'visibility' : 'visibility_off'"
          class="params-eye cursor-pointer"
          @click="updateHideFields(item)"
        />
      </div>

      <div class="column-divider" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, markRaw, onMounted, ref } from 'vue';

import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';

import PriorityIcon from 'src/components/icons/PriorityIcon.vue';
import UserIcon from 'src/components/icons/UserIcon.vue';
import ObserveIcon from 'src/components/icons/ObserveIcon.vue';
import CheckStatusIcon from 'src/components/icons/CheckStatusIcon.vue';
import SprintIcon from 'src/components/icons/SprintIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import TagIcon from 'src/components/icons/TagIcon.vue';
import CreateDateIcon from 'src/components/icons/CreateDateIcon.vue';
import ExecuteDateIcon from 'src/components/icons/ExecuteDateIcon.vue';
import StartDateIcon from 'src/components/icons/StartDateIcon.vue';
import EndDateIcon from 'src/components/icons/EndDateIcon.vue';
import AlertIcon from 'src/components/icons/AlertIcon.vue';
import ParentIcon from 'src/components/icons/ParentIcon.vue';

const projectStore = useProjectStore();
const { project } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());

interface ParamItem {
  icon: any;
  label: string;
  name: string;
  show: boolean;
  color?: string;
}

const params = ref<ParamItem[]>([
  {
    icon: markRaw(PriorityIcon),
    label: 'Приоритет',
    name: 'priority',
    show: true,
  },
  {
    icon: markRaw(UserIcon),
    label: 'Автор',
    name: 'author',
    show: true,
  },
  {
    icon: markRaw(UserIcon),
    label: 'Исполнитель',
    name: 'assignees',
    show: true,
  },
  {
    icon: markRaw(ObserveIcon),
    label: 'Наблюдатель',
    name: 'wathcers',
    show: true,
  },
  {
    icon: markRaw(CheckStatusIcon),
    label: 'Статус',
    name: 'state',
    show: true,
  },
  {
    icon: markRaw(SprintIcon),
    label: 'Спринт',
    name: 'sprint',
    show: true,
  },
  {
    icon: markRaw(LinkIcon),
    label: 'Ссылки',
    name: 'link_count',
    show: true,
  },
  {
    icon: markRaw(TagIcon),
    label: 'Теги',
    name: 'labels',
    show: true,
  },
  {
    icon: markRaw(CreateDateIcon),
    label: 'Дата создания',
    name: 'created_at',
    show: true,
  },
  {
    icon: markRaw(ExecuteDateIcon),
    label: 'Срок исполнения',
    name: 'target_date',
    show: true,
  },
  {
    icon: markRaw(StartDateIcon),
    label: 'Дата начала',
    name: 'start_date',
    show: true,
  },
  {
    icon: markRaw(EndDateIcon),
    label: 'Дата завершения',
    name: 'completed_at',
    show: true,
  },
  {
    icon: markRaw(AlertIcon),
    label: 'Блокирует',
    color: 'rgb(236, 177, 104)',
    name: 'blocker_issues',
    show: true,
  },
  {
    icon: markRaw(AlertIcon),
    label: 'Заблокирована',
    color: 'rgb(230, 111, 96)',
    name: 'blocked_issues',
    show: true,
  },
  {
    icon: markRaw(ParentIcon),
    label: 'Родитель',
    name: 'sub_issues_count',
    show: true,
  },
]);

onMounted(() => {
  if (!project.value?.hide_fields || !project.value?.hide_fields?.length)
    return;

  params.value.forEach((el) => {
    el.show = !project.value?.hide_fields.includes(el.name);
  });
});

const updateHideFields = async (item: ParamItem) => {
  item.show = !item.show;

  projectStore.updateProjectInfo(
    currentWorkspaceSlug.value ?? '',
    project.value.id,
    { hide_fields: params.value.filter((el) => !el.show).map((el) => el.name) },
  );
};

const columns = computed(() => {
  const result = [];
  const chunkSize = 4;

  for (let i = 0; i < params.value.length; i += chunkSize) {
    result.push(params.value.slice(i, i + chunkSize));
  }

  return result;
});
</script>

<style lang="scss" scoped>
.params-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.params-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 0 16px;
}

.column-divider {
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: $darkest-border-color;
}

@media (min-width: 1404px) {
  .params-column:last-child .column-divider {
    display: none;
  }
}

.params-item {
  width: 100%;
  max-width: 220px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.params-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.params-label {
  flex: 1;
  font-size: 14px;
}

.params-eye {
  flex-shrink: 0;
}
</style>
