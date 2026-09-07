<template>
  <q-td :props="rowInfo">
    <span class="body-2 property-cell" :class="{ 'text-grey-6': isEmpty }">
      <template v-if="property?.type === 'boolean'">
        <q-icon v-if="value === true" name="check" size="18px" />
        <span v-else>—</span>
      </template>
      <a
        v-else-if="property?.type === 'link' && linkUrl"
        :href="linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="property-cell__link"
        @click.stop
      >
        {{ linkTitle }}
      </a>
      <template v-else>{{ displayValue }}</template>
      <q-tooltip
        v-if="!isEmpty && displayValue.length > 30"
        anchor="bottom middle"
        self="top middle"
        >{{ displayValue }}</q-tooltip
      >
    </span>
  </q-td>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import dayjs from 'dayjs';
import {
  DtoIssueProperty,
  DtoProjectPropertyTemplate,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  rowInfo: any;
  property: DtoProjectPropertyTemplate;
}>();

// значение параметра задачи для этого шаблона (row.properties приходит с бэка
// только при include_properties=true)
const issueProperty = computed<DtoIssueProperty | undefined>(() =>
  (props.rowInfo?.row?.properties as DtoIssueProperty[] | undefined)?.find(
    (p) => p.template_id === props.property?.id,
  ),
);

const value = computed<any>(() => issueProperty.value?.value ?? null);

const linkUrl = computed<string>(() => value.value?.url ?? '');
const linkTitle = computed<string>(() => value.value?.name || linkUrl.value);

const isEmpty = computed(() => {
  const v = value.value;
  if (props.property?.type === 'boolean') return v !== true;
  if (props.property?.type === 'link') return !linkUrl.value;
  return v === null || v === undefined || v === '';
});

// контракт значений как в SelectPropertyDate: date — YYYY-MM-DD,
// datetime — unix time в секундах строкой; lookup — id строки, показываем value_label
const displayValue = computed<string>(() => {
  if (isEmpty.value) return '—';
  const v = value.value;
  switch (props.property?.type) {
    case 'lookup':
      return issueProperty.value?.value_label ?? String(v);
    case 'datetime': {
      const parsed = dayjs.unix(Number(v));
      return parsed.isValid()
        ? `${parsed.format('DD.MM.YYYY HH:mm')} (UTC${dayjs().format('Z')})`
        : String(v);
    }
    case 'date': {
      const parsed = dayjs(v);
      return parsed.isValid() ? parsed.format('DD.MM.YYYY') : String(v);
    }
    default:
      return String(v);
  }
});
</script>

<style scoped lang="scss">
.property-cell {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: middle;
}

.property-cell__link {
  color: inherit;
  text-decoration: underline;
}
</style>
