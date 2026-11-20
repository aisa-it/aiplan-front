<template>
  <v-dialog
    :model-value="true"
    width="calc(100vw - 32px)"
    max-width="1280"
    height="900"
    max-height="calc(100dvh - 32px)"
    :aria-label="t('issues.create.title')"
    persistent
  >
    <v-card class="issue-creation-card" rounded="xl">
      <v-form class="issue-creation-form" @submit.prevent="submit">
        <header class="flex shrink-0 justify-end px-2 pt-2">
          <v-btn
            type="button"
            :aria-label="t('common.actions.close')"
            icon
            size="28"
            variant="text"
            color="icon"
            :disabled="isSaving"
            @click="requestClose"
          >
            <v-icon icon="mdi-close" size="18" />
          </v-btn>
        </header>

        <div class="issue-creation-body px-4 pb-4 sm:px-5">
          <div
            v-if="isLoadingProjects"
            role="status"
            :aria-label="t('issues.create.loading')"
          >
            <v-skeleton-loader type="heading, image, list-item-two-line" />
          </div>
          <v-alert v-else-if="projectLoadFailed" type="error" variant="tonal">
            <div class="flex flex-wrap items-center justify-between gap-2">
              {{ t('issues.create.projectLoadError') }}
              <v-btn variant="text" @click="loadProjects">
                {{ t('issues.create.retry') }}
              </v-btn>
            </div>
          </v-alert>
          <v-alert v-else-if="!scope" type="info" variant="tonal">
            {{ t('issues.create.noProjects') }}
          </v-alert>

          <template v-else>
            <div class="issue-creation-heading">
              <v-select
                v-model="selectedProjectId"
                :items="projectItems"
                :label="t('issues.create.project')"
                density="compact"
                variant="underlined"
                hide-details
                :disabled="formLocked"
              >
                <template #selection>{{
                  selectedProject?.identifier || selectedProject?.name
                }}</template>
              </v-select>
              <v-text-field
                ref="nameField"
                v-model="form.name"
                :label="t('common.fields.name')"
                :rules="[validateName]"
                validate-on="submit"
                density="compact"
                variant="underlined"
                hide-details="auto"
                :disabled="formLocked"
              />
              <v-select
                :model-value="selectedTemplateId"
                :items="templates"
                item-title="name"
                item-value="id"
                :label="t('issues.create.templates')"
                :no-data-text="t('issues.create.noTemplates')"
                density="compact"
                variant="underlined"
                hide-details
                clearable
                :disabled="formLocked || isLoading"
                @update:model-value="applyTemplate"
              />
            </div>

            <EditorTipTap
              v-model="form.descriptionHtml"
              editor-id="new-issue-description"
              :workspace-slug="workspaceSlug"
              :project-identifier="selectedProject?.identifier"
              :members="members"
              :get-members-for-mention="searchMentionMembers"
              :editable="!formLocked"
              :can-edit="!formLocked"
              :show-actions="false"
              can-resize
              @get-editor="editor = $event"
            />

            <div class="issue-creation-fields mt-4">
              <IssueCreationField
                :icon="PriorityIcon"
                :label="t('issues.columns.priority')"
              >
                <v-select
                  v-model="form.priority"
                  :items="priorityItems"
                  :label="t('issues.create.choosePriority')"
                  density="compact"
                  variant="underlined"
                  hide-details
                  clearable
                  :disabled="formLocked"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template #prepend>
                        <PrioritySingleIcon :type="item.value" class="mr-2" />
                      </template>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <PrioritySingleIcon :type="item.value" class="mr-2" />
                    {{ item.title }}
                  </template>
                </v-select>
              </IssueCreationField>

              <IssueCreationField
                :icon="CheckStatusIcon"
                :label="t('issues.columns.state')"
              >
                <v-select
                  v-model="form.statusId"
                  :items="statusItems"
                  :label="t('issues.create.chooseStatus')"
                  :no-data-text="t('issues.create.noOptions')"
                  density="compact"
                  variant="underlined"
                  hide-details
                  :loading="isLoading"
                  :disabled="formLocked || isLoading"
                >
                  <template #item="{ props: itemProps, item }">
                    <v-list-item v-bind="itemProps">
                      <template #prepend>
                        <span
                          class="mr-2 h-3 w-3 rounded-full"
                          :style="{ backgroundColor: item.color }"
                        />
                      </template>
                    </v-list-item>
                  </template>
                  <template #selection="{ item }">
                    <span
                      class="mr-2 h-3 w-3 rounded-full"
                      :style="{ backgroundColor: item.color }"
                    />
                    {{ item.title }}
                  </template>
                </v-select>
              </IssueCreationField>

              <IssueCreationField
                :icon="UserIcon"
                :label="t('issues.columns.assignees')"
              >
                <v-autocomplete
                  v-model="form.assigneeIds"
                  :items="assigneeItems"
                  :label="t('issues.create.chooseAssignees')"
                  :no-data-text="t('issues.create.noOptions')"
                  density="compact"
                  variant="underlined"
                  hide-details
                  multiple
                  chips
                  closable-chips
                  :disabled="formLocked || isLoading"
                />
              </IssueCreationField>

              <IssueCreationField
                :icon="CalendarIcon"
                :label="t('issues.columns.target_date')"
              >
                <v-menu v-model="isDateOpen" :close-on-content-click="false">
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      variant="text"
                      color="text"
                      class="min-h-10! max-w-full justify-start px-0! normal-case"
                      :disabled="formLocked"
                    >
                      {{
                        form.targetDate
                          ? formatDateTime(form.targetDate)
                          : t('issues.create.chooseDate')
                      }}
                    </v-btn>
                  </template>
                  <TargetDatePicker
                    v-if="isDateOpen"
                    :initial-date="form.targetDate"
                    :is-saving="false"
                    @save="setTargetDate"
                  />
                </v-menu>
              </IssueCreationField>

              <IssueCreationField
                :icon="ObserveIcon"
                :label="t('issues.columns.watchers')"
              >
                <v-autocomplete
                  v-model="form.watcherIds"
                  :items="memberItems"
                  :label="t('issues.create.chooseWatchers')"
                  :no-data-text="t('issues.create.noOptions')"
                  density="compact"
                  variant="underlined"
                  hide-details
                  multiple
                  chips
                  closable-chips
                  :disabled="formLocked || isLoading"
                />
              </IssueCreationField>

              <IssueCreationField
                :icon="ShareIcon"
                :label="t('issues.create.parent')"
              >
                <CreateIssueParentSelect
                  :key="scope.projectId"
                  v-model="form.parentId"
                  :workspace-slug="scope.workspaceSlug"
                  :project-id="scope.projectId"
                  :project-identifier="selectedProject?.identifier"
                  :only-authored-by="parentAuthorId"
                  :disabled="formLocked"
                />
              </IssueCreationField>

              <v-autocomplete
                v-if="canChangeSprint"
                v-model="form.sprintIds"
                :items="sprints"
                item-title="name"
                item-value="id"
                :label="t('issues.create.chooseSprints')"
                :no-data-text="t('issues.create.noOptions')"
                density="compact"
                variant="underlined"
                hide-details
                multiple
                chips
                closable-chips
                :disabled="formLocked || isLoading"
              />

              <IssueCreationField
                :icon="TagIcon"
                :label="t('issues.create.tags')"
                :class="{ 'issue-creation-tags--wide': !canChangeSprint }"
                compact
              >
                <CreateIssueTagSelect
                  :key="scope.projectId"
                  v-model="form.labelIds"
                  :workspace-slug="scope.workspaceSlug"
                  :project-id="scope.projectId"
                  :can-create="canCreateTag"
                  :disabled="formLocked"
                />
              </IssueCreationField>
            </div>

            <div class="mt-6">
              <IssueCreationLinks v-model="form.links" :disabled="formLocked" />
            </div>
            <IssueCreationAttachments
              v-model="form.attachments"
              class="mt-6"
              :disabled="formLocked"
            />
          </template>
        </div>

        <v-alert
          v-if="scope && !isSaving && (createdIssueId || saveFailed)"
          :type="createdIssueId ? 'warning' : 'error'"
          variant="tonal"
          class="mx-4 mb-2 shrink-0 sm:mx-5"
        >
          {{
            t(
              createdIssueId
                ? 'issues.create.partialSave'
                : 'issues.create.saveError',
            )
          }}
        </v-alert>
        <v-divider />
        <footer
          class="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 px-4 py-2 sm:px-5"
        >
          <v-switch
            v-if="scope"
            v-model="form.draft"
            :label="t('issues.create.draft')"
            color="primary"
            density="compact"
            hide-details
            class="mr-auto grow-0"
            :disabled="formLocked"
          />
          <v-btn
            variant="outlined"
            color="primary"
            :disabled="isSaving"
            @click="requestClose"
          >
            {{
              t(
                createdIssueId
                  ? 'common.actions.close'
                  : 'common.actions.cancel',
              )
            }}
          </v-btn>
          <v-btn
            v-if="scope"
            type="submit"
            variant="flat"
            color="primary"
            :disabled="isLoading || isSaving"
            :loading="isSaving"
          >
            {{
              t(createdIssueId ? 'issues.create.retry' : 'common.actions.add')
            }}
          </v-btn>
        </footer>
      </v-form>
    </v-card>
  </v-dialog>

  <v-dialog v-model="isDiscardOpen" max-width="440">
    <v-card rounded="xl">
      <v-card-title>{{ t('issues.create.discardTitle') }}</v-card-title>
      <v-card-text>{{ t('issues.create.discardText') }}</v-card-text>
      <v-card-actions class="justify-end">
        <v-btn variant="text" @click="isDiscardOpen = false">
          {{ t('issues.create.keepEditing') }}
        </v-btn>
        <v-btn color="error" variant="flat" @click="emit('close')">
          {{ t('issues.create.discard') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  reactive,
  ref,
  shallowRef,
  watch,
} from 'vue';
import { useEventBus } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import type { Editor } from '@tiptap/vue-3';
import type {
  DtoIssueLinkLight,
  DtoProjectMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import type { SubmitEventPromise } from 'vuetify';
import type { VTextField } from 'vuetify/components';

import CalendarIcon from '@/components/icons/CalendarIcon.vue';
import CheckStatusIcon from '@/components/icons/CheckStatusIcon.vue';
import ObserveIcon from '@/components/icons/ObserveIcon.vue';
import PriorityIcon from '@/components/icons/PriorityIcon.vue';
import PrioritySingleIcon from '@/components/icons/PrioritySingleIcon.vue';
import ShareIcon from '@/components/icons/ShareIcon.vue';
import TagIcon from '@/components/icons/TagIcon.vue';
import UserIcon from '@/components/icons/UserIcon.vue';
import { EditorTipTap } from '@/modules/editor';
import { toast } from '@/modules/toast';
import { useUserStore } from '@/stores/user-store';
import { getUserName } from '@/utils/helpers';
import { checkPermissionByWs } from '@/utils/permissions';
import { formatDateTime } from '@/utils/time';

import { useCreateIssue } from '../../composables/useCreateIssue';
import { useCreateIssueOptions } from '../../composables/useCreateIssueOptions';
import { useCreateIssueProjects } from '../../composables/useCreateIssueProjects';
import { issueCreatedEvent } from '../../model/issue-list.events';
import type { ProjectIssueListScope } from '../../model/issue-list.types';
import CreateIssueParentSelect from './CreateIssueParentSelect.vue';
import CreateIssueTagSelect from './CreateIssueTagSelect.vue';
import IssueCreationAttachments from './IssueCreationAttachments.vue';
import IssueCreationField from './IssueCreationField.vue';
import IssueCreationLinks from './IssueCreationLinks.vue';

const props = defineProps<{ workspaceSlug: string; initialProject?: string }>();
const emit = defineEmits<{ close: [] }>();

const TargetDatePicker = defineAsyncComponent(
  () => import('../issue-table/TargetDatePicker.vue'),
);

const { t } = useI18n();
const userStore = useUserStore();
const { emit: announceIssueCreated } = useEventBus(issueCreatedEvent);
const workspaceRole = userStore.workspaceRoleName;
const canCreateInWorkspace = checkPermissionByWs(workspaceRole, 'create-issue');
const canChangeSprint = checkPermissionByWs(workspaceRole, 'change-sprint');
const canCreateTag = checkPermissionByWs(workspaceRole, 'create-tag');

const {
  projects,
  selectedProjectId,
  isLoadingProjects,
  projectLoadFailed,
  loadProjects,
  getProjectRole,
} = useCreateIssueProjects(
  props.workspaceSlug,
  props.initialProject,
  canCreateInWorkspace,
);

const form = reactive({
  name: '',
  descriptionHtml: '',
  statusId: null as string | null,
  priority: null as string | null,
  assigneeIds: [] as string[],
  watcherIds: [] as string[],
  labelIds: [] as string[],
  targetDate: null as string | null,
  parentId: null as string | null,
  draft: false,
  links: [] as DtoIssueLinkLight[],
  attachments: [] as File[],
  sprintIds: [] as string[],
});
const selectedTemplateId = ref<string | null>(null);

const editor = shallowRef<Editor | null>(null);
const nameField = ref<VTextField>();
const isDateOpen = ref(false);
const isDiscardOpen = ref(false);
const saveFailed = ref(false);

const selectedProject = computed(() =>
  projects.value.find(({ id }) => id === selectedProjectId.value),
);
const projectItems = computed(() =>
  projects.value.map(({ id, identifier, name }) => ({
    value: id,
    title:
      identifier && name ? `${identifier} (${name})` : identifier || name || id,
  })),
);
const scope = computed<ProjectIssueListScope | undefined>(() => {
  const projectId = selectedProject.value?.id;
  return projectId
    ? { type: 'project', workspaceSlug: props.workspaceSlug, projectId }
    : undefined;
});
const {
  statuses,
  members,
  sprints,
  templates,
  isLoading,
  searchMentionMembers,
} = useCreateIssueOptions(scope, canChangeSprint);
const { createdIssueId, isSaving, save } = useCreateIssue();

const formLocked = computed(() => isSaving.value || !!createdIssueId.value);
const parentAuthorId = computed(() => {
  const project = selectedProject.value;
  return project && getProjectRole(project) === 15
    ? undefined
    : userStore.user?.id;
});

const priorityItems = computed(() =>
  (['low', 'medium', 'high', 'urgent'] as const).map((value) => ({
    title: t(`issues.create.priorities.${value}`),
    value,
  })),
);
const statusItems = computed(() =>
  statuses.value.flatMap(({ id, name, color }) =>
    id ? [{ value: id, title: name ?? id, color }] : [],
  ),
);
const defaultStatusId = computed(
  () =>
    statuses.value.find((status) => status.default && status.id)?.id ??
    statusItems.value[0]?.value ??
    null,
);

const memberItem = (member: DtoProjectMemberLight) => {
  const user = member.member;
  const value = member.member_id ?? user?.id;
  if (!value) return [];
  const title = user
    ? getUserName(user) || user.username || user.email || value
    : value;
  return [{ value, title }];
};
const activeMembers = computed(() =>
  members.value.filter((member) => member.member?.is_active),
);
const memberItems = computed(() => activeMembers.value.flatMap(memberItem));
const defaultAssigneeItems = computed(() =>
  (selectedProject.value?.default_assignees_details ?? []).flatMap(memberItem),
);
const defaultAssigneeIds = computed(() => [
  ...new Set([
    ...(selectedProject.value?.default_assignees ?? []),
    ...defaultAssigneeItems.value.map(({ value }) => value),
  ]),
]);
const assigneeItems = computed(() => {
  const assignable = activeMembers.value
    .filter((member) => (member.role ?? 0) > 5)
    .flatMap(memberItem);
  return [
    ...new Map(
      [...defaultAssigneeItems.value, ...assignable].map((item) => [
        item.value,
        item,
      ]),
    ).values(),
  ];
});

watch(
  selectedProject,
  () => {
    form.statusId = null;
    form.assigneeIds = [...defaultAssigneeIds.value];
    form.watcherIds = [];
    form.labelIds = [];
    form.parentId = null;
    selectedTemplateId.value = null;
  },
  { flush: 'sync' },
);

watch(statuses, () => {
  form.statusId = defaultStatusId.value;
});

const validateName = (value: string | null) =>
  !!value?.trim() || t('issues.create.nameRequired');

const applyTemplate = (id: string | null) => {
  selectedTemplateId.value = id;
  const template = templates.value.find((item) => item.id === id);
  form.descriptionHtml = template?.template ?? '';
};

const setTargetDate = (value: string | null) => {
  form.targetDate = value;
  isDateOpen.value = false;
};

const hasEdits = computed(
  () =>
    !!form.name.trim() ||
    (editor.value ? !editor.value.isEmpty : !!form.descriptionHtml) ||
    form.priority !== null ||
    form.targetDate !== null ||
    form.parentId !== null ||
    form.statusId !== defaultStatusId.value ||
    form.draft ||
    form.watcherIds.length > 0 ||
    form.labelIds.length > 0 ||
    form.sprintIds.length > 0 ||
    form.links.length > 0 ||
    form.attachments.length > 0 ||
    form.assigneeIds.length !== defaultAssigneeIds.value.length ||
    form.assigneeIds.some((id) => !defaultAssigneeIds.value.includes(id)),
);

const closeAfterCreation = () => {
  if (scope.value) announceIssueCreated(scope.value);
  emit('close');
};

const requestClose = () => {
  if (isSaving.value) return;
  if (createdIssueId.value) closeAfterCreation();
  else if (hasEdits.value) isDiscardOpen.value = true;
  else emit('close');
};

const submit = async (validation: SubmitEventPromise) => {
  const { valid } = await validation;
  const project = scope.value;
  if (!project || isSaving.value || isLoading.value) return;
  if (!valid) {
    nameField.value?.focus();
    return;
  }

  saveFailed.value = false;
  try {
    const result = await save(
      project,
      {
        name: form.name.trim(),
        description_html: form.descriptionHtml,
        // The SDK models these fields differently from the create endpoint's JSON.
        description_json: editor.value?.getJSON() as any,
        description_type: 1,
        state: form.statusId ?? '',
        priority: form.priority,
        assignees_list: form.assigneeIds,
        watchers_list: form.watcherIds,
        labels_list: form.labelIds,
        target_date: form.targetDate,
        parent: form.parentId as any,
        draft: form.draft,
        issue_link: form.links,
      },
      form.attachments,
      canChangeSprint ? form.sprintIds : [],
    );

    if (result?.complete) {
      toast.success(
        t(form.draft ? 'issues.create.draftSaved' : 'issues.create.created'),
      );
      closeAfterCreation();
    }
  } catch {
    saveFailed.value = true;
  }
};
</script>

<style scoped>
.issue-creation-card {
  min-height: 0;
  overflow: hidden;
}

.issue-creation-form {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
}

.issue-creation-body {
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
}

.issue-creation-body::-webkit-scrollbar {
  display: none;
}

.issue-creation-heading {
  display: grid;
  grid-template-columns: 100px repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 8px;
  padding-block-start: 16px;
  margin-bottom: 24px;
}

.issue-creation-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 20px;
}

.issue-creation-tags--wide {
  grid-column: 1 / -1;
}

@media (max-width: 720px) {
  .issue-creation-heading {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .issue-creation-fields {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
