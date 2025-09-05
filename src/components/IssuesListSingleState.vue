<template>
  <Disclosure
    v-if="
      (!!rows && rows.length > 0) ||
      (rows.length < 0 && showEmptyGroup) ||
      (['State', 'Label', 'Priority'].includes(groupBy) && showEmptyGroup) ||
      // showEmptyGroup ||
      (showEmptyGroup && member) ||
      (viewProps.isGroupHide(id) && pagination.rowsNumber > 0 && show)
    "
    as="div"
    :default-open="!viewProps.isGroupHide(id)"
    v-slot="{ open }"
  >
    <div
      v-if="
        groupBy === 'State' ||
        groupBy === 'Label' ||
        groupBy === 'Priority' ||
        groupBy === 'Workspace' ||
        groupBy === 'Project'
      "
    >
      <DisclosureButton
        class="flex items-center no-wrap cursor-pointer issues-list-single-state__title disclosure-button full-w"
        @click="onDisclosure(open)"
      >
        <IssuesColorCountTitle
          :name="name"
          :priority="id"
          :color="groupBy !== 'Priority' ? stateOrLabelInfo?.color : undefined"
          :count="pagination.rowsNumber"
          :placeholder="groupBy == 'Priority' ? 'Без приоритета' : 'Без тегов'"
        />

        <ArrowUp :class="{ 'rotate-180': !open, 'arrow-up': true }" />
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
        class="flex items-center no-wrap cursor-pointer gap-x-3 issues-list-single-state__title disclosure-button full-w"
        @click="onDisclosure(open)"
      >
        <IssuesUserTitle
          :user="member"
          :count="pagination.rowsNumber"
          :placeholder="
            groupBy == 'Assignee to' ? 'Без назначений' : 'Без наблюдателей'
          "
        />

        <ArrowUp :class="{ 'rotate-180': !open, 'arrow-up': true }" />
      </DisclosureButton>
    </div>

    <DisclosurePanel
      class="px-4 pb-2 pt-4 text-sm text-gray-500"
      ref="disclosure"
    >
      <q-table
        flat
        :rows="rows"
        :columns="columns"
        class="my-sticky-column-table table-bottom-reverse"
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
                $router.push(
                  `/${$route.params.workspace}/projects/${$route.params.project}/issues/${props.row.sequence_id}`,
                )
            "
          >
            {{ props.value[0] }}-{{ props.value[1] }}
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-name="props">
          <q-td :props="props" :style="'padding: 7px 0;'" class="magic-row">
            <div class="row justify-between">
              <q-btn
                no-caps
                flat
                :to="`/${$route.params.workspace}/projects/${$route.params.project}/issues/${props.row.sequence_id}`"
                :target="user.theme?.open_in_new ? '_blank' : '_self'"
                class="issues-list__task-name"
                :style="`padding: 0 4px; width: ${
                  !!props.row.parent && !!props.row?.parent_detail?.sequence_id
                    ? 'calc(100% - 80px)'
                    : '100%'
                }`"
              >
                <span :style="`text-align: left;`" class="abbriviated-text">
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
                  !!props.row.parent && !!props.row?.parent_detail?.sequence_id
                "
                :row="props.row"
                :target="user.theme?.open_in_new ? '_blank' : '_self'"
              />
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-priority="props">
          <q-td :props="props">
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
                @update:priority="
                  (newV) =>
                    refresh()
                      .then(() => groupsEvents.refresh(newV))
                      .then(() => emitSyncIssue(props.row.id))
                "
              ></SelectPriority>
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-state="props">
          <q-td :props="props">
            <div>
              <SelectStatus
                :projectid="props.row.project"
                :issueid="props.row.id"
                :status="props.row.state_detail"
                :issue="props.row"
                :states-from-cache="statesCache[props.row.project]"
                :isDisabled="
                  !rolesStore.hasPermissionByIssue(
                    props.row,
                    project,
                    'change-issue-status',
                  )
                "
                @set-status="
                  async (val: any) => {
                    props.row.state_detail = val;
                    refresh()
                      .then(() => groupsEvents.refresh(val.id))
                      .then(() => emitSyncIssue(props.row.id));
                    // .then(() => onRequest({ pagination }, val.id));
                  }
                "
              />
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-target_date="props">
          <q-td :props="props" :style="'min-width: 150px'">
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
                @refresh="refresh().then(() => emitSyncIssue(props.row.id))"
              ></SelectDate>
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-created_at="props">
          <q-td :props="props">
            <div :style="'width: 150px; max-width: 150px'" class="body-2">
              {{ props.value }}
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-labels="props">
          <q-td :props="props">
            <div class="row no-wrap" style="gap: 4px">
              <q-badge
                v-for="l in props.value"
                :key="l.name"
                class="q-ml-xs overflow-hidden"
                :style="['background-color: ' + l.color, 'max-width: 200px']"
              >
                <span class="abbriviated-text">
                  {{ l.name }}
                  <HintTooltip>
                    {{ l.name }}
                  </HintTooltip>
                </span>
              </q-badge>
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>
        <template v-slot:body-cell-author="props">
          <q-td :props="props">
            <AvatarImage
              :key="props.value.name"
              :tooltip="avatarText(props.value).join(' ')"
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
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-assignees="props">
          <q-td :props="props" style="position: relative">
            <AvatarImage
              v-for="(l, n) in props.value"
              :style="{ zIndex: props.value.length - n }"
              class="overlapping"
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
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-sub_issues_count="props">
          <q-td :props="props">
            <div class="table-chip-wrap">
              <QuantityChip :type="'sub-issues'" :value="props.value" />
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
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
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-link_count="props">
          <q-td :props="props">
            <div class="table-chip-wrap">
              <QuantityChip :type="'links'" :value="props.value" />
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:body-cell-attachment_count="props">
          <q-td :props="props">
            <div class="table-chip-wrap">
              <QuantityChip :type="'attachments'" :value="props.value" />
            </div>
            <IssueContextMenu :row="props.row" :rowId="props.rowIndex" @refresh="refresh"/>
          </q-td>
        </template>

        <template v-slot:no-data>
          <div class="column flex-center" style="width: 100%; height: 40%">
            <DefaultLoader v-if="loading" class="self-center q-mt-md q-mb-md" />
            <div v-if="!loading && !rows.length" class="column flex-center">
              <DocumentIcon :width="56" :height="56" />
              <h6>Нет задач</h6>
            </div>
          </div>
        </template>
      </q-table>
    </DisclosurePanel>
    <q-separator />
  </Disclosure>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  watch,
} from 'vue';
import { storeToRefs } from 'pinia';
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue';
import { useRoute } from 'vue-router';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useAiplanStore } from 'src/stores/aiplan-store';
import { useStatesStore } from 'src/stores/states-store';
import { useIssuesStore } from 'src/stores/issues-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useViewPropsStore } from 'src/stores/view-props-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useGroupsEventsStore } from 'src/stores/groups-events-store';
import { useLoaderStore } from 'src/stores/loader-store';

// services
import aiplan from 'src/utils/aiplan';
import issuesComposer from 'src/utils/issues-composer';

// components
import AvatarImage from './AvatarImage.vue';
import DocumentIcon from './icons/DocumentIcon.vue';
import DefaultLoader from './loaders/DefaultLoader.vue';
import IssuesUserTitle from './IssuesUserTitle.vue';
import IssuesColorCountTitle from './IssuesColorCountTitle.vue';
import IssueContextMenu from 'src/shared/components/IssueContextMenu.vue';

// components - selectors
import SelectDate from './SelectDate.vue';
import SelectStatus from './SelectStatus.vue';
import SelectPriority from './SelectPriority.vue';

// compomemts - chips
import QuantityChip from './QuantityChip.vue';
import ArrowUp from 'components/icons/ArrowUp.vue';
import ParentIssueChip from './ParentIssueChip.vue';
import PaginationDefault from './pagination/PaginationDefault.vue';
import { inject } from 'vue';

export default defineComponent({
  name: 'IssuesListSingleState',
  props: [
    'id',
    'groupBy',
    'stateOrLabelInfo',
    'member',
    'projectid',
    'columns',
    'searchValue',
    'me',
    'showEmptyGroup',
  ],
  emits: ['globalRefresh', 'end-loading', 'start-loading'],

  setup(props, { emit }) {
    // stores
    const api = useAiplanStore();
    const userStore = useUserStore();
    const rolesStore = useRolesStore();
    const statesStore = useStatesStore();
    const issuesStore = useIssuesStore();
    const loaderStore = useLoaderStore();
    const viewProps = useViewPropsStore();
    const projectStore = useProjectStore();
    const workspaceStore = useWorkspaceStore();
    const groupsEvents = useGroupsEventsStore();

    // store to ref
    const { user } = storeToRefs(userStore);
    const { statesCache } = storeToRefs(statesStore);
    const { currentProjectID, project } = storeToRefs(projectStore);
    const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
    const { refreshIssues } = storeToRefs(issuesStore);

    // issues vars
    const route = useRoute();
    const rows = ref([]);
    const bus = inject('bus');
    const pagination = ref({
      sortBy: viewProps.props?.filters?.order_by,
      descending: viewProps.props?.filters?.orderDesc,
      page: 1,
      rowsPerPage: viewProps.props?.page_size,
      rowsNumber: 0,
    });

    // service vars
    const show = ref(true);
    const loading = ref(false);

    const project_id = toRef(props.projectid);
    const searchText = toRef(props, 'searchValue');

    const projectIssuesState = ref();

    const name = ref();
    const color = ref();

    // issues request
    async function onRequest(p: any) {
      loaderStore.startTableLoading();

      if (
        props.groupBy == 'State' &&
        viewProps.props?.filters.states !== undefined &&
        viewProps.props?.filters.states.length > 0 &&
        !viewProps.props?.filters.states.some((s) => props?.id == s)
      ) {
        show.value = false;
        return;
      }

      show.value = true;
      loading.value = true;

      const { sortBy, descending, rowsPerPage } = p.pagination;

      if (
        sortBy != viewProps.props?.filters.order_by ||
        descending != viewProps.props?.filters.orderDesc ||
        rowsPerPage !== pagination.value?.rowsPerPage
      ) {
        viewProps.props.page_size = rowsPerPage;
        viewProps.props.filters.order_by = sortBy;
        viewProps.props.filters.orderDesc = descending;
        viewProps.saveProps();
      }

      const requestData = {
        pagination: p.pagination,
        personalIssuesTemplate: viewProps.projectView
          ? null
          : viewProps.props?.activeTab,
        projects: viewProps.props?.filters?.projects,
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
        rows.value = res.rows;
        pagination.value = { ...pagination.value, ...res.pagination };
        loading.value = false;
        emit('end-loading');
      });
    }

    async function onDisclosure(close: boolean) {
      viewProps.setGroupHide(props.id, close);
      await viewProps.saveProps();
      if (!close) refresh();
    }

    const refresh = async () => {
      pagination.value.sortBy = viewProps.props?.filters.order_by;
      pagination.value.descending = viewProps.props?.filters.orderDesc;
      pagination.value.rowsPerPage = viewProps.props?.page_size;
      await onRequest({ pagination: pagination.value });
    };

    const emitSyncIssue = async (value: any) => {
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

    onMounted(() => {
      if (props.stateOrLabelInfo !== undefined) {
        projectIssuesState.value = props.stateOrLabelInfo;
        name.value = props.stateOrLabelInfo.name;
        color.value = props.stateOrLabelInfo.color;
      }
      bus.on('sync-issue-emit', syncIssue);
      groupsEvents.sub(props.id, refresh);
      refresh();
    });

    onUnmounted(() => groupsEvents.unSub());

    watch(searchText, () => refresh());

    watch(
      () => refreshIssues.value,
      async () => {
        if (refreshIssues.value === true) await refresh();
        refreshIssues.value = false;
      },
    );

    return {
      api,
      user,
      show,
      rows,
      project,
      statesCache,
      projectIssuesState,
      onRequest,
      pagination,
      searchText,
      avatarText: aiplan.UserName,
      loading,
      onDisclosure,
      project_id,
      refresh: refresh,
      name,
      color,
      viewProps,
      rolesStore,
      groupsEvents,
      currentWorkspaceSlug,
      emitSyncIssue,
    };
  },
  components: {
    ArrowUp,
    Disclosure,
    SelectDate,
    AvatarImage,
    DocumentIcon,
    SelectStatus,
    QuantityChip,
    DefaultLoader,
    SelectPriority,
    DisclosurePanel,
    IssuesUserTitle,
    ParentIssueChip,
    DisclosureButton,
    PaginationDefault,
    IssuesColorCountTitle,
    IssueContextMenu,
  },
});
</script>
<style lang="scss">
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
</style>

<style scoped lang="scss">
:deep(.q-table__bottom--nodata) {
  height: 30vh !important;
}
</style>
