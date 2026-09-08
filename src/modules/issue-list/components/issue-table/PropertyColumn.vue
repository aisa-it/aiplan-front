<template>
  <q-td :props="rowInfo">
    <span
      class="body-2 property-cell"
      :class="{ 'text-grey-6': display.isEmpty }"
    >
      <template v-if="property?.type === 'boolean'">
        <q-icon v-if="display.checked" name="check" size="18px" />
        <span v-else>—</span>
      </template>
      <a
        v-else-if="display.linkUrl"
        :href="display.linkUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="property-cell__link"
        @click.stop
      >
        {{ display.text }}
      </a>
      <template v-else>{{ display.text }}</template>
      <q-tooltip
        v-if="!display.isEmpty && display.text.length > 30"
        anchor="bottom middle"
        self="top middle"
        >{{ display.text }}</q-tooltip
      >
    </span>
  </q-td>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DtoProjectPropertyTemplate } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import {
  findIssueProperty,
  formatPropertyValue,
} from '../../utils/propertyDisplay';

const props = defineProps<{
  rowInfo: any;
  property: DtoProjectPropertyTemplate;
}>();

const display = computed(() =>
  formatPropertyValue(
    props.property?.type,
    findIssueProperty(props.rowInfo?.row, props.property?.id),
  ),
);
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
