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
        <div class="col-12 col-sm-4 word-wrap q-pr-sm">
          {{ prop.name }}
        </div>

        <div class="col-12 col-sm-8 q-mt-xs q-mt-sm-none">
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
              :options="
                selectOptions[prop.template_id || ''] ||
                (prop as any).options ||
                []
              "
              dense
              clearable
              emit-value
              map-options
            />
          </div>

          <div v-else-if="prop.type === 'link'">
            <LinkItem
              :link="{
                id: prop.id,
                title: prop.value?.name,
                url: prop.value?.url,
              }"
              disableDelete
              @update="
                isLinkOpenDialog = true;
                linkToUpdate = {
                  id: prop.id,
                  title: prop.value?.name,
                  url: prop.value?.url,
                };
                propToUpdate = prop;
              "
            />
          </div>

          <div v-else-if="prop.type === 'lookup'">
            <SelectLookupValue
              class="issue-selector"
              :project-id="props.projectId"
              :issue-id="props.issueId"
              :template-id="prop.template_id || ''"
              :model-value="(prop.value as string) || null"
              :current-label="prop.value_label"
              :reset-signal="resetSignals[prop.template_id || ''] || 0"
              @update:model-value="
                (val) => {
                  prop.value = val;
                  updateValue(prop, val);
                }
              "
            />
          </div>

          <div v-else-if="prop.type === 'date' || prop.type === 'datetime'">
            <SelectPropertyDate
              :type="prop.type"
              :model-value="(prop.value as string) || null"
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
      <LinkDialog
        v-model="isLinkOpenDialog"
        :link="linkToUpdate"
        @edit="(link) => updateValue(propToUpdate, link)"
      />
    </div>
    <div v-if="isLoading" class="q-gutter-y-sm">
      <div v-for="n in 3" :key="n" class="row items-center q-py-xs">
        <div class="col-12 col-sm-4 q-pr-sm">
          <q-skeleton type="text" width="70%" />
        </div>
        <div class="col-12 col-sm-8 q-mt-xs q-mt-sm-none">
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
  getAvailablePropertyValues,
  INCOMPATIBLE_VALUE_ERROR_CODE,
} from 'src/modules/single-issue/services/api';
import { DtoIssueProperty } from '@aisa-it/aiplan-api-ts/src/data-contracts';

//components
import ListDotIcon from 'src/components/icons/ListDotIcon.vue';
import LinkItem from 'src/components/LinkItem.vue';
import LinkDialog from 'src/components/dialogs/LinkDialog.vue';
import SelectLookupValue from './SelectLookupValue.vue';
import SelectPropertyDate from './SelectPropertyDate.vue';

//props
const props = defineProps<{
  projectId: string;
  issueId: string;
  offSuccessNotification?: boolean;
}>();

//stores
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

//variables
const properties = ref<DtoIssueProperty[]>([]);
const isLoading = ref(false);
const isLinkOpenDialog = ref(false);
const linkToUpdate = ref();
const propToUpdate = ref();

// допустимые варианты select-полей (единая ручка available-values, BAK-366)
const selectOptions = ref<Record<string, string[]>>({});
// счётчики сброса кэша lookup-селектов при каскадном обновлении
const resetSignals = ref<Record<string, number>>({});

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
    selectOptions.value = {};
    await refreshAllOptions();
  } catch (e) {
    console.error('Failed to load properties', e);
  } finally {
    isLoading.value = false;
  }
};

// допустимые варианты одного select-поля
const refreshSelectOptions = async (templateId: string) => {
  try {
    const res = await getAvailablePropertyValues(
      currentWorkspaceSlug.value as string,
      props.projectId,
      props.issueId,
      templateId,
    );
    selectOptions.value[templateId] = res.options || [];
  } catch (e) {
    console.error(e);
  }
};

// загрузка вариантов всех select-полей
const refreshAllOptions = async () => {
  const promises = properties.value
    .filter((prop) => prop.type === 'select' && prop.template_id)
    .map((prop) => refreshSelectOptions(prop.template_id as string));
  await Promise.all(promises);
};

