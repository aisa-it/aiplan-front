<template>
  <Disclosure
    v-if="
      (!!rows && rows.length > 0) ||
      (showEmptyGroup && member) ||
      (['State', 'Label', 'Priority'].includes(groupBy) && showEmptyGroup) ||
      (viewProps.isGroupHide(id) && pagination.rowsNumber > 0)
    "
    as="div"
    :default-open="!viewProps.isGroupHide(id)"
    v-slot="{ open }"
  >
    <div
      v-if="
        groupBy === 'State' || groupBy === 'Label' || groupBy === 'Priority'
      "
    >
      <DisclosureButton
        class="w-96 flex items-center justify-between q-pa-md board-card-header elevator-1 q-mb-md border-light min-board-height"
        :class="rows.length ? 'cursor-pointer' : 'cursor-inherit'"
        @click="onDisclosure(open)"
      >
        <div class="flex no-wrap full-width justify-between flex-center">
          <IssuesColorCountTitle
            :priority="id"
            :name="name"
            :color="
              groupBy !== 'Priority' ? stateOrLabelInfo?.color : undefined
            "
            :count="pagination.rowsNumber"
            :placeholder="
              groupBy == 'Priority' ? 'Без приоритета' : 'Без тегов'
            "
          />

          <ArrowUp
            v-if="rows.length"
            style="max-width: 24px; min-width: 24px"
            :class="{ 'rotate-180': !open, 'arrow-up': true }"
          />
        </div>
        <q-space />

        <div
          v-if="Math.ceil(pagination.rowsNumber / 10) > 1 && open"
          class="bg-brand-base board-card-header q-px-sm q-mt-md w-96"
          :style="'display: flex; align-items: center; justify-content: center; z-index: 100'"
          @click.stop
        >
          <PaginationDefault
            v-model:selected-page="selectedPage"
            :rows-number="pagination.rowsNumber"
            :max-pages="3"
            class="issues-single-board__pagination"
          />
        </div>
      </DisclosureButton>
    </div>

    <div
      v-else-if="
        groupBy === 'Created by' ||
        groupBy === 'Assignee to' ||
        groupBy === 'Watchers'
      "
    >
      <DisclosureButton
        class="w-96 flex items-center justify-between q-pa-md board-card-header elevator-1 q-mb-md border-light min-board-height"
        :class="rows.length ? 'cursor-pointer' : 'cursor-inherit'"
        @click="onDisclosure(open)"
        :style="'min-width: 320px'"
      >
        <div class="flex full-w no-wrap">
          <IssuesUserTitle
            :user="member"
            :count="pagination.rowsNumber"
            :placeholder="
              groupBy == 'Assignee to' ? 'Без назначений' : 'Без наблюдателей'
            "
          />
          <ArrowUp
            v-if="rows.length"
            :class="{ 'rotate-180': !open, 'arrow-up': true }"
          />
        </div>

        <div
          v-if="Math.ceil(pagination.rowsNumber / 10) > 1 && open"
          class="bg-brand-base board-card-header q-px-sm q-mt-md w-96"
          :style="'display: flex; align-items: center; justify-content: center;'"
          @click.stop
        >
          <PaginationDefault
            v-model:selected-page="selectedPage"
            :rows-number="pagination.rowsNumber"
            :max-pages="3"
            class="issues-single-board__pagination"
          />
        </div>
      </DisclosureButton>
    </div>

    <div v-else>
      <DisclosureButton
        class="w-96 flex items-center justify-between q-pa-md board-card-header elevator-1 q-mb-md border-light min-board-height"
        :class="rows.length ? 'cursor-pointer' : 'cursor-inherit'"
      >
        <div
          class="flex no-wrap full-w justify-between flex-center q-table-sub-title"
          @click="onDisclosure(open)"
        >
          {{ 'Все задачи' }}
          <ArrowUp
            v-if="rows.length"
            :class="{ 'rotate-180': !open, 'arrow-up': true }"
          />
        </div>

        <div
          v-if="Math.ceil(pagination.rowsNumber / 10) > 1 && open"
          class="bg-brand-base board-card-header q-px-sm q-mt-md w-96"
          :style="'display: flex; align-items: center; justify-content: center;'"
          @click.stop
        >
          <PaginationDefault
            v-model:selected-page="selectedPage"
            :rows-number="pagination.rowsNumber"
            :max-pages="3"
            class="issues-single-board__pagination"
          />
        </div>
      </DisclosureButton>
    </div>

    <DisclosurePanel
      v-if="rows.length > 0"
      class="w-96 px-4 pb-2 pt-4 text-sm text-gray-500 single-board"
      ref="disclosure"
    >
      <div
        :style="'height: 98%; position:relative;'"
        class="issues-single-board__card hide-scrollbar"
      >
        <div
          :style="'max-height:100%; overflow:auto;'"
          class="sigle-group-issue-board"
        >
          <div
            v-for="(row, i) in rows"
            :key="i"
            class="bg-brand-base board-card q-mb-md q-pa-sm"
          >
            <div class="row q-my-xs flex-center">
              <q-btn
                class="issue-board-id q-pa-none"
                flat
                :target="user.theme.open_in_new ? '_blank' : '_self'"
                :to="`/${$route.params['workspace']}/projects/${$route.params['project']}/issues/${row.sequence_id}`"
              >
                <span>
                  {{ `${row.project_detail.identifier}-${row.sequence_id}` }}
                </span>
              </q-btn>

              <q-space />
              <span
                class="issue-board-id"
                v-if="columns.includes(allColumns[5])"
              >
                {{ formatDateTime(row.created_at) }}
              </span>
            </div>

            <div class="row" v-if="columns.includes(allColumns[1])">
              <q-btn
                no-caps
                flat
                :target="user.theme.open_in_new ? '_blank' : '_self'"
                :to="`/${$route.params['workspace']}/projects/${$route.params['project']}/issues/${row.sequence_id}`"
                :style="`padding: 0 4px; width: ${
                  !!row.parent && !!row?.parent_detail?.sequence_id
                    ? 'calc(100% - 80px)'
                    : '100%'
                }`"
              >
                <span
                  :style="`text-align: left;`"
                  class="abbriviated-text issue-board-name"
                >
                  {{ row.name }}
                </span>
                <HintTooltip> {{ row.name }}</HintTooltip>
                <q-badge v-if="row.draft" floating color="orange"
                  >Черновик</q-badge
                >
              </q-btn>
              <q-space />
              <ParentIssueChip
                v-if="!!row.parent && !!row?.parent_detail?.sequence_id"
                :row="row"
                :target="user.theme?.open_in_new ? '_blank' : '_self'"
              />
            </div>

            <div
              class="row q-my-xs q-ml-xs items-stretch label-wrapper"
              v-if="columns.includes(allColumns[8])"
            >
              <q-badge
                v-for="l in row.label_details"
                class="overflow-hidden"
                :key="l.name"
                :style="'background-color: ' + l.color"
              >
                <span class="abbriviated-text">{{ l.name }}</span>
              </q-badge>
            </div>

            <div class="row q-my-xs">
              <SelectPriority
                v-if="columns.includes(allColumns[2])"
                class="q-ma-xs half-w-m-sm"
                :workspace-slug="row.workspace_detail.slug"
                :projectid="row.project"
                :issueid="row.id"
                :priority="row.priority ?? 'Нет'"
                :issue="row"
                :is-disabled="
                  !rolesStore.hasPermissionByIssue(
                    row,
                    project,
                    'change-issue-primary',
                  )
                "
                @update:priority="
                  (newV) =>
                    refresh()
                      .then(() => groupsEvents.refresh(newV))
                      .then(() => emitSyncIssue(row.id))
                "
              />
              <SelectDate
                v-if="columns.includes(allColumns[4])"
                class="q-ma-xs half-w-m-sm"
                :workspace-id="row.workspace_detail.slug"
                :projectid="row.project"
                :issueid="row.id"
                :date="row.target_date"
                :issue="row"
                :is-disabled="
                  !rolesStore.hasPermissionByIssue(
                    row,
                    project,
                    'change-issue-primary',
                  )
                "
                @refresh="refresh().then(() => emitSyncIssue(row.id))"
              />
            </div>

            <div class="row" :style="'display: flex; align-items: center;'">
              <div class="q-mx-xs">
                <SelectStatus
                  v-if="columns.includes(allColumns[3])"
                  :projectid="row.project"
                  :issueid="row.id"
                  :status="row.state_detail"
                  :issue="row"
                  :states-from-cache="statesCache[row.project]"
                  :isDisabled="
                    !rolesStore.hasPermissionByIssue(
                      row,
                      project,
                      'change-issue-status',
                    )
                  "
                  @set-status="
                    (val: any) => {
                      row.state_detail = val;
                      refresh()
                        .then(() => groupsEvents.refresh(val.id))
                        .then(() => emitSyncIssue(row.id));
                    }
                  "
                />
              </div>

              <div
                class="q-pa-sm q-gutter-sm relative q-ml-sm q-mr-sm"
                v-if="columns.includes(allColumns[6])"
              >
                <AvatarImage
                  :key="row.author_detail.id"
                  :prefix="'Автор'"
                  :tooltip="avatarText(row.author_detail).join(' ')"
                  :text="
                    [
                      avatarText(row.author_detail)[0]?.at(0),
                      avatarText(row.author_detail)[1]?.at(0),
                    ].join(' ')
                  "
                  :image="row.author_detail.avatar_id"
                  :member="row.author_detail"
                  @click.stop="
                    $router.push({
                      path: `/${currentWorkspaceSlug}/user-activities/${row.author_detail.id}`,
                    })
                  "
                ></AvatarImage>
              </div>

              <div
                v-if="columns.includes(allColumns[7])"
                :style="'position: relative'"
                class="q-ml-sm"
              >
                <AvatarImage
                  :style="{ zIndex: row.assignee_details.length - n }"
                  class="overlapping-kanban"
                  v-for="(l, n) in row.assignee_details"
                  :key="l.name"
                  :tooltip="avatarText(l).join(' ')"
                  :text="
                    [avatarText(l)[0]?.at(0), avatarText(l)[1]?.at(0)].join(' ')
                  "
                  :image="l.avatar_id"
                  :member="l"
                  @click.stop="
                    $router.push({
                      path: `/${currentWorkspaceSlug}/user-activities/${l.id}`,
                    })
                  "
                ></AvatarImage>
              </div>
            </div>

            <div class="row q-my-xs">
              <QuantityChip
                v-if="columns.includes(allColumns[9])"
                :type="'sub-issues'"
                :value="row.sub_issues_count"
              />
              <QuantityChip
                v-if="columns.includes(allColumns[10])"
                :type="'linked_issues_count'"
                :value="row.linked_issues_count"
              />

              <QuantityChip
                v-if="columns.includes(allColumns[11])"
                :type="'links'"
                :value="row.link_count"
              />

              <QuantityChip
                v-if="columns.includes(allColumns[12])"
                :type="'attachments'"
                :value="row.attachment_count"
              />
            </div>

            <IssueContextMenu
                      :row="row"
                      @refresh="refresh"
                    />
          </div>
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  watch,
} from 'vue';
import { useRoute } from 'vue-router';
import { EventBus } from 'quasar';
// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useLoaderStore } from 'src/stores/loader-store';
import { useStatesStore } from 'src/stores/states-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { useGroupsEventsStore } from 'src/stores/groups-events-store';

// helpers
import aiplan from 'src/utils/aiplan';
import { DEFAULT_COLUMNS } from 'src/constants/constants';
import issuesComposer from 'src/utils/issues-composer';
import { formatDateTime } from 'src/utils/time';

// components
import SelectDate from './SelectDate.vue';
import AvatarImage from './AvatarImage.vue';
import SelectStatus from './SelectStatus.vue';
import SelectPriority from './SelectPriority.vue';
import IssuesUserTitle from './IssuesUserTitle.vue';
import IssuesColorCountTitle from './IssuesColorCountTitle.vue';
import QuantityChip from './QuantityChip.vue';
import ParentIssueChip from './ParentIssueChip.vue';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import PaginationDefault from './pagination/PaginationDefault.vue';
import ArrowUp from 'components/icons/ArrowUp.vue';
import IssueContextMenu from 'src/shared/components/IssueContextMenu.vue';

const props = defineProps<{
  allIssues?: any[];
  id: string;
  groupBy: string;
  stateOrLabelInfo?: any;
  member?: any;
  projectid?: string | string[];
  searchValue?: string;
  showEmptyGroup?: boolean;
}>();

// stores
const userStore = useUserStore();
const rolesStore = useRolesStore();
const statesStore = useStatesStore();
const issuesStore = useIssuesStore();
const loaderStore = useLoaderStore();
const viewProps = useViewPropsStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const groupsEvents = useGroupsEventsStore();

// Add bus injection with type
const bus = inject('bus') as EventBus;

// store to refs
const { user } = storeToRefs(userStore);
const { statesCache } = storeToRefs(statesStore);
const { project } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { refreshIssues } = storeToRefs(issuesStore);

// to Refs
const searchText = toRef('');
const rows = toRef(props.allIssues || []);

// vars
const route = useRoute();
const name = ref();
const color = ref();
const loading = ref(false);
const projectIssuesState = ref();
const allColumns = DEFAULT_COLUMNS;

if (props.stateOrLabelInfo !== undefined) {
  projectIssuesState.value = props.stateOrLabelInfo;
  name.value = props.stateOrLabelInfo.name;
  color.value = props.stateOrLabelInfo.color;
}

// pagination values
const selectedPage = ref(1);
const pagination = ref({
  sortBy: viewProps.props.filters.order_by,
  descending: viewProps.props.filters.orderDesc,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const columns = computed(() =>
  allColumns.filter((col) => {
    if (
      !viewProps.props.columns_to_show ||
      viewProps.props.columns_to_show.length == 0
    )
      return true;
    return viewProps.props.columns_to_show.some((c) => c === col.name);
  }),
);

//pagination request
async function onRequest(p: any) {
  loaderStore.startTableLoading();
  const { sortBy, descending } = p.pagination;

  if (
    sortBy != viewProps.props.filters.order_by ||
    descending != viewProps.props.filters.orderDesc
  ) {
    viewProps.props.filters.order_by = sortBy;
    viewProps.props.filters.orderDesc = descending;
    await viewProps.saveProps();
  }

  const requestData = {
    pagination: p.pagination,
    urlData: {
      workspaceSlug: route.params.workspace,
      projectID: route.params.project,
    },
    groupByParams: {
      by: props.groupBy,
      id: props.id,
    },
  };

  pagination.value = requestData.pagination;

  issuesComposer(requestData).then((res) => {
    if (!res) return;
    rows.value = res.rows;
    pagination.value = { ...pagination.value, ...res.pagination };
    loading.value = false;
  });
}

async function onDisclosure(close: boolean) {
  viewProps.setGroupHide(props.id, close);
  viewProps.saveProps();
}

const refresh = async () => {
  if (props.stateOrLabelInfo !== undefined) {
    name.value = props.stateOrLabelInfo.name;
    color.value = props.stateOrLabelInfo.color;
    projectIssuesState.value = props.stateOrLabelInfo;
  }

  onRequest({ pagination: pagination.value });
};

const avatarText = (text: string) => {
  return aiplan.UserName(text);
};

const emitSyncIssue = async (value: string) => {
  if (value) {
    bus.emit('sync-issue-emit', value);
  }
};

const syncIssue = (payload: string) => {
  if (
    ['Assignee to', 'Watchers', 'Label'].includes(
      viewProps.props?.filters?.group_by,
    )
  ) {
    for (let i = 0; i < rows.value.length; i++) {
      if (rows.value[i].id === payload) {
        refresh();
      }
    }
  }
};

onMounted(async () => {
  if (props.stateOrLabelInfo !== undefined) {
    projectIssuesState.value = props.stateOrLabelInfo;
    name.value = props.stateOrLabelInfo.name;
    color.value = props.stateOrLabelInfo.color;
  }

  bus.on('sync-issue-emit', syncIssue);

  groupsEvents.sub(props.id, refresh);
  await refresh();
});

onUnmounted(() => groupsEvents.unSub());

watch(searchText, async () => await refresh());

watch(
  () => props.allIssues,
  () => (rows.value = props.allIssues || []),
);

watch(
  () => selectedPage.value,
  async () => {
    pagination.value.page = selectedPage.value;
    await refresh();
  },
);

watch(
  () => props,
  async () => await refresh(),
  { deep: true },
);

watch(
  () => viewProps.props,
  () => {
    refresh();
  },
  { immediate: true, deep: true },
);

watch(
  () => refreshIssues.value,
  async () => {
    if (refreshIssues.value === true) await refresh();
    refreshIssues.value = false;
  },
);
</script>
<style lang="scss">
.single-board {
  position: relative;
  height: calc(100% - 100px);
  min-width: 320px;
}

.min-board-height {
  min-height: 102px;
}

.board-card {
  border-radius: 16px;
  border: 1px solid $dark-border-color;
}

.board-card-header {
  outline: none;
  background: transparent;
  border-radius: 16px;
  min-width: 320px;
}

.issue-board-id {
  margin-left: 4px;
  font-size: 12px;
  min-height: fit-content;
}

.issue-board-name {
  font-size: 14px;
  font-weight: 600;
}

.chip-icon {
  text-align: center;
  aspect-ratio: 1/1;
  color: white;
  max-width: max-content !important;
  min-width: 20px !important;
  font-size: 12px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
}

.me {
  background: $color_accent_light;
  color: $color_accent;
}

.rotated {
  transform: rotate(90deg);
}

.not-rotated {
  transform: rotate(0);
}

.half-w-m-sm {
  width: calc(50% - 8px);
}

.sigle-group-issue-board::-webkit-scrollbar {
  display: none;
}
.label-wrapper {
  gap: 4px;
}
</style>
