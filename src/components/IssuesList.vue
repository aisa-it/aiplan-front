<template>
  <div class="q-pa-none fit full-height relative">
    <q-card class="single-list relative" flat dense>
      <q-card-section
        class="row issue-list__header"
        :style="'padding: 12px 16px'"
      >
        <IssuesListTitle />
        <q-space />

        <FiltersList
          :projectId="route.params.project"
          :columns="allColumns.filter((col) => !col.exclude)"
          @update="refresh()"
        />
      </q-card-section>
      <q-separator />

      <div class="relative">
        <div v-show="viewProps.props?.issueView === 'list'">
          <div
            v-if="
              !loading &&
              !!route.params.project &&
              viewProps.props?.filters?.group_by !== 'None'
            "
          >
            <div
              v-if="viewProps.props?.filters?.group_by !== 'Priority'"
              :key="viewProps.props?.filters?.group_by"
            >
              <div
                v-for="(property, index) in sortedProjectGrouped"
                :key="
                  isPropertyHasMember(viewProps.props?.filters?.group_by)
                    ? property.id
                    : index
                "
              >
                <IssuesListSingleState
                  :id="
                    isPropertyHasMember(viewProps.props?.filters?.group_by)
                      ? property.member?.id
                      : property?.id
                  "
                  :key="
                    isPropertyHasMember(viewProps.props?.filters?.group_by)
                      ? property.member?.email
                      : property?.name
                  "
                  :member="
                    isPropertyHasMember(viewProps.props?.filters?.group_by)
                      ? property?.member
                      : null
                  "
                  :group-by="viewProps.props?.filters?.group_by"
                  :stateOrLabelInfo="property"
                  :projectid="route.params.project"
                  :columns="columns"
                  :show-empty-group="viewProps.props.showEmptyGroups"
                  @globalRefresh="refresh()"
                />
              </div>

              <IssuesListSingleState
                v-if="viewProps.props?.filters?.group_by !== 'State'"
                :id="''"
                :group-by="viewProps.props?.filters?.group_by"
                :stateOrLabelInfo="undefined"
                :projectid="route.params.project"
                :columns="columns"
                :show-empty-group="viewProps.props?.showEmptyGroups"
              />
            </div>

            <div v-else>
              <div
                v-for="priority in ['urgent', 'high', 'medium', 'low', '']"
                :key="priority"
              >
                <IssuesListSingleState
                  :id="priority"
                  :key="priority"
                  :group-by="viewProps.props.filters?.group_by"
                  :stateOrLabelInfo="{
                    name:
                      translatePrioritets(priority).charAt(0).toUpperCase() +
                      translatePrioritets(priority).slice(1),
                    color: '##6692ff',
                  }"
                  :projectid="route.params.project"
                  :columns="columns"
                  :show-empty-group="viewProps.props.showEmptyGroups"
                />
              </div>
            </div>
          </div>

          <div
            v-if="
              !loading &&
              !route.params.project &&
              viewProps.props?.filters?.group_by === 'Workspace'
            "
          >
            <div v-for="workspace in userWorkspaces" :key="workspace.id">
              <IssuesListSingleState
                v-if="
                  !!viewProps.props?.filters.workspaces &&
                  (viewProps.props?.filters.workspaces.length == 0 ||
                    viewProps.props?.filters.workspaces.some(
                      (w) => w == workspace.id,
                    ))
                "
                :id="workspace.id"
                :key="workspace.slug"
                :group-by="viewProps.props?.filters?.group_by"
                :stateOrLabelInfo="{ name: workspace?.name, color: '#6692ff' }"
                :columns="columns"
                :show-empty-group="viewProps.props?.showEmptyGroups"
              />
            </div>
          </div>

          <div
            v-if="
              !loading &&
              !route.params.project &&
              viewProps.props?.filters?.group_by === 'Project'
            "
          >
            <div
              v-for="project in [
                'assigned_to_me',
                'watched_by_me',
                'authored_by_me',
              ].includes(viewProps.props?.activeTab)
                ? workspaceProjects
                : userProjects"
              :key="project.id"
            >
              <IssuesListSingleState
                v-if="
                  (!!viewProps.props.filters?.projects &&
                    (viewProps.props.filters?.projects.length == 0 ||
                      viewProps.props.filters?.projects.some(
                        (p) => p == project.id,
                      ))) ||
                  !!!viewProps.props.filters?.projects
                "
                :id="project.id"
                :key="project.id"
                :group-by="viewProps.props?.filters?.group_by"
                :stateOrLabelInfo="{ name: project?.name, color: '#6692ff' }"
                :columns="columns"
                :show-empty-group="viewProps.props?.showEmptyGroups"
              />
            </div>
          </div>

          <div
            v-if="
              viewProps.props?.filters?.group_by === 'None' &&
              viewProps.projectView
            "
          >
            <q-table
              flat
              :rows="rows"
              :columns="columns"
              class="my-sticky-column-table table-bottom-reverse"
              row-key="name"
              :loading="loading"
              loading-label="Загружается..."
              :rows-per-page-options="[10, 25, 50, 100]"
              v-model:pagination="pagination"
              @request="onRequest"
            >
              <template #pagination>
                <PaginationDefault
                  v-model:selected-page="pagination.page"
                  :rows-number="pagination.rowsNumber"
                  :rows-per-page="pagination.rowsPerPage"
                  @update:selectedPage="onRequest({ pagination })"
                />
              </template>

              <template v-slot:body-cell-sequence_id="props">
                <q-td
                  :props="props"
                  :style="`font-size: 12px; padding: 7px 4px; cursor: pointer;`"
                  @click="
                    () =>
                      singleIssueStore.openIssue(
                        props.row.sequence_id,
                        user.theme?.open_in_new ? '_blank' : '_self',
                      )
                  "
                >
                  {{ props.value[0] }}-{{ props.value[1] }}
                  <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
                </q-td>
              </template>

              <template v-slot:body-cell-name="props">
                <q-td
                  :props="props"
                  :style="'padding: 7px 0;'"
                  class="magic-row"
                  @contextmenu.prevent
                >
                  <div class="row justify-between">
                    <q-btn
                      :to="`/${route.params.workspace}/projects/${route.params.project}/issues/${props.row.sequence_id}`"
                      :target="user.theme?.open_in_new ? '_blank' : '_self'"
                      no-caps
                      flat
                      class="issues-list__task-name"
                      :style="`padding: 0 4px; width: ${
                        !!props.row.parent &&
                        !!props.row?.parent_detail?.sequence_id
                          ? 'calc(100% - 80px)'
                          : '100%'
                      }`"
                    >
                      <span
                        :style="`text-align: left;`"
                        class="abbriviated-text"
                      >
                        {{ props.value }}
                      </span>
                      <HintTooltip> {{ props.value }}</HintTooltip>
                      <q-badge
                        v-if="props.row.draft"
                        floating
                        color="orange"
                        style="left: 2px; right: auto; top: -6px"
                        >Черновик</q-badge
                      >
                    </q-btn>

                    <ParentIssueChip
                      v-if="
                        !!props.row.parent &&
                        !!props.row?.parent_detail?.sequence_id
                      "
                      :row="props.row"
                      :target="user.theme?.open_in_new ? '_blank' : '_self'"
                    />

                    <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                  </div>
                </q-td>
              </template>

              <template v-slot:body-cell-priority="props">
                <q-td :props="props" style="min-width: 225px">
                  <div>
                    <SelectPriority
                      :workspace-slug="props.row.workspace_detail.slug"
                      :projectid="props.row.project"
                      :issueid="props.row.id"
                      :priority="props.value"
                      :issue="props.row"
                      :is-disabled="
                        !rolesStore.hasPermissionByIssue(
                          props.row,
                          project,
                          'change-issue-primary',
                        )
                      "
                      @refresh="refresh()"
                    ></SelectPriority>
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-state="props">
                <q-td :props="props">
                  <div class="flex">
                    <SelectStatus
                      :projectid="props.row.project"
                      :issueid="props.row.id"
                      :status="props.row.state_detail"
                      :issue="props.row"
                      :isDisabled="
                        !rolesStore.hasPermissionByIssue(
                          props.row,
                          project,
                          'change-issue-status',
                        )
                      "
                      :states-from-cache="
                        statesStore.statesCache[props.row.project]
                      "
                      @set-status="
                        (val: any) => (
                          (props.row.state_detail = val), refresh()
                        )
                      "
                    />
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-target_date="props">
                <q-td :props="props">
                  <div>
                    <SelectDate
                      :workspace-id="props.row.workspace_detail.slug"
                      :projectid="props.row.project"
                      :issueid="props.row.id"
                      :date="props.row.target_date"
                      :issue="props.row"
                      :is-disabled="
                        !rolesStore.hasPermissionByIssue(
                          props.row,
                          project,
                          'change-issue-primary',
                        )
                      "
                      @refresh="refresh()"
                    ></SelectDate>
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-created_at="props">
                <q-td :props="props">
                  <div :style="'width: 150px; max-width: 150px'" class="body-2">
                    {{ props.value }}
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-updated_at="props">
                <q-td :props="props">
                  <div :style="'width: 150px; max-width: 150px'" class="body-2">
                    {{ props.value }}
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-labels="props">
                <q-td :props="props">
                  <div class="row no-wrap" style="gap: 4px">
                    <q-badge
                      v-for="l in props.value"
                      :key="l?.name"
                      class="q-ml-xs overflow-hidden"
                      :style="[
                        'background-color: ' + l.color,
                        'max-width: 200px',
                      ]"
                    >
                      <span class="abbriviated-text">
                        {{ l?.name }}
                        <HintTooltip>
                          {{ l?.name }}
                        </HintTooltip>
                      </span>
                    </q-badge>
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-author="props">
                <q-td :props="props">
                  <AvatarImage
                    :key="props.value?.name"
                    :tooltip="aiplan.UserName(props.value).join(' ')"
                    :text="
                      [
                        avatarText(props.value)[0]?.at(0),
                        avatarText(props.value)[1]?.at(0),
                      ].join(' ')
                    "
                    :image="props.value.avatar_id"
                    :member="props.value"
                    @click.stop="
                      $router.push({
                        path: `/${currentWorkspaceSlug}/user-activities/${props.row.author_detail.id}`,
                      })
                    "
                  ></AvatarImage>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-assignees="props">
                <q-td :props="props" style="position: relative">
                  <AvatarImage
                    v-for="(l, n) in props.value"
                    :style="{ zIndex: props.value.length - n + 2 }"
                    class="overlapping"
                    :key="l?.name"
                    :tooltip="avatarText(l).join(' ')"
                    :text="
                      [avatarText(l)[0]?.at(0), avatarText(l)[1]?.at(0)].join(
                        ' ',
                      )
                    "
                    :image="l.avatar_id"
                    :member="l"
                    @click.stop="
                      $router.push({
                        path: `/${currentWorkspaceSlug}/user-activities/${props.row.assignee_details[n]?.id}`,
                      })
                    "
                  >
                  </AvatarImage>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-sub_issues_count="props">
                <q-td :props="props">
                  <div class="table-chip-wrap">
                    <QuantityChip :type="'sub-issues'" :value="props.value" />
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-linked_issues_count="props">
                <q-td :props="props">
                  <div class="table-chip-wrap">
                    <QuantityChip
                      :type="'linked_issues_count'"
                      :value="props.value"
                    />
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-link_count="props">
                <q-td :props="props">
                  <div class="table-chip-wrap">
                    <QuantityChip :type="'links'" :value="props.value" />
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:body-cell-attachment_count="props">
                <q-td :props="props">
                  <div class="table-chip-wrap">
                    <QuantityChip :type="'attachments'" :value="props.value" />
                  </div>
                  <IssueContextMenu
                      :row="props.row"
                      :rowId="props.rowIndex"
                      @refresh="refresh"
                    />
                </q-td>
              </template>

              <template v-slot:no-data>
                <div
                  class="column flex-center"
                  style="width: 100%; height: 100%"
                >
                  <DefaultLoader v-if="loading" />

                  <div
                    v-if="!loading && !rows.length"
                    class="column flex-center"
                  >
                    <DocumentIcon :width="56" :height="56" />
                    <h6>Нет задач</h6>
                  </div>
                </div>
              </template>
            </q-table>
          </div>
        </div>

        <IssuesBoardView
          v-if="route.params.project && viewProps.props?.issueView === 'kanban'"
          :issues="rows"
          :projectStates="sortedProjectGrouped"
          :projectLabels="projectIssuesLabels"
          :projectMembers="sortedProjectMembers"
          @useFullRefresh="() => refresh()"
          :style="'position: relative; width: 100%;'"
        />
      </div>
      <!-- <div v-show="loading">
        <q-linear-progress indeterminate rounded />
      </div> -->
    </q-card>
  </div>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useMeta } from 'quasar';
import { ref, watch, computed, onMounted, toRaw } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { useSingleIssueStore } from 'stores/single-issue-store';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDate, formatDateTime } from 'src/utils/time';
import issuesComposer from 'src/utils/issues-composer';
import { isPropertyHasMember } from 'src/utils/helpers';
import { translatePrioritets } from 'src/utils/translator';
import { DEF_ROWS_PER_PAGE } from 'src/constants/constants';

// components
import SelectDate from './SelectDate.vue';
import AvatarImage from './AvatarImage.vue';
import FiltersList from './FiltersList.vue';
import SelectStatus from './SelectStatus.vue';
import SelectPriority from './SelectPriority.vue';
import IssuesBoardView from './IssuesBoardView.vue';
import IssuesListTitle from './IssuesListTitle.vue';
import QuantityChip from 'src/components/QuantityChip.vue';
import IssuesListSingleState from './IssuesListSingleState.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import ParentIssueChip from 'src/components/ParentIssueChip.vue';
import PaginationDefault from './pagination/PaginationDefault.vue';
import { appVisibleTimeout } from 'src/utils/visibilityApp';
import IssueContextMenu from 'src/shared/components/IssueContextMenu.vue';

defineProps<{
  projectId?: string | null;
  title?: string;
}>();

// core
const route = useRoute();

// stores
const api = useAiplanStore();
const userStore = useUserStore();
const rolesStore = useRolesStore();
const issuesStore = useIssuesStore();
const statesStore = useStatesStore();
const viewProps = useViewPropsStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();

// store to ref
const { user, userWorkspaces, userProjects } = storeToRefs(userStore);
const { project, currentProjectID, isLoadProjectInfo } =
  storeToRefs(projectStore);
const { workspaceProjects, currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { refreshIssues } = storeToRefs(issuesStore);
const avatarText = aiplan.UserName;
// issues vars
const rows = ref([]);
const pagination = ref({
  sortBy: viewProps.props.filters?.order_by,
  descending: viewProps.props.filters?.orderDesc,
  page: 1,
  rowsPerPage: viewProps.props?.page_size ?? DEF_ROWS_PER_PAGE,
  rowsNumber: 0,
});

// grouped by vars
const projectMembers = ref<any[]>([]);
const projectIssuesLabels = ref();
const projectGroupedProperty = ref<any[]>([]);

// vars
const loading = ref(true);
// metadata
const metadata = ref({ title: 'Загрузка...' });
useMeta(() => {
  return { title: metadata.value.title };
});

const columns = computed(() =>
  allColumns.filter((col) => {
    if (
      !viewProps.props?.columns_to_show ||
      viewProps.props.columns_to_show.length == 0 ||
      col?.name === 'sequence_id'
    )
      return true;
    return viewProps.props.columns_to_show.some((c) => c === col?.name);
  }),
);

const sortedProjectGrouped = computed(() =>
  isPropertyHasMember(viewProps.props?.filters?.group_by)
    ? toRaw(projectGroupedProperty.value)
        ?.slice()
        ?.sort((a, b) =>
          a?.member_id === user.value?.id
            ? -1
            : b?.member_id === user.value?.id
            ? 1
            : 0,
        )
    : projectGroupedProperty.value,
);

const sortedProjectMembers = computed(() =>
  isPropertyHasMember(viewProps.props.filters.group_by)
    ? toRaw(projectMembers.value)
        ?.slice()
        ?.sort((a, b) =>
          a?.member_id === user.value?.id
            ? -1
            : b?.member_id === user.value?.id
            ? 1
            : 0,
        )
    : projectMembers.value,
);
// pagination request
async function onRequest(p: any) {
  if (
    currentProjectID.value &&
    viewProps.props?.filters.group_by !== 'None' &&
    viewProps.props?.filters.group_by !== 'Priority'
  ) {
    return;
  }

  if (!route.params.workspace || !route.params.project) return;

  rows.value = [];
  loading.value = true;

  const { sortBy, descending, rowsPerPage } = p.pagination;

  if (
    sortBy !== viewProps.props?.filters.order_by ||
    descending !== viewProps.props?.filters.orderDesc ||
    viewProps.props?.page_size !== rowsPerPage
  ) {
    viewProps.props.page_size = rowsPerPage;
    viewProps.props.filters.order_by = sortBy;
    viewProps.props.filters.orderDesc = descending;
    viewProps.saveProps();
  }

  let requestData = {
    pagination: p.pagination,
    personalIssuesTemplate:
      !currentProjectID.value && viewProps.props.activeTab,
    workspaces:
      viewProps.props.activeTab === 'all'
        ? viewProps.props.filters.workspaces
        : [],
    projects: viewProps.props.filters.projects,
  };

  if (viewProps.projectView) {
    requestData.urlData = {
      workspaceSlug: route.params.workspace,
      projectID: route.params.project,
    };
  }
  pagination.value = requestData.pagination;

  if (requestData.personalIssuesTemplate === 'all') {
    userStore.userProjects.forEach(async (project) => {
      if (statesStore.statesCache[project.id] !== undefined) {
        loading.value = false;
        return;
      } else {
        statesStore
          .getStatesByProject(project.workspace_detail?.slug, project.id)
          .then(({ data }) => (statesStore.statesCache[project.id] = data));
      }
    });
  }
  issuesComposer(requestData).then((res) => {
    rows.value = res?.rows ?? [];
    pagination.value = { ...pagination.value, ...res?.pagination };
    loading.value = false;
  });
}

// groups
async function statesGroups() {
  loading.value = true;
  if (route.params.project) {
    await statesStore
      .getStatesList(
        route.params.project as string,
        viewProps.props.showOnlyActive,
      )
      .then((statesList) => {
        if (viewProps.props.filters.states.length > 0) {
          projectGroupedProperty.value = statesList.filter((state) =>
            viewProps.props.filters.states.some((s) => s === state.id),
          );
        } else {
          projectGroupedProperty.value = statesList;
        }
      });
  }
  loading.value = false;
}

async function labelsGroups() {
  loading.value = true;
  if (currentProjectID.value) {
    projectIssuesLabels.value = [];
    projectIssuesLabels.value = await api.getProjectLabels();

    projectGroupedProperty.value = [];
    projectGroupedProperty.value = await api.getProjectLabels();
  }
  loading.value = false;
}

async function membersGroups() {
  projectGroupedProperty.value = [];
  loading.value = true;
  await api
    .getProjectMembers()
    .then((res) => {
      projectMembers.value = res.result;
      projectGroupedProperty.value = res.result;
    })
    .finally(() => {
      loading.value = false;
    });
}

// main refresh function
const refresh = async () => {
  if (isLoadProjectInfo.value) return;

  rows.value = [];
  pagination.value.sortBy = viewProps.props?.filters.order_by;
  pagination.value.descending = viewProps.props?.filters.orderDesc;

  metadata.value.title = !!currentProjectID.value
    ? `Проект ${project.value?.name ?? ''}`
    : 'Мои задачи';

  if (!currentProjectID.value) {
    await onRequest({ pagination: pagination.value });
  } else {
    await onFiltersGroupBy();
  }
};

const refreshAfterVisible = async () => {
  loading.value = true;
  await refresh();
};

const onFiltersGroupBy = async () => {
  if (currentProjectID.value) {
    switch (viewProps.props?.filters.group_by) {
      case 'None':
      case 'Priority':  
        onRequest({ pagination: pagination.value });
        break;

      case 'State':
        await statesGroups();
        break;

      case 'Label':
        await labelsGroups();
        break;

      case 'Created by':
      case 'Assignee to':
      case 'Watchers':
        await membersGroups();
        break;
    }
  }
};

onMounted(async () => {
  appVisibleTimeout(() => refreshAfterVisible());
});

watch(
  () => isLoadProjectInfo.value,
  async () => {
    if (!isLoadProjectInfo.value) {
      await refresh();
    }
  },
);

watch(
  () => refreshIssues.value,
  async () => {
    if (refreshIssues.value) await refresh();
    refreshIssues.value = false;
  },
);

const allColumns = [
  {
    style: 'width: 10px',
    name: 'sequence_id',
    label: 'ID',
    align: 'left',
    exclude: true,
    field: (row: any) => {
      // `${row.project_detail.identifier}-${row.sequence_id}`
      return [row.project_detail.identifier, row.sequence_id];
    },
    sortable: true,
  },
  {
    name: 'name',
    align: 'left',
    label: 'Название',
    field: (row: any) => {
      return `${row?.name}`;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'priority',
    align: 'left',
    label: 'Приоритет',
    field: (row: any) => {
      return row.priority || 'Нет';
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'state',
    align: 'left',
    label: 'Статус',
    field: (row: any) => {
      return row.state;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'target_date',
    align: 'left',
    label: 'Срок исполнения',
    field: (row: any) => {
      return row.target_date ? formatDate(row.target_date) : '-';
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'created_at',
    align: 'left',
    label: 'Дата создания',
    field: (row: any) => {
      return formatDateTime(row.created_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'updated_at',
    align: 'left',
    label: 'Последнее изменение',
    field: (row: any) => {
      return formatDateTime(row.updated_at);
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'author',
    align: 'left',
    label: 'Автор',
    field: (row: any) => {
      return row.author_detail;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'assignees',
    align: 'center',
    label: 'Исполнитель',
    field: (row: any) => {
      return row.assignee_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'labels',
    align: 'left',
    label: 'Теги',
    field: (row: any) => {
      return row.label_details;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'sub_issues_count',
    align: 'center',
    label: 'Подзадачи',
    field: (row: any) => {
      return row.sub_issues_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'linked_issues_count',
    align: 'center',
    label: 'Связи',
    field: (row: any) => {
      return row.linked_issues_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'link_count',
    align: 'center',
    label: 'Ссылки',
    field: (row: any) => {
      return row.link_count;
    },
    sortable: true,
  },
  {
    style: 'width: 10px',
    name: 'attachment_count',
    align: 'center',
    label: 'Вложения',
    field: (row: any) => {
      return row.attachment_count;
    },
    sortable: true,
  },
];
</script>

<style lang="sass">
.board-view
  position: absolute
  top: 0
  left: 0
  width: 100%
  height: calc( 100vh - 100px )


.my-sticky-column-table
  thead tr:first-child th:first-child
    background: $bg-surface
    // border-right: 2px solid $color-shadow

  td:first-child
    background: $bg-surface
    border-right: 2px solid $color-shadow

  th:first-child,
  td:first-child
    position: sticky
    left: 0
    z-index: 100



.single-list
  position: relative
  border: none

.q-table-sub-title
  font-weight: 600
  font-size: .875rem
  line-height: 1.5rem

.q-table-sub-icon
  margin-right: 0.75rem
  border-radius: 100%
  aspect-ratio: 1/1

.selector-option
  width: 150px
  font-size: .75rem
  line-height: 1rem
  padding: 0
  color: $text-secondary-color

.disclosure-button
  padding: 0.75rem
  border: none
  outline: none
  background: transparent

.issue-list__header
  display: flex
  justify-content: space-between
  align-items: center

.search-wrapper
  padding-top: 5px
  display: flex
  justify-content: space-between

.issues-list__extended-search-wrapper
  display: flex
  align-items: center

.table-chip-wrap
  display: flex
  justify-content: center
  padding: 0 22px 0 0
  .base-chip
    margin: 0
</style>

<style scoped lang="scss">
:deep(.q-table__bottom--nodata) {
  height: calc(100vh - 200px);
}

:deep(.q-linear-progress) {
  color: $primary !important;
  border: none;
  height: 4px;
}
</style>
