<template>
  <q-page>
    <q-card class="single-list relative" flat dense>
      <q-card-section
        class="row issue-list__header"
        :style="'padding: 12px 16px'"
      >
        <IssuesListTitle />
        <q-space />

        <FiltersList :projectId="route.params.project" :columns="allColumns" />
      </q-card-section>
      <q-separator />
      <div v-show="loading === false">
        <transition name="fade">
          <DefaultIssueList v-if="!isGroupingEnabled" />
        </transition>
        <transition name="fade">
          <GroupedIssueList v-if="isGroupingEnabled" />
        </transition>
      </div>

      <transition name="fade">
        <q-markup-table
          v-show="loading"
          style="
            position: absolute;
            z-index: 1000;
            width: 100%;
            box-shadow: none;
          "
        >
          <thead>
            <tr>
              <th class="text-left" style="width: 150px">
                <q-skeleton animation="blink" type="text" />
              </th>
              <th class="text-right">
                <q-skeleton animation="blink" type="text" />
              </th>
              <th class="text-right">
                <q-skeleton animation="blink" type="text" />
              </th>
              <th class="text-right">
                <q-skeleton animation="blink" type="text" />
              </th>
              <th class="text-right">
                <q-skeleton animation="blink" type="text" />
              </th>
              <th class="text-right">
                <q-skeleton animation="blink" type="text" />
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="n in 15" :key="n">
              <td class="text-left">
                <q-skeleton animation="blink" type="text" width="85px" />
              </td>
              <td class="text-right">
                <q-skeleton animation="blink" type="text" width="50px" />
              </td>
              <td class="text-right">
                <q-skeleton animation="blink" type="text" width="35px" />
              </td>
              <td class="text-right">
                <q-skeleton animation="blink" type="text" width="65px" />
              </td>
              <td class="text-right">
                <q-skeleton animation="blink" type="text" width="25px" />
              </td>
              <td class="text-right">
                <q-skeleton animation="blink" type="text" width="85px" />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </transition>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
// core
import { useRoute } from 'vue-router';

// stores
import { useProjectStore } from 'src/stores/project-store';

// components
import FiltersList from 'src/components/FiltersList.vue';
import IssuesListTitle from 'src/components/IssuesListTitle.vue';

// constants
import { allColumns } from './constants/tableColumns';
import { onMounted, ref } from 'vue';

// composables
import { useLoadProjectInfo } from './composables/useLoadProjectInfo';
import { storeToRefs } from 'pinia';
import DefaultIssueList from './components/DefaultIssueList.vue';
import GroupedIssueList from './components/GroupedIssueList.vue';

const { getAllProjectInfo } = useLoadProjectInfo();

const { isGroupingEnabled } = storeToRefs(useProjectStore());
const route = useRoute();
const loading = ref(true);
onMounted(async () => {
  loading.value = true;
  await getAllProjectInfo();
  loading.value = false;
});
</script>

<style>
/* Анимация появления и исчезновения */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