// перезапрос допустимых значений ребёнка (select — варианты, lookup — сброс кэша)
const refreshPropOptions = (prop: DtoIssueProperty) => {
  if (!prop.template_id) return;
  if (prop.type === 'lookup') {
    resetSignals.value[prop.template_id] =
      (resetSignals.value[prop.template_id] || 0) + 1;
  } else if (prop.type === 'select') {
    refreshSelectOptions(prop.template_id);
  }
};

// после смены значения родителя: перезапрос детей + автоподстановка
// единственного оставшегося варианта (только для select — список lookup пагинируется)
const refreshChildren = async (parentTemplateId: string) => {
  const children = properties.value.filter(
    (prop) => prop.dependency?.parent_template_id === parentTemplateId,
  );

  for (const child of children) {
    if (child.type === 'select' && child.template_id) {
      await refreshSelectOptions(child.template_id);
      const options = selectOptions.value[child.template_id] || [];
      if (!child.value && options.length === 1) {
        updateValue(child, options[0]);
      }
    } else if (child.type === 'lookup' && child.template_id) {
      // автоподстановка для lookup: restricted-список из ровно одной строки
      // (rows.count — полное число отфильтрованных строк, не размер страницы)
      if (!child.value) {
        const res = await getAvailablePropertyValues(
          currentWorkspaceSlug.value as string,
          props.projectId,
          props.issueId,
          child.template_id,
          { limit: 1 },
        );
        if (
          res.restricted === true &&
          res.rows?.count === 1 &&
          res.rows.result?.length
        ) {
          updateValue(child, res.rows.result[0].id as string);
        }
      }
      refreshPropOptions(child);
    }
  }
};

// сброс значений полей, сброшенных бэком (имена из reset_properties)
const applyResetProperties = (names: string[]) => {
  for (const prop of properties.value) {
    if (prop.name && names.includes(prop.name)) {
      prop.value = null;
      prop.value_label = null;
    }
  }
};

const updateValue = async (prop: DtoIssueProperty, newValue: any) => {
  const prevValue = prop.value;
  try {
    const saved = await updateIssueProperty(
      currentWorkspaceSlug.value as string,
      props.projectId,
      props.issueId,
      prop.template_id as string,
      prop.type === 'link'
        ? { url: newValue.url, name: newValue.title }
        : newValue,
    );
    if (!props.offSuccessNotification) {
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: 'Параметр сохранен',
      });
    }

    // бэк сбросил зависимые поля — отражаем в UI
    if (saved?.reset_properties?.length) {
      applyResetProperties(saved.reset_properties);
    }
    // значение записалось — отражаем в форме: автоподстановка и LinkDialog
    // вызывают updateValue без предварительной установки prop.value
    prop.value =
      prop.type === 'link'
        ? { name: newValue.title, url: newValue.url }
        : newValue;
    // у родителя могли быть дети — обновляем их допустимые значения
    if (prop.template_id) {
      await refreshChildren(prop.template_id);
    }

    if (prop.type === 'link' || prop.type === 'lookup') {
      // без перезагрузки всего блока: подставляем свежие значение и label
      // из ответа сохранения (для lookup бэк возвращает value_label)
      if (prop.type === 'lookup') {
        prop.value = saved?.value ?? newValue;
        prop.value_label = saved?.value_label ?? null;
      } else if (saved && 'value' in saved) {
        // в ответе есть value — берём его (в т.ч. null при очистке ссылки)
        prop.value = saved.value ?? null;
      }
    }
  } catch (e: any) {
    console.error(e);
    // 4518 — значение недопустимо при текущем значении родителя
    if (e?.response?.data?.code === INCOMPATIBLE_VALUE_ERROR_CODE) {
      prop.value = prevValue;
      setNotificationView({
        open: true,
        type: 'error',
        customMessage:
          'Значение недопустимо при текущем значении родительского параметра',
      });
      if (prop.dependency?.parent_template_id) {
        refreshChildren(prop.dependency.parent_template_id);
      }
    } else {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: 'Ошибка сохранения',
      });
    }
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
