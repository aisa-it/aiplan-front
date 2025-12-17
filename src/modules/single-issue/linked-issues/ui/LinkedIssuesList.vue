<template>
  <q-card>
    <q-list class="issue-subtask__list" dense bordered separator>
      <q-item
        v-for="i in issues"
        :key="i.id"
        clickable
        v-ripple
        class="issue-subtask__item border-light centered-horisontally"
      >
        <router-link
          :target="user.theme.open_in_new ? '_blank' : ''"
          class="q-mr-xs justify-between full-w"
          style="
            color: inherit;
            text-decoration: none;
            max-width: calc(100% - 30px);
          "
          :to="getUrl(i)"
        >
          <q-item-label class="abbriviated-text">
            <q-badge
              rounded
              class="q-mr-xs"
              :style="{
                backgroundColor: statesCache[i.project]?.find(
                  (state) => state?.id === i.state,
                )?.color,
              }"
              ><HintTooltip>{{
                statesCache[i.project]?.find((state) => state?.id === i.state)
                  ?.name
              }}</HintTooltip></q-badge
            >

            {{ props.project_detail?.identifier ?? project?.identifier }}-{{
              i?.sequence_id
            }}
            {{ i.name }}
          </q-item-label>
        </router-link>
        <q-item-section side
          ><q-btn
            v-if="hasPermissionByIssue"
            flat
            icon="close"
            dense
            size="xs"
            @click="emits('removeIssue', i?.id)"
        /></q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
//stores
import { DtoProject } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { storeToRefs } from 'pinia';
import { useProjectStore } from 'src/stores/project-store';
import { useStatesStore } from 'src/stores/states-store';
import { useUserStore } from 'src/stores/user-store';

//core
import { computed } from 'vue';

const props = defineProps<{
  project_detail?: DtoProject;
  linkedIssues: any[];
  hasPermissionByIssue: boolean | 'author';
}>();

const emits = defineEmits(['update:linkedIssues', 'removeIssue']);

const userStore = useUserStore();
const statesStore = useStatesStore();
const projectStore = useProjectStore();

const { user } = storeToRefs(userStore);
const { project } = storeToRefs(projectStore);
const { statesCache } = storeToRefs(statesStore);

const issues = computed({
  get: () => props.linkedIssues,
  set: (val: any[]) => emits('update:linkedIssues', val),
});

const getUrl = (value: {
  workspace: string;
  project: string;
  sequence_id: string;
}) => {
  return `/${value.workspace}/projects/${value.project}/issues/${value?.sequence_id}`;
};
</script>

<style scoped lang="scss">
:deep(.q-item__section--side) {
  min-width: 20px !important;
  padding-right: 0;
  align-self: center;
  padding-left: 16px;
}

.issue-subtask__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 0;
}

.issue-subtask__item {
  padding: 2px 16px;
  border-radius: $radius;

  border-color: $dark-border-color !important;
}

.issue-subtask {
  padding: 20px 0;
}
</style>
