<template>
  <q-select
    ref="selectWatcherRef"
    dense
    :multiple="!offMultiple"
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
    v-model="internalValue"
    :option-label="(v) => memberFullName(v.member)"
    :option-value="(v) => v.member?.id"
    :options="options"
  >
    <template v-slot:before-options>
      <SearchInput
        v-if="!offSearch"
        v-model="searchQuery"
        @update:model-value="searchMembers"
      />
      <q-separator />
    </template>

    <template v-slot:selected>
      <SelectedUsersList :users="props.modelValue" :currentUser="user" />
    </template>

    <template v-slot:no-option>
      <SearchInput
        v-if="!offSearch"
        v-model="searchQuery"
        @update:model-value="searchMembers"
      />
      <q-separator />
      <q-item class="items-center">Нет пользователей</q-item>
    </template>

    <template v-slot:option="scope">
      <UserCard v-bind="scope.itemProps" :member="scope.opt.member" />
      <q-separator
        v-if="!offPinCurrentUser && user.id === scope.opt.member?.id"
      />
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { debounce } from 'quasar';

import SearchInput from './components/SearchInput.vue';
import UserCard from './components/UserCard.vue';
import SelectedUsersList from './components/SelectedUsersList.vue';

import { useUserStore } from 'src/stores/user-store';

import {
  DaoPaginationResponse,
  DtoProjectMemberLight,
  DtoUserLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { Member, Pagination } from './types/types';

import { filterAvailableMembers } from 'src/utils/filters';
import { memberFullName } from './helpers/helpers';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';

type Members = Member[];

const props = defineProps<{
  isAdaptiveSelect?: boolean;
  label?: string;
  isDisabled?: boolean;
  offPinCurrentUser?: boolean;
  offSearch?: boolean;
  offMultiple?: boolean;
  modelValue: Members;
  defaultMembers?: DtoUserLight[] | Members;
  refreshMembersFunc: (
    pagination: Pagination,
    searchQuery?: string,
  ) => Promise<
    | (DaoPaginationResponse & {
        result?: Members;
      })
    | undefined
  >;
  onChange?: (members: Members) => Promise<void> | void;
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
  };
};

let pagination: Pagination = getDefaultPagination();

const searchQuery = ref('');
let membersCount = 0;

const members = ref<Members>([]);
const { user } = useUserStore();

const refresh = async () => {
  isLoading.value = true;

  try {
    const data = await props.refreshMembersFunc(pagination, searchQuery.value);
    if (!data) return (isLoading.value = false);

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

const selectedMembers = computed({
  get() {
    return props.modelValue;
  },
  async set(newMembers) {
    if (!newMembers) return;

    emits('update:modelValue', newMembers);

    if (props.onChange) {
      await props.onChange(newMembers);
    }

    emits('refresh');
  },
});

const internalValue = computed({
  get() {
    if (props.offMultiple) return selectedMembers.value?.[0] ?? null;
    return selectedMembers.value;
  },
  set(newValue) {
    if (!newValue) return (selectedMembers.value = []);

    if (!Array.isArray(newValue)) {
      selectedMembers.value = [newValue];
      return;
    }
    selectedMembers.value = newValue;
  },
});

const pinCurrentUserInMembersList = (membersList: Members) => {
  if (props.offPinCurrentUser) return membersList;

  if (!user) return membersList;

  return [
    ...membersList.filter((el) => el?.member?.id == user.id),
    ...membersList.filter((el) => el?.member?.id !== user.id),
  ];
};

const options = computed(() => {
  const activeMembers = filterAvailableMembers(
    members.value,
    selectedMembers.value,
  );

  const selectedIds = new Set(selectedMembers.value?.map((m) => m.member?.id));

  const selected = activeMembers.filter((m) => selectedIds.has(m.member?.id));

  const unselected = activeMembers.filter(
    (m) => !selectedIds.has(m.member?.id),
  );

  const result = [...selected, ...unselected];

  if (searchQuery.value) return result;

  return pinCurrentUserInMembersList(result);
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
    pagination.offset = (pagination?.offset ?? 0) + 15;
    await refresh();
  }
};

function applyDefaultMembers() {
  if (!props.defaultMembers) return;

  if ('member_id' in props.defaultMembers[0]) {
    selectedMembers.value = [...props.defaultMembers];
    return;
  }

  const ids = new Set(props.defaultMembers.map((u) => u.id));
  selectedMembers.value = members.value.filter((m) => ids.has(m.member?.id));
}

onMounted(async () => {
  await refresh();
  applyDefaultMembers();
});

watch(
  () => props.defaultMembers,
  () => {
    applyDefaultMembers();
  },
);

watch(
  () => props.refreshMembersFunc,
  () => {
    refresh();
  },
);
</script>
