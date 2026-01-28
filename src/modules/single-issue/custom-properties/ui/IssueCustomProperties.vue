<template>
  <div v-if="properties.length > 0">
    <div class="col">
      <div class="row items-center q-mb-md">
        <ListDotIcon class="issue-icon" />
        <span class="q-ml-sm"> Кастомные параметры </span>
      </div>
    </div>
    <div class="q-gutter-y-sm">
      <div
        v-for="prop in properties"
        :key="prop.id"
        class="row items-center q-py-xs"
      >
        <div class="col-4 word-wrap q-pr-sm">
          {{ prop.name }}
        </div>

        <div class="col-8">
          <div v-if="prop.type === 'boolean'">
            <q-checkbox
              :model-value="!!prop.value"
              @update:model-value="
                (val) => {
                  prop.value = val;
                  updateValue(prop, val);
                }
              "
            />
          </div>

          <div v-else>
            <q-input
              class="base-input"
              :model-value="(prop.value as string) || ''"
              @update:model-value="
                (val) => {
                  prop.value = val as string;
                  updateValue(prop, val);
                }
              "
              debounce="1000"
              dense
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//core
import { ref, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';

//stores
import { useProjectStore } from 'src/stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

//api
import {
  getIssueProperties,
  updateIssueProperty,
} from 'src/modules/single-issue/services/api';
import { DtoIssueProperty } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//components
import ListDotIcon from 'src/components/icons/ListDotIcon.vue';

//stores
const projectStore = useProjectStore();
const singleIssueStore = useSingleIssueStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

const { currentProjectID } = storeToRefs(projectStore);
const { currentIssueID } = storeToRefs(singleIssueStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const properties = ref<DtoIssueProperty[]>([]);

//methods
const fetchData = async () => {
  if (!currentIssueID.value) return;
  try {
    const data = await getIssueProperties(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      currentIssueID.value,
    );
    properties.value = [...data];
  } catch (e) {
    console.error('Failed to load properties', e);
  }
};

const updateValue = async (prop: DtoIssueProperty, newValue: any) => {
  try {
    await updateIssueProperty(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      currentIssueID.value as string,
      prop.template_id as string,
      newValue,
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Параметр сохранен',
    });
  } catch (e) {
    console.error(e);
    setNotificationView({
      open: true,
      type: 'error',
      customMessage: 'Ошибка сохранения',
    });
  }
};

//lifecycle hooks
watch(() => currentIssueID.value, fetchData);
onMounted(fetchData);
</script>
