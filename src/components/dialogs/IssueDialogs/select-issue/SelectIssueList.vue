<template>
  <div
    v-if="chip && selectedIssues.includes(chip?.id)"
    class="centered-horisontally q-mt-sm"
  >
    <q-chip
      removable
      style="max-width: 100% !important; margin: 0"
      :label="`${projectIdentifier}-${chip?.sequence_id}`"
      :title="`${projectIdentifier}-${chip?.sequence_id}`"
      @remove="onRemoveChip(chip?.id)"
    />
  </div>
  <q-virtual-scroll
    v-if="!loading && rows?.length"
    style="max-height: calc(100vh - 260px)"
    :items="rows"
    separator
    v-slot="{ index }"
  >
    <q-item
      v-show="rows[index]?.id !== api.currentIssue?.id"
      :key="index"
      dense
    >
      <q-item-section side top>
        <q-checkbox
          v-if="rows[index]"
          :model-value="selectedIssues"
          :val="rows[index].id"
          :disable="!canSelectedIssues(rows[index])"
          @update:model-value="onSelect"
        >
          <HintTooltip v-if="!canSelectedIssues(rows[index])">
            Недостаточно прав
          </HintTooltip>
        </q-checkbox>
      </q-item-section>
      <q-item-section side>
        <q-item-label v-if="rows[index]" no-wrap>
          {{
            projectIdentifier ??
            rows[index].project_detail?.identifier ??
            projectStore.project?.identifier
          }}-{{ rows[index]?.sequence_id }}
        </q-item-label>
        <q-skeleton type="rect" v-else />
      </q-item-section>

      <q-item-section no-wrap>
        <q-item-label v-if="rows[index]" no-wrap class="abbriviated-text">
          {{ rows[index]?.name }}
          <q-badge
            v-if="rows[index]?.draft"
            color="orange"
            floating
            class="q-mx-xs"
            >Черновик</q-badge
          >
        </q-item-label>
        <q-skeleton type="rect" v-else />
      </q-item-section>
    </q-item>
  </q-virtual-scroll>
  <div v-if="loading" class="row justify-center">
    <DefaultLoader class="q-my-md" />
  </div>
  <div v-if="!loading && !rows?.length" class="row justify-center q-my-md">
    <div class="column items-center">
      <DocumentIcon :width="52" :height="52"></DocumentIcon>
      <h6 class="q-my-md">Нет задач</h6>
    </div>
  </div>
</template>
<script setup lang="ts">
// core
import { inject, onMounted, onUnmounted, ref } from 'vue';

// stores
import { useRolesStore } from 'stores/roles-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useProjectStore } from 'src/stores/project-store';

// components
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

// interfaces
import { IIssueLabel, IIssueResponseData } from 'src/interfaces/issues';
import { EventBus } from 'quasar';
import { IProject } from 'src/interfaces/projects';

const props = defineProps<{
  allAllowed?: boolean;
  multi?: boolean | null;
  selectedIssues: string[];
  selectedExtentedIssues?: IIssueLabel;
  projectIdentifier?: string | null;
  loading?: boolean;
  project: IProject;
  chip?: any;
}>();

const emits = defineEmits<{
  'update:selectedIssues': [value: string[]];
  'update:selectedExtentedIssues': [value: IIssueLabel | undefined];
  removeChip: [];
}>();
const bus = inject('bus') as EventBus;
const api = useAiplanStore();
const projectStore = useProjectStore();
const { hasPermissionByIssue } = useRolesStore();

const rows = ref<IIssueLabel[]>([]);
const canSelectedIssues = (data: IIssueLabel) => {
  return (
    props.allAllowed ||
    hasPermissionByIssue(data, props.project, 'change-issue-primary')
  );
};

const onSelect = (e: any[]) => {
  if (!props.multi && e.length > 0) {
    emits('update:selectedIssues', [e[e?.length - 1]]);
    emits(
      'update:selectedExtentedIssues',
      rows.value.find((el: IIssueLabel) => el.id === e[e?.length - 1]),
    );
  } else {
    emits('update:selectedIssues', e);
  }
};

const onRemoveChip = (id: string) => {
  const issues = [...props.selectedIssues];
  const index = issues.indexOf(id);
  if (index !== -1) {
    issues.splice(index, 1);
    emits('update:selectedIssues', issues);
    emits('removeChip');
  }
};

const onUpdateData = (data: IIssueResponseData) => {
  rows.value = data.result;
};

onMounted(() => {
  bus.on('updateSelectIssue', onUpdateData);
});

onUnmounted(() => {
  bus.off('updateSelectIssue', onUpdateData);
});
</script>
<style scoped lang="scss">
.q-card__section--vert {
  padding: 10px;
}
</style>
