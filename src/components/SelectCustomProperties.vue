<template>
  <div v-if="properties.length > 0 || isLoading">
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
        <div class="col-4 word-wrap q-pr-sm">{{ prop.name }}</div>

        <div class="col-8">
          <q-checkbox v-if="prop.type === 'boolean'" v-model="prop.value" />

          <q-select
            v-else-if="prop.type === 'select'"
            class="base-selector issue-selector"
            v-model="prop.value"
            :options="(prop as any).options || []"
            dense
            clearable
            emit-value
            map-options
          />

          <LinkItem
            v-else-if="prop.type === 'link'"
            :link="{
              id: prop.id,
              title: prop.value?.name,
              url: prop.value?.url,
            }"
            disableDelete
            @update="openLinkDialog(prop)"
          />

          <SelectDictionaryRow
            v-else-if="prop.type === 'lookup'"
            class="issue-selector"
            :dictionary-id="(prop.dictionary_id as string) || ''"
            v-model="prop.value"
          />

          <SelectPropertyDate
            v-else-if="prop.type === 'date' || prop.type === 'datetime'"
            :type="prop.type as 'date' | 'datetime'"
            v-model="prop.value"
          />

          <q-input v-else class="base-input" v-model="prop.value" dense />
        </div>
      </div>
    </div>

    <div v-else-if="isLoading" class="q-gutter-y-sm">
      <div v-for="n in 3" :key="n" class="row items-center q-py-xs">
        <div class="col-4 q-pr-sm"><q-skeleton type="text" width="70%" /></div>
        <div class="col-8"><q-skeleton type="rect" /></div>
      </div>
    </div>

    <LinkDialog
      v-model="isLinkOpenDialog"
      :link="linkToUpdate"
      @edit="onLinkSave"
    />
  </div>
</template>

<script setup lang="ts">
//core
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

//stores
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useRolesStore } from 'src/stores/roles-store';

//api
import {
  getPropertyTemplates,
  PropertyTemplate,
} from 'src/modules/project-settings/custom-properties/services/api';
import { updateIssueProperty } from 'src/modules/single-issue/services/api';
import { DtoIssueProperty } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//components
import ListDotIcon from 'src/components/icons/ListDotIcon.vue';
import LinkItem from 'src/components/LinkItem.vue';
import LinkDialog from 'src/components/dialogs/LinkDialog.vue';
import SelectDictionaryRow from 'src/components/selects/SelectDictionaryRow.vue';
import SelectPropertyDate from 'src/modules/single-issue/custom-properties/ui/SelectPropertyDate.vue';

//props
const props = defineProps<{
  projectId: string;
  workspaceSlug?: string;
}>();

//stores
const route = useRoute();
const workspaceStore = useWorkspaceStore();
const rolesStore = useRolesStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const slug = computed(() => {
  return (
    props.workspaceSlug ||
    (route.params?.workspace as string) ||
    (currentWorkspaceSlug.value as string) ||
    ''
  );
});

//variables
const properties = ref<DtoIssueProperty[]>([]);
const isLoading = ref(false);
const isLinkOpenDialog = ref(false);
const linkToUpdate = ref();
const propToUpdate = ref<DtoIssueProperty | null>(null);

//methods
const fetchData = async () => {
  if (!props.projectId) return;

  isLoading.value = true;
  try {
    const data = await getPropertyTemplates(slug.value, props.projectId);
    let list = (data || []) as PropertyTemplate[];

    const isAdmin = rolesStore.isAdminInProject(props.projectId, slug.value);

    if (!isAdmin) {
      list = list.filter((t) => !t.only_admin);
    }

    properties.value = list
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((t) => ({
        id: t.id,
        template_id: t.id,
        name: t.name,
        type: t.type,
        options: t.options,
        dictionary_id: t.dictionary_id,
        value:
          t.type === 'boolean'
            ? false
            : t.type === 'link' ||
                t.type === 'lookup' ||
                t.type === 'date' ||
                t.type === 'datetime'
              ? null
              : '',
      }));
  } catch (e) {
  } finally {
    isLoading.value = false;
  }
};

const openLinkDialog = (prop: DtoIssueProperty) => {
  isLinkOpenDialog.value = true;
  linkToUpdate.value = {
    id: prop.id,
    title: prop.value?.name,
    url: prop.value?.url,
  };
  propToUpdate.value = prop;
};

const onLinkSave = (link: any) => {
  if (propToUpdate.value) {
    propToUpdate.value.value = { url: link.url, name: link.title };
  }
};

//TODO: Когда изменится запрос на создание задачи или можно будет сразу обновлять несколько полей через updateIssuesProperty, этот метод надо удалить/поменять
const saveProperties = async (createdIssueId: string) => {
  if (!properties.value || properties.value.length === 0 || !props.projectId)
    return;

  const savePromises = properties.value
    .filter(
      (prop) =>
        prop.value !== undefined && prop.value !== null && prop.value !== '',
    )
    .map((prop) => {
      let value = prop.value;
      if (prop.type === 'link') {
        if (!value?.url) return null;
        value = {
          url: value.url,
          name: value.name || value.title || value.url,
        };
      }

      return updateIssueProperty(
        slug.value,
        props.projectId,
        createdIssueId,
        prop.template_id as string,
        value,
      );
    })
    .filter(Boolean);

  if (savePromises.length > 0) {
    await Promise.all(savePromises);
  }
};

defineExpose({
  saveProperties,
  properties,
});

//lifecycle hooks
watch(() => props.projectId, fetchData);
onMounted(fetchData);
</script>

<style scoped lang="scss">
.issue-selector {
  max-width: 100%;
  min-width: 100%;
}
</style>
