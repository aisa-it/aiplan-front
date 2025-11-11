<template>
  <q-page>
    <q-card class="single-list relative" flat dense>
      <q-card-section
        class="row issue-list__header"
        :style="'padding: 12px 16px'"
      >
        <div
          class="q-table__title abbriviated-text"
          :style="' max-width: calc(100% - 60px)'"
        >
          <span> Задачи спринта {{ sprint?.name }} </span>
        </div>
        <q-space />
      </q-card-section>
      <q-separator />
      <transition name="fade" mode="out-in">
        <component :is="currentIssueList" />
      </transition>
    </q-card>
  </q-page>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import {
  defineAsyncComponent,
  onMounted,
  ref,
  shallowRef,
  watchEffect,
} from 'vue';

import { getSprint } from 'src/modules/sprints/services/api';
import { DtoSprint } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const router = useRouter();
const sprint = ref({} as DtoSprint);
const issuesLoader = ref(false);

const components = {
  DefaultIssueList: defineAsyncComponent(
    () => import('src/modules/issue-list/components/DefaultIssueList.vue'),
  ),
  GroupedIssueList: defineAsyncComponent(
    () => import('src/modules/issue-list/components/GroupedIssueList.vue'),
  ),
  TableListSkeleton: defineAsyncComponent(
    () =>
      import(
        'src/modules/issue-list/components/skeletons/TableListSkeleton.vue'
      ),
  ),
  BoardListSkeleton: defineAsyncComponent(
    () =>
      import(
        'src/modules/issue-list/components/skeletons/BoardListSkeleton.vue'
      ),
  ),
};

const currentIssueList = shallowRef();

watchEffect(() => {
  if (issuesLoader.value === false) {
    currentIssueList.value = false //группа
      ? components.GroupedIssueList
      : components.DefaultIssueList;
  } else {
    currentIssueList.value = false //канбан
      ? components.BoardListSkeleton
      : components.TableListSkeleton;
  }
});

onMounted(async () => {
  issuesLoader.value = true;
  sprint.value = await getSprint(
    router.currentRoute.value.params.workspace as string,
    router.currentRoute.value.params.sprint as string,
  );
  issuesLoader.value = false;
});
</script>
