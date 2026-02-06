<template>
  <div>
    <div class="col">
      <div class="row items-center q-mb-md">
        <ListDotIcon class="issue-icon" />
        <span class="q-ml-sm"> Дополнительные параметры </span>
      </div>
    </div>
    <div class="q-gutter-y-sm" v-if="properties.length > 0 && !isLoading">
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

          <div v-else-if="prop.type === 'select'">
            <q-select
              class="base-selector issue-selector"
              :model-value="(prop.value as string) || null"
              @update:model-value="
                (val) => {
                  prop.value = val as string;
                  updateValue(prop, val);
                }
              "
              :options="(prop as any).options || []"
              dense
              clearable
              emit-value
              map-options
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
    <div v-if="isLoading" class="q-gutter-y-sm">
      <div v-for="n in 3" :key="n" class="row items-center q-py-xs">
        <div class="col-4 q-pr-sm">
          <q-skeleton type="text" width="70%" />
        </div>
        <div class="col-8">
          <q-skeleton type="rect" />
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

//props
const props = defineProps<{
  projectId: string;
  issueId: string;
}>();

//stores
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const properties = ref<DtoIssueProperty[]>([]);
const isLoading = ref(false);

//methods
const fetchData = async () => {
  if (!props.issueId) return;
  isLoading.value = true;
  try {
    const data = await getIssueProperties(
      currentWorkspaceSlug.value as string,
      props.projectId,
      props.issueId,
    );
    properties.value = [...data];
  } catch (e) {
    console.error('Failed to load properties', e);
  } finally {
    isLoading.value = false;
  }
};

const updateValue = async (prop: DtoIssueProperty, newValue: any) => {
  try {
    await updateIssueProperty(
      currentWorkspaceSlug.value as string,
      props.projectId,
      props.issueId,
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
watch(() => props.issueId, fetchData);
onMounted(fetchData);
</script>

<style scoped lang="scss">
.issue-selector {
  max-width: 100%;
  min-width: 100%;
}
</style>
