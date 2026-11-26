<template>
  <v-dialog
    :model-value="!!issue"
    :persistent="saving"
    max-width="640"
    @update:model-value="onDialogUpdate"
  >
    <v-card class="rounded-xl">
      <v-card-title class="wrap-break-word whitespace-normal">
        {{ t('issues.board.sprints.title') }}
      </v-card-title>
      <v-card-text>
        <div v-if="loading" class="flex justify-center py-4">
          <v-progress-circular indeterminate color="primary" />
        </div>
        <p v-else-if="loadFailed" role="status">
          {{ t('issues.board.sprints.loadError') }}
        </p>
        <template v-else>
          <p v-if="!folders.length">{{ t('issues.board.sprints.empty') }}</p>
          <template v-else>
            <p>{{ t('issues.board.sprints.description', { issue: issueLabel }) }}</p>
            <div class="max-h-[60dvh] overflow-y-auto">
              <component
                :is="hasFolderHeading(folder.id) ? 'details' : 'div'"
                v-for="folder in folders"
                :key="folder.id"
              >
                <summary v-if="hasFolderHeading(folder.id)" class="cursor-pointer py-2 font-medium">
                  {{ folder.name }}
                </summary>
                <v-checkbox
                  v-for="sprint in folder.sprints"
                  :key="sprint.id"
                  v-model="selected"
                  :value="sprint.id"
                  :label="sprintTitle(sprint)"
                  :disabled="saving"
                  :class="{ 'pl-4': hasFolderHeading(folder.id) }"
                  color="primary"
                  density="compact"
                  hide-details
                />
              </component>
            </div>
          </template>
        </template>
      </v-card-text>
      <v-card-actions class="justify-end">
        <v-btn color="primary" variant="outlined" :disabled="saving" @click="issue = null">
          {{ t('common.actions.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="loading || loadFailed || !changes.length"
          :loading="saving"
          @click="save"
        >
          {{ t('common.actions.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type {
  DtoIssueWithCount,
  DtoSprintLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { toast } from '@/modules/toast';
import { ROOT_SPRINT_FOLDER_ID } from '@/modules/sprints/model/sprint-folders';
import { issueSprintsService } from '../../api/issue-sprints.service';

type SprintOption = DtoSprintLight & { id: string };
type SprintFolder = { id: string; name?: string; sprints: SprintOption[] };

const props = defineProps<{ workspaceSlug: string; requiredSprint?: DtoSprintLight }>();
const issue = defineModel<DtoIssueWithCount | null>({ required: true });
const emit = defineEmits<{
  change: [before: DtoIssueWithCount, after: DtoIssueWithCount];
}>();
const { t } = useI18n();
const folders = shallowRef<SprintFolder[]>([]);
const confirmed = shallowRef(new Map<string, DtoSprintLight>());
const selected = ref<string[]>([]);
const loading = ref(false);
const saving = ref(false);
const loadFailed = ref(false);
const available = computed(() =>
  new Map(
    folders.value.flatMap(({ sprints }) =>
      sprints.map((sprint) => [sprint.id, sprint] as const),
    ),
  ),
);

const issueLabel = computed(() => {
  if (!issue.value) return '';
  const { project_detail, sequence_id, name } = issue.value;
  return `${project_detail?.identifier ?? ''}-${sequence_id ?? ''} ${name ?? ''}`;
});
const changes = computed(() => {
  const checked = new Set(selected.value);
  return [
    ...selected.value
      .filter((id) => !confirmed.value.has(id))
      .map((id) => ({ id, included: true })),
    ...[...confirmed.value.keys()]
      .filter((id) => !checked.has(id))
      .map((id) => ({ id, included: false })),
  ];
});

const hasFolderHeading = (id?: string) => !!id && id !== ROOT_SPRINT_FOLDER_ID;

function onDialogUpdate(open: boolean) {
  if (!open) issue.value = null;
}

function sprintTitle(sprint: DtoSprintLight) {
  const { name = '', start_date, end_date } = sprint;
  if (!start_date || !end_date) return name;
  const shortDate = (value: string) => `${value.slice(8, 10)}.${value.slice(5, 7)}`;
  return `${name} (${shortDate(start_date)} - ${shortDate(end_date)})`;
}

watch(issue, async (target, _, onCleanup) => {
  if (!target) return;
  const controller = new AbortController();
  onCleanup(() => controller.abort());
  const memberships = [...(target.sprints ?? []), ...(props.requiredSprint ? [props.requiredSprint] : [])];
  confirmed.value = new Map(
    memberships.flatMap((sprint) =>
      sprint.id ? [[sprint.id, sprint] as const] : [],
    ),
  );
  selected.value = [...confirmed.value.keys()];
  folders.value = [];
  loadFailed.value = false;
  loading.value = true;
  try {
    const result = await issueSprintsService.list(
      props.workspaceSlug,
      controller.signal,
    );
    if (controller.signal.aborted) return;
    const options = result
      .map(({ id, name, sprints }) => ({
        id: id ?? ROOT_SPRINT_FOLDER_ID,
        name,
        sprints: sprints?.filter((sprint): sprint is SprintOption => !!sprint.id) ?? [],
      }))
      .filter((folder) => folder.sprints.length > 0);
    folders.value = [
      ...options.filter(({ id }) => hasFolderHeading(id)),
      ...options.filter(({ id }) => !hasFolderHeading(id)),
    ];
  } catch {
    if (!controller.signal.aborted) loadFailed.value = true;
  } finally {
    if (!controller.signal.aborted) loading.value = false;
  }
}, { immediate: true });

async function save() {
  const target = issue.value;
  const issueId = target?.id;
  if (
    !target ||
    !issueId ||
    loading.value ||
    loadFailed.value ||
    saving.value ||
    !changes.value.length
  ) return;

  const pending = changes.value;
  saving.value = true;
  try {
    const results = await Promise.allSettled(
      pending.map(({ id, included }) =>
        issueSprintsService.setMembership(props.workspaceSlug, id, issueId, included),
      ),
    );
    const saved = new Map(confirmed.value);
    for (const [index, result] of results.entries()) {
      if (result.status !== 'fulfilled') continue;
      const { id, included } = pending[index];
      const sprint = available.value.get(id);
      if (included && sprint) saved.set(id, sprint);
      if (!included) saved.delete(id);
    }
    if (results.some((result) => result.status === 'fulfilled')) {
      emit('change', target, { ...target, sprints: [...saved.values()] });
      confirmed.value = saved;
    }
    if (results.every((result) => result.status === 'fulfilled')) {
      toast.success();
      issue.value = null;
    }
  } finally {
    saving.value = false;
  }
}
</script>
