<template>
  <q-select
    ref="selectWatcherRef"
    dense
    multiple
    clearable
    map-options
    :hide-dropdown-icon="hideDropdownIcon"
    popup-content-class="inh-popup scrollable-content"
    :class="isAdaptiveSelect ? 'adaptive-select' : ''"
    :popup-content-style="selectWatcherWidth"
    :label="label"
    :disable="isDisabled"
    :modelValue="watcherid"
    :option-label="(v) => memberFullName(v.member)"
    :option-value="(v) => v.member?.id"
    :options="options"
    :virtual-scroll-slice-ratio-before="30"
    :loading="loading || isLoading"
    @popup-show="() => (isOpen = true)"
    @popup-hide="() => (isOpen = false)"
    @update:model-value="(e) => handleUpdateWatchers(e)"
    @virtual-scroll="(e) => loadMembersOnScroll(e)"
  >
    <template v-slot:before-options>
      <div class="select-search">
        <q-input
          style="padding: 8px"
          clearable
          dense
          label="Поиск"
          class="base-input"
          v-model="searchQuery"
          @update:model-value="(query) => searchMembers(query as string)"
        ></q-input>
        <q-item
          v-if="members.length > 1 && isSearch === false"
          clickable
          :active="isActiveMyEntity"
          style="padding: 0px !important"
          @click="selectWatcherRef.toggleOption(myEntity)"
        >
          <q-item-section class="q-pa-xs q-pr-none" avatar>
            <AvatarImage
              :tooltip="memberFullName(myEntity.member)"
              :text="memberAbbreviation(myEntity.member)"
              :image="myEntity.member.avatar_id"
              :member="myEntity.member"
            ></AvatarImage>
          </q-item-section>
          <q-item-section class="q-py-xs q-pl-none q-pr-xs">
            {{ aiplan.UserName(myEntity.member).join(' ') }}
          </q-item-section>
        </q-item>
        <q-separator />
      </div>
    </template>
    <template v-slot:selected>
      <SelectedUsersList :users="watcherid" :currentUser="curMember" />
    </template>
    <template v-slot:no-option>
      <div class="select-search">
        <q-input
          style="padding: 8px"
          dense
          clearable
          label="Поиск"
          class="base-input"
          v-model="searchQuery"
          @update:model-value="(query) => searchMembers(query as string)"
        ></q-input>
      </div>
      <q-separator />

      <q-item class="items-center">Нет пользователей</q-item>
    </template>

    <template v-if="hideDropdownIcon" v-slot:append>
      <ArrowDown class="chevron-rotate" :class="{ 'rotate-180': isOpen }" />
    </template>

    <template v-slot:option="scope">
      <q-item
        v-if="scope.opt.member"
        v-bind="scope.itemProps"
        style="padding: 0px !important"
        :style="[
          curMember?.id === scope.opt.member?.id
            ? 'position: sticky!important;z-index: 1000;top: 0;background-color: inherit'
            : '',
        ]"
      >
        <q-item-section class="q-pa-xs q-pr-none" avatar>
          <AvatarImage
            :tooltip="memberFullName(scope.opt.member)"
            :text="memberAbbreviation(scope.opt.member)"
            :image="scope.opt.member?.avatar_id"
            :member="scope.opt.member"
          ></AvatarImage>
        </q-item-section>
        <q-item-section class="q-py-xs q-pl-none q-pr-xs">
          <q-item-label>{{ memberFullName(scope.opt.member) }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script lang="ts" setup>
//core
import { storeToRefs } from 'pinia';
import {
  onMounted,
  ref,
  watch,
  toRef,
  defineProps,
  withDefaults,
  computed,
} from 'vue';
import { debounce } from 'quasar';
//utils
import aiplan from 'src/utils/aiplan';
import { filterAvailableMembers } from 'src/utils/filters';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
//stores
import { useProjectStore } from 'stores/project-store';
import { useWorkspaceStore } from 'stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
//icons
import ArrowDown from '../icons/ArrowDown.vue';
//components
import AvatarImage from 'components/AvatarImage.vue';
import SelectedUsersList from 'components/selects/components/SelectedUsersList.vue';

const props = withDefaults(
  defineProps<{
    projectid?: string;
    issueid?: string | null;
    docId?: string;
    watchers?: [];
    defaultWatcher?: [];
    isDisabled?: boolean;
    newIssue?: boolean;
    label?: string;
    isAdaptiveSelect?: boolean;
    currentMember: any;
    hideDropdownIcon?: boolean;
    isLoading?: boolean;
  }>(),
  {
    isDisabled: () => false,
    label: () => 'Наблюдатель',
    newIssue: () => false,
    currentMember: () => null,
    hideDropdownIcon: () => false,
  },
);

const emit = defineEmits(['refresh', 'update:watchers']);

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const aidocStore = useAiDocStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const searchQuery = ref('');
const myEntity = ref();
const members = ref([]);
const countMembers = ref(0);
const selectWatcherRef = ref();
const loading = ref(false);
const curMember = toRef(props.currentMember);
const defWatcher = toRef(props.defaultWatcher);
const isSearch = ref(false);
const isOpen = ref(false);
let pendingRefresh: Promise<void> | null = null;
const watcherid = ref(
  props.watchers && props.watchers?.length > 0
    ? props.watchers.map((e) => {
        return e?.id || e;
      })
    : defWatcher.value && defWatcher.value.length
      ? defWatcher.value
      : null,
);
const pagination = {
  offset: 0,
  limit: 15,
  order_by: 'id',
  desc: false,
  search_query: '',
};

//computeds
const options = computed(() => {
  const filteredMembers = filterAvailableMembers(
    members.value,
    watcherid.value,
  );
  const membersList =
    props.watchers && !isSearch.value
      ? [...props.watchers, ...filteredMembers]
      : filteredMembers;

  return membersList.filter(
    (item, idx, arr) =>
      item?.member &&
      arr.findIndex((v) => v.member?.id === item.member?.id) === idx,
  );
});

//composibles
const { getWidthStyle: selectWatcherWidth } =
  useResizeObserverSelect(selectWatcherRef);

//methods
const refresh = async (searchQuery?: string, isSearch?: boolean) => {
  loading.value = true;
  let data;
  try {
    if (props.projectid) {
      data = await projectStore.getProjectMembers(
        currentWorkspaceSlug.value as string,
        props.projectid,
        {
          offset: pagination.offset,
          limit: pagination.limit,
          search_query: searchQuery,
          order_by: pagination.order_by,
          desc: pagination.desc,
        },
      );
      myEntity.value = data.my_entity;
    } else {
      data = await workspaceStore.getWorkspaceMembers(
        currentWorkspaceSlug.value as string,
        {
          offset: pagination.offset,
          limit: pagination.limit,
          order_by: pagination.order_by,
          desc: pagination.desc,
          search_query: searchQuery,
        },
      );
      myEntity.value = {
        id: curMember.value.id,
        member: { ...curMember.value },
      };
    }
    if (isSearch) members.value = [];
    countMembers.value = data.count;
    members.value = [...members.value, ...data.result];
  } catch (e) {
  } finally {
    loading.value = false;
  }
};

const loadMembersOnScroll = async (e?: any) => {
  if (
    e?.direction === 'increase' &&
    e?.index !== 0 &&
    e.index === e.to &&
    e.to < countMembers.value
  ) {
    pagination.offset = pagination.offset + 15;
    await refresh();
  }
};

const updateProjectWatchers = async (e: any) => {
  const currentIds = watcherid;
  if (props.issueid) {
    singleIssueStore
      .updateIssueData(
        currentWorkspaceSlug.value as string,
        props.projectid,
        props.issueid,
        {
          watchers_list: e
            ? e.map((d) => (d.member ? d.member.id || d.id : d))
            : [],
        },
      )
      .then(() => {
        setNotificationView({ open: true, type: 'success' });
        emit('refresh');
      })
      .catch(() => (watcherid.value = currentIds));
  } else {
    emit('update:watchers',
    e ? e.map((d) => (d)) : []);
  }
};

const updateDocWatchers = async (e: any) => {
  const watchersIds = e
    ? e.map((d) => (d.member ? d.member?.id || d?.id : d))
    : [];

  if (!props.docId) {
    emit('update:watchers', watchersIds);
    return;
  }

  aidocStore
    .updateDocument(
      {
        doc: {
          watcher_list: watchersIds,
        },
      },
      currentWorkspaceSlug.value as string,
      props.docId as string,
    )
    .then(() => {
      setNotificationView({ open: true, type: 'success' });
      emit('refresh');
    });
};

const handleUpdateWatchers = async (e) => {
  watcherid.value = e;
  if (props.projectid) {
    updateProjectWatchers(e);
  } else {
    updateDocWatchers(e);
  }
};

const memberAbbreviation = (member) => {
  return [
    aiplan.UserName(member)[0]?.at(0),
    aiplan.UserName(member)[1]?.at(0),
  ].join(' ');
};

const memberFullName = (member) => {
  return aiplan.UserName(member).join(' ') || 'Не Выбран';
};

const searchMembers = debounce(async (query: string) => {
  pagination.offset = -1;
  pagination.limit = 15;
  await refresh(query, true);
  isSearch.value = !!query;
}, 700);

const isActiveMyEntity = computed(() =>
  watcherid.value?.find(
    (watcher) => watcher?.member?.id === myEntity.value.member?.id,
  )
    ? true
    : false,
);

//hooks
watch(
  () => props.defaultWatcher,
  () => {
    if (props.defaultWatcher !== undefined) {
      defWatcher.value = props.defaultWatcher;
      watcherid.value = !!defWatcher.value ? defWatcher.value : [];
      emit('update:watchers', watcherid.value);
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  pendingRefresh = (async () => {
    try {
      await refresh();
    } finally {
      pendingRefresh = null;
    }
  })();
});

watch(
  () => [props.projectid, props.docId],
  () => {
    members.value = [];
    pagination.offset = -1;
    pagination.limit = 15;
    pagination.search_query = '';

    refresh();
  },
);

watch(
  () => props.watchers,
  async (_) => {
    if (!props.watchers) return;

    if (props.watchers.length > 0 && typeof props.watchers[0] !== 'string') {
      watcherid.value = [...props.watchers];
      return;
    }

    if (!members.value.length) {
      await pendingRefresh;
    }

    const watcherIds: string[] = [...props.watchers];
    let isMyEntityIncluded = false;

    const newWatchers = members.value.filter((member) => {
      if (watcherIds.includes(member.member_id)) {
        if (!isMyEntityIncluded && member.member_id === myEntity.value?.id) {
          isMyEntityIncluded = true;
        }
        return true;
      }
    });

    if (!isMyEntityIncluded && watcherIds.includes(myEntity.value?.id)) {
      watcherid.value = [myEntity.value, ...newWatchers];
      return;
    }

    watcherid.value = [...newWatchers];
  },
);
</script>
