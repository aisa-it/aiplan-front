<template>
  <q-list
    class="flex column w-full"
    style="height: fit-content; max-height: 100%"
  >
    <q-item
      v-for="issue in issues"
      :key="issue.id"
      clickable
      class="base-chip--bordered q-mt-sm rounded-borders"
      style="border-radius: 8px"
    >
      <q-item-section avatar>
        <q-checkbox
          :model-value="modelValue.includes(issue.id)"
          @update:model-value="(checked) => onCheck(issue.id, checked)"
        />
      </q-item-section>
      <q-item-section>
        {{ issue.name }}
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
const props = defineProps<{
  issues: { id: string; name: string }[];
  modelValue: string[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

function onCheck(id: string, checked: boolean) {
  const newValue = checked
    ? [...props.modelValue, id]
    : props.modelValue.filter((v) => v !== id);
  emit('update:modelValue', newValue);
}
</script>
