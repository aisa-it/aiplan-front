<template>
  <q-card
    class="column issue-panel__comments-card flex-grow"
    flat
    :style="'position: relative; width: 100%'"
  >
    <h6 class="q-px-sm">Активность</h6>
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="comments" label="Комментарии" />
      <q-tab name="activity" label="Активность" />
    </q-tabs>
    <div class="full-w flex-grow">
      <transition name="fade-slide" mode="out-in">
        <q-tab-panels v-model="tab" class="full-height" keep-alive>
          <q-tab-panel ref="tabComments" name="comments">
            <AidocActivityComments />
          </q-tab-panel>
          <q-tab-panel ref="tabActivity" name="activity">
            <div
              v-if="!docActivitiesData?.activities?.length"
              class="body-1 text-dark q-my-lg q-px-sm"
            >
              Для этого документа еще нет активности
            </div>
            <SelectActivity
              :activitiesData="docActivitiesData"
              @refreshData="getActivityData"
            />
          </q-tab-panel>
        </q-tab-panels>
      </transition>
    </div>
  </q-card>
</template>
<script lang="ts" setup>
// core
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
// store
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useWorkspaceStore } from 'stores/workspace-store';
// components
import SelectActivity from 'src/components/SelectActivity.vue';
import AidocActivityComments from './AidocActivityComments.vue';

// stores
const workspaceStore = useWorkspaceStore();
const aidocStore = useAiDocStore();

// store to refs
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const props = defineProps({
  documentId: {
    type: String,
    required: true,
  },
});

//vars
const tab = ref('comments');
const tabComments = ref();
const tabActivity = ref();
const docActivitiesData = ref();

const getActivityData = async (page: number, pageSize: number) => {
  const data = await aidocStore.getDocActivityList(
    currentWorkspaceSlug.value as string,
    props.documentId,
    page,
    pageSize,
  );
  docActivitiesData.value = { ...data, activities: data.result };
};

</script>

<style lang="scss" scoped>
.q-tab-panels.q-panel-parent {
  width: 100%;
}

:deep(.q-tab-panel) {
  padding: 0;
}
</style>
