<template>
  <q-select
    ref="selectWatcherRef"
    dense
    multiple
    clearable
    map-options
    class="base-selector"
    :class="{ 'adaptive-select': isAdaptiveSelect }"
    :popup-content-style="selectWatcherWidth"
    :label="label"
    :disable="isDisabled"
    :virtual-scroll-slice-ratio-before="30"
    @virtual-scroll="(e) => loadMembersOnScroll(e)"
    :loading="isLoading"
    v-model="membersId"
    :option-label="(v) => memberFullName(v.member)"
    :option-value="(v) => v.member?.id"
    :options="options"
  >
    <template v-slot:before-options>
      <div class="select-search">
        <q-input
          style="padding: 8px"
          clearable
          dense
          autofocus
          label="Поиск"
          class="base-input"
          v-model="searchQuery"
          @update:model-value="searchMembers"
        ></q-input>
      </div>
      <q-separator />
    </template>

    <template v-slot:selected>
      <SelectedUsersList :users="props.modelValue" :currentUser="user" />
    </template>

    <template v-slot:no-option>
      <q-item class="items-center">Нет пользователей</q-item>
    </template>

    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        style="padding: 0px !important"
        :style="[
          user?.id === scope.opt.member?.id
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

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';
import aiplan from 'src/utils/aiplan';
import {
  DaoPaginationResponse,
  DtoProjectMemberLight,
  DtoWorkspaceMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { filterAvailableMembers } from 'src/utils/filters';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';
import { debounce } from 'quasar';
import SelectedUsersList from './components/SelectedUsersList.vue';
import AvatarImage from '../AvatarImage.vue';

interface Pagination {
  offset: number;
  limit: number;
  order_by: string;
  desc: boolean;
  search_query: string;
}

type Member = DtoProjectMemberLight | DtoWorkspaceMemberLight;
type Members = Member[];

const props = defineProps<{
  isAdaptiveSelect: boolean;
  label?: string;
  isDisabled?: boolean;
  isNotPinCurrentUser?: boolean;
  modelValue: DtoProjectMemberLight[];
  refreshMembersFunc: (pagination: Pagination) => Promise<
    DaoPaginationResponse & {
      result?: Members;
    }
  >;
}>();

const emits = defineEmits<{
  'update:modelValue': [DtoProjectMemberLight[]];
  refresh: [];
}>();

const getDefaultPagination = () => {
  return {
    offset: 0,
    limit: 15,
    order_by: 'id',
    desc: false,
    search_query: '',
  };
};

let pagination: Pagination = getDefaultPagination();

const searchQuery = ref('');
let membersCount = 0;

const members = ref<Members>([]);

const refresh = async () => {
  isLoading.value = true;

  try {
    const data = await props.refreshMembersFunc(pagination);
    members.value = data.result;
    membersCount = data.count ?? 0;
  } finally {
    isLoading.value = false;
  }
};

const searchMembers = debounce(async () => {
  if (!searchQuery.value) {
    pagination = getDefaultPagination();
    await refresh();
    return;
  }

  pagination.offset = -1;
  pagination.limit = 15;
  await refresh();
}, 700);

const { user } = storeToRefs(useUserStore());

const membersId = computed({
  get() {
    return props.modelValue.map((el) => el?.member?.id);
  },
  set(newMembersId: string[]) {
    emits(
      'update:modelValue',
      members.value.filter((el) => newMembersId.includes(el?.member?.id ?? '')),
    );
    emits('refresh');
  },
});

const pinCurrentUserInMembersList = (membersList: Members) => {
  if (props.isNotPinCurrentUser) return membersList;

  const currentMember = membersList.find(
    (el) => el?.member?.id === user.value.id,
  );
  if (!currentMember) return membersList;

  return [currentMember, ...membersList];
};

const options = computed(() => {
  const activeMembers = filterAvailableMembers(members.value, membersId.value);

  if (searchQuery.value) return [...props.modelValue, ...activeMembers];

  return pinCurrentUserInMembersList([...props.modelValue, ...activeMembers]);
});

const selectWatcherRef = ref();
const isLoading = ref(false);

const { getWidthStyle: selectWatcherWidth } =
  useResizeObserverSelect(selectWatcherRef);

const loadMembersOnScroll = async (e?: any) => {
  if (
    e?.direction === 'increase' &&
    e?.index !== 0 &&
    e.index === e.to &&
    e.to < membersCount
  ) {
    pagination.offset = pagination.offset + 15;
    await refresh();
  }
};

const memberFullName = (member: Member) => {
  return aiplan.UserName(member).join(' ') || 'Не Выбран';
};

const memberAbbreviation = (member: Member) => {
  return [
    aiplan.UserName(member)[0]?.at(0),
    aiplan.UserName(member)[1]?.at(0),
  ].join(' ');
};
</script>
