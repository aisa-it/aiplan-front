<template>
  <q-select
    ref="selectAssigneeRef"
    dense
    multiple
    clearable
    map-options
    class="base-selector"
    popup-content-class="inh-popup scrollable-content"
    :class="{ 'adaptive-select': isAdaptiveSelect }"
    :popup-content-style="selectAssigneeWidth"
    :label="label"
    :disable="isDisabled"
    :modelValue="assignessid"
    :option-label="(v) => memberFullName(v.member)"
    :option-value="(v) => v.member?.id"
    :options="options"
    :virtual-scroll-slice-ratio-before="30"
    @update:model-value="(e) => handleUpdateAssignees(e)"
    @virtual-scroll="(e) => loadMembersOnScroll(e)"
  >
    <template v-slot:before-options>
      <div class="select-search">
        <q-input
          ref="emptyMemberListInput"
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
          style="padding: 0px !important"
          :active="isActiveMyEntity"
          @click="selectAssigneeRef.toggleOption(myEntity)"
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
      <SelectedUsersList :users="assignessid" :currentUser="curMember" />
    </template>
    <template v-slot:no-option>
      <div class="select-search">
        <q-input
          ref="emptyMemberListInput"
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

    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        style="padding: 0px !important"
        :style="[
          curMember?.id === scope.opt.member.id
            ? 'position: sticky!important;z-index: 1000;top: 0;background-color: inherit'
            : '',
        ]"
      >
        <q-item-section class="q-pa-xs q-pr-none" avatar>
          <AvatarImage
            :tooltip="memberFullName(scope.opt.member)"
            :text="memberAbbreviation(scope.opt.member)"
            :image="scope.opt.member.avatar_id"
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
//stores
import { useProjectStore } from 'stores/project-store';
import { useWorkspaceStore } from 'stores/workspace-store';
import { useNotificationStore } from 'stores/notification-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
//utils
import aiplan from 'src/utils/aiplan';
import { filterAvailableMembers } from 'src/utils/filters';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
//components
import AvatarImage from 'components/AvatarImage.vue';
import SelectedUsersList from 'components/selects/components/SelectedUsersList.vue';

const props = withDefaults(
  defineProps<{
    projectid: string;
    issueid?: string | null;
    assigness?: [];
    defaultAssignee?: [];
    isDisabled?: boolean;
    newIssue?: boolean;
    label?: string;
    isAdaptiveSelect?: boolean;
    currentMember: any;
  }>(),
  {
    isDisabled: () => false,
    label: () => 'Исполнитель',
    newIssue: () => false,
    currentMember: () => null,
  },
);

const emit = defineEmits(['refresh', 'update:assigness']);

//stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const { setNotificationView } = useNotificationStore();

//storesToRefs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const searchQuery = ref('');
const myEntity = ref();
const members = ref([]);
const membersmap = ref({});
const countMembers = ref(0);
const selectAssigneeRef = ref();
const loading = ref(false);
const curMember = toRef(props.currentMember);
const defAssignee = toRef(props.defaultAssignee);
const emptyMemberListInput = ref();
const isSearch = ref(false);
const assignessid = ref(
  props.assigness && props.assigness?.length > 0
    ? props.assigness.map((e) => {
        return e?.id || e;
      })
    : defAssignee.value && defAssignee.value.length
    ? defAssignee.value
    : null,
);

//composibles
const { getWidthStyle: selectAssigneeWidth } =
  useResizeObserverSelect(selectAssigneeRef);

//const
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
    assignessid.value,
  ).filter((m) => m?.role > 5);

  const membersList = props.assigness && !isSearch.value
    ? [...props.assigness, ...filteredMembers]
    : filteredMembers;

  return membersList.filter(
    (item, idx, arr) =>
      item?.member &&
      arr.findIndex((v) => v?.member && v.member.id === item.member.id) === idx,
  );
});

//methods
const refresh = async (searchQuery?: string, isSearch?: boolean) => {
  loading.value = true;
  await projectStore
    .getProjectMembers(currentWorkspaceSlug.value as string, props.projectid, {
      offset: pagination.offset,
      limit: pagination.limit,
      search_query: searchQuery,
      order_by: pagination.order_by,
      desc: pagination.desc,
    })
    .then((d) => {
      if (isSearch) members.value = [];

      countMembers.value = d.count;
      members.value = [...members.value, ...d.result];
      myEntity.value = d.my_entity;
    })
    .finally(() => {
      loading.value = false;
    });
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

const handleUpdateAssignees = async (e) => {
  const currentIds = assignessid;
  assignessid.value = e;
  if (props.issueid) {
    singleIssueStore
      .updateIssueData(
        currentWorkspaceSlug.value as string,
        props.projectid,
        props.issueid,
        {
          assignees_list: e
            ? e.map((d) => (d.member ? d.member.id || d.id : d))
            : [],
        },
      )
      .then(() => {
        setNotificationView({ open: true, type: 'success' });
        emit('refresh');
      })
      .catch(() => (assignessid.value = currentIds));
  } else {
    emit(
      'update:assigness',
      e ? e.map((d) => (d.member ? d.member.id || d.id : d)) : [],
    );
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
  assignessid.value?.find(
    (assignee) => assignee?.member?.id === myEntity.value.member?.id,
  )
    ? true
    : false,
);

//hooks
watch(
  () => props.defaultAssignee,
  () => {
    if (props.defaultAssignee !== undefined) {
      defAssignee.value = props.defaultAssignee;
      assignessid.value = !!defAssignee.value ? defAssignee.value : [];
      emit('update:assigness', assignessid.value);
    }
  },
  {
    immediate: true,
  },
);

onMounted(() => {
  refresh();
});

watch(
  () => props.projectid,
  () => {
    members.value = [];
    pagination.offset = -1;
    pagination.limit = 15;
    pagination.search_query = '';

    refresh();
  },
);
</script>
