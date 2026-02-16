<template>
  <q-select
    ref="selectLeaderRef"
    dense
    :model-value="currentValue"
    :label="label"
    class="base-selector"
    :readonly="isDisabled"
    :options="leaderOptionsComputed"
    :popup-content-style="selectLeaderWidth"
    @click="showTooltip"
    @update:model-value="handleUpdateCurrentValue"
  >
    <HintTooltip v-if="isDisabled" :model-value="isMobile ? isShowTooltip : undefined">
      Данный параметр может менять только {{ label.toLowerCase() }}
    </HintTooltip>
    <template v-slot:option="scope">
      <q-item
        v-bind="scope.itemProps"
        :class="{ 'q-pa-xs': !!scope.opt.member }"
      >
        <q-item-section
          v-if="scope.opt.member"
          class="q-pa-xs q-pr-none"
          avatar
        >
          <AvatarImage
            :tooltip="aiplan.UserName(scope.opt.member).join(' ')"
            :text="
              [
                aiplan.UserName(scope.opt.member)[0]?.at(0),
                aiplan.UserName(scope.opt.member)[1]?.at(0),
              ].join(' ')
            "
            :image="scope.opt.member.avatar_id"
            :member="scope.opt.member"
          ></AvatarImage>
        </q-item-section>
        <q-item-section class="q-py-xs q-pl-none q-pr-xs">
          <q-item-label class="word-wrap">{{
            aiplan.UserName(scope.opt.member).join(' ') ||
            scope.opt.label ||
            'Не Выбран'
          }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
// utils
import aiplan from 'src/utils/aiplan';
import { useResizeObserverSelect } from 'src/utils/useResizeObserverSelect';

// components
import AvatarImage from 'components/AvatarImage.vue';
import { IProjectLeader } from 'src/interfaces/projects';
import { Screen } from 'quasar';

const props = withDefaults(
  defineProps<{
    currentValue?: IProjectLeader;
    isDisabled?: boolean;
    options?: IProjectLeader[];
    label?: string;
  }>(),
  {
    options: () => [],
    label: 'Лидер проекта',
  },
);

const emits = defineEmits<{
  'update:currentValue': [value: IProjectLeader];
}>();

const selectLeaderRef = ref();
const { getWidthStyle: selectLeaderWidth } =
  useResizeObserverSelect(selectLeaderRef);

const isShowTooltip = ref(false)

const isMobile = computed(() => Screen.width <= 650);

const leaderOptionsComputed = computed(() => {
  return props.options;
});

const handleUpdateCurrentValue = (value: IProjectLeader) => {
  emits('update:currentValue', value);
};

const showTooltip = () => {
  if (props.isDisabled && isMobile.value) {
    isShowTooltip.value = true
    setTimeout(()=>isShowTooltip.value = false, 1000)
  }
}
</script>

<style scoped></style>
