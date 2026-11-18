<template>
  <span class="block w-full min-w-0 truncate" :title="display.text">
    <v-icon
      v-if="property.type === 'boolean' && display.checked"
      icon="mdi-check"
      size="18"
    />
    <a
      v-else-if="display.linkUrl"
      :href="display.linkUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="underline"
      @click.stop
      >{{ display.text }}</a
    >
    <template v-else>{{ display.text }}</template>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import dayjs from 'dayjs';
import type {
  DtoIssueProperty,
  DtoIssueWithCount,
  DtoProjectPropertyTemplate,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  issue: DtoIssueWithCount;
  property: DtoProjectPropertyTemplate;
}>();
const { t } = useI18n();
const display = computed(() => {
  const properties = (
    props.issue as DtoIssueWithCount & {
      properties?: (DtoIssueProperty & { value_label?: string })[];
    }
  ).properties;
  const item = properties?.find(
    (value) => value.template_id === props.property.id,
  );
  const value = item?.value;
  if (props.property.type === 'boolean') {
    return {
      text: value === true ? t('issues.property.yes') : '—',
      checked: value === true,
    };
  }
  if (props.property.type === 'link') {
    const url = value?.url as string | undefined;
    return { text: value?.name || url || '—', linkUrl: url };
  }
  if (props.property.type === 'multiselect') {
    return {
      text:
        Array.isArray(value) && value.length
          ? value.map(String).join(', ')
          : '—',
    };
  }
  if (value === null || value === undefined || value === '')
    return { text: '—' };
  if (props.property.type === 'lookup')
    return { text: item?.value_label ?? String(value) };
  if (props.property.type === 'date') {
    const date = dayjs(value);
    return { text: date.isValid() ? date.format('DD.MM.YYYY') : String(value) };
  }
  if (props.property.type === 'datetime') {
    const date = dayjs.unix(Number(value));
    return {
      text: date.isValid()
        ? `${date.format('DD.MM.YYYY HH:mm')} (UTC${dayjs().format('Z')})`
        : String(value),
    };
  }
  return { text: String(value) };
});
</script>
