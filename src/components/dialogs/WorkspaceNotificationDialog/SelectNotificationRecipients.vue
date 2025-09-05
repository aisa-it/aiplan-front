<template>
  <div>
    <q-select
      ref="selectMembersRef"
      dense
      multiple
      clearable
      map-options
      options-dense
      class="base-selector"
      :popup-content-style="selectRecipientWidth"
      popup-content-class="inh-popup scrollable-content q-px-sm q-pb-none"
      label="Получатели"
      :disable="isDisabled"
      :modelValue="membersId"
      :options="membersOptions"
      :option-value="(v) => (v === null ? null : v.id ? v.id : v)"
      :option-label="
        (v) => {
          if (typeof v === 'object' && !(v instanceof Array)) {
            return aiplan.UserName(v?.member || v).join(' ') || 'Не Выбран';
          }
        }
      "
      @update:model-value="onSelect"
      @popup-hide="popupHideHandler"
      @virtual-scroll="(details) => scrollHandler(details)"
    >
      <template v-slot:before-options>
        <div class="input-search-members">
          <q-input
            dense
            label="Поиск"
            class="base-input"
            v-model="searchQuery"
          ></q-input>
        </div>
      </template>

      <template v-slot:no-option>
        <div class="input-search-members">
          <q-input
            dense
            label="Поиск"
            class="base-input"
            v-model="searchQuery"
          ></q-input>
        </div>
        <q-item v-if="isLoading">
          <q-item-section class="row items-center">
            <DefaultLoader :size="30" />
          </q-item-section>
        </q-item>
        <q-item v-else>
          <q-item-section class="text-italic text-grey">
            Пользователь не найден
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:option="scope">
        <q-item
          v-bind="scope.itemProps"
          class="q-pa-xs q-mb-sm"
          :class="{ active: scope.selected }"
          rounded
        >
          <q-item-section class="q-pa-xs q-pr-none" avatar>
            <AvatarImage
              :tooltip="
                aiplan.UserName(scope.opt?.member || scope.opt).join(' ')
              "
              :text="
                [
                  aiplan.UserName(scope.opt?.member || scope.opt)[0]?.at(0),
                  aiplan.UserName(scope.opt?.member || scope.opt)[1]?.at(0),
                ].join(' ')
              "
              :image="scope.opt.member?.avatar_id || scope.opt?.avatar_id"
              :member="scope.opt?.member || scope.opt"
            ></AvatarImage>
          </q-item-section>
          <q-item-section class="q-py-xs q-pl-none q-pr-xs">
            <q-item-label>{{
              aiplan.UserName(scope.opt?.member || scope.opt)?.join(' ') ||
              'Не Выбран'
            }}</q-item-label>
          </q-item-section>
          <q-item-section class="q-pa-xs q-pr-none" side>
            <q-checkbox
              dense
              class="q-px-sm"
              :model-value="scope.selected"
              @update:model-value="scope.toggleOption(scope.opt)"
            />
          </q-item-section>
        </q-item>
      </template>

      <template v-slot:prepend>
        <UserIcon :width="24" :height="24" />
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
//core
import { computed, ref, watch } from 'vue';

// utils
import aiplan from 'src/utils/aiplan';
import { filterAvailableMembers } from 'src/utils/filters';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';

//components
import UserIcon from 'components/icons/UserIcon.vue';
import AvatarImage from 'components/AvatarImage.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';

//TODO это общий компонент, необходимо вынести его в соответствующую директорию и сделать ренейм
const props = defineProps<{
  recipients: any[] | undefined;
  isDisabled?: boolean;
  options: any[];
  currentMember?: any;
  isRoleIgnored: boolean;
  useAsyncSearch?: boolean;
  isLoading?: boolean;
}>();
const emits = defineEmits<{
  'update:recipients': [value: any[]];
  fetchMembers: [];
  asyncSearch: [value: string];
  resetPagination: [];
}>();

//vars
const membersId = ref<any[]>([]);
const selectMembersRef = ref();
const searchQuery = ref('');

//utils
const { getWidthStyle: selectRecipientWidth } =
  useResizeObserverSelect(selectMembersRef);

const membersOptions = computed(() => {
  let filteredMembers = [];
  if (!props.useAsyncSearch && searchQuery.value) {
    filteredMembers = filterAvailableMembers(
      props.options,
      membersId.value,
    ).filter((member) => {
      const fullName = aiplan
        .UserName(member?.member || member)
        .join(' ')
        .toLowerCase();
      return fullName.includes(searchQuery.value?.toLowerCase());
    });
  } else {
    filteredMembers = filterAvailableMembers(props.options, membersId.value);
  }
  return props.isRoleIgnored
    ? filteredMembers
    : filteredMembers.filter((m) => m.role > 5);
});

const onSelect = (e: any[]) => {
  emits(
    'update:recipients',
    e ? e.map((d) => (d.member ? d.id : d.id ?? d)) : [],
  );
};

const scrollHandler = (details: any) => {
  if (details?.index === details?.to) emits('fetchMembers');
};

const popupHideHandler = () => {
  searchQuery.value = '';
  emits('resetPagination');
};

watch(
  () => props.recipients,
  () => {
    membersId.value =
      props.recipients && props.recipients.length
        ? props.recipients?.map((e) => {
            return e.id || e;
          })
        : [];
  },
  { deep: true },
);

watch(
  () => searchQuery.value,
  (newVal) => {
    if (props.useAsyncSearch) emits('asyncSearch', newVal);
  },
);
</script>
<style lang="scss" scoped>
.input-search-members {
  position: sticky !important;
  top: 0 !important;
  background: inherit;
  z-index: 1;
  padding: 8px 0 0;
  margin-bottom: 8px;
}
</style>
