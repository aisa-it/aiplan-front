<template>
  <div>
    <div class="spoiler-form">
      <q-icon
        @click="isCollapsed = !isCollapsed"
        name="keyboard_arrow_down"
        class="cursor-pointer"
        :class="isCollapsed ? 'rotate-180' : 'rotate-360'"
        size="25px"
      />
      <span class="text-weight-bold q-ml-xs">
        {{ label }}
        <span v-if="required" class="negative-text">*</span>
      </span>
    </div>
    <div
      v-if="isCollapsed && validate?.opt?.length"
      class="spoiler-wrapper-form"
    >
      <div v-for="(el, index) in validate.opt" :key="index">
        <q-checkbox
          :label="el"
          @update:model-value="updateValue(el, index)"
          :model-value="
            modelValue.some((item) => item.index === index && item.value === el)
          "
        />
      </div>
    </div>
    <div
      v-if="isCollapsed && !validate?.opt?.length"
      class="spoiler-wrapper-form"
    >
      <span style="color: gray">Варианты ответа отсутствуют</span>
    </div>
    <div v-if="errorMessage" class="q-mb-sm">
      <div class="negative-text">
        <span
          class="centered-horisontally"
          style="font-size: 11px; line-height: 1"
        >
          {{ errorMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  type: { type: String, required: true },
  modelValue: { type: Array, required: true, default: () => [] },
  label: { type: String, required: true },
  validate: { type: Object, required: true, default: () => ({ opt: [] }) },
  required: { type: Boolean, required: false },
  errorMessage: { type: String, required: false },
});

const emits = defineEmits(['update:modelValue']);

const arr = ref([]);
const isCollapsed = ref(false);

const updateValue = (val, index) => {
  arr.value = [...props.modelValue];
  const uniqueVal = { value: val, index };
  const arrayIndex = arr.value.findIndex(
    (el) => el.index === index && el.value === val,
  );
  if (props.type === 'multiselect') {
    if (arrayIndex !== -1) {
      arr.value.splice(arrayIndex, 1);
    } else {
      arr.value.push(uniqueVal);
    }
  } else {
    if (arrayIndex !== -1) {
      arr.value = [];
    } else {
      arr.value = [uniqueVal];
    }
  }
  emits(
    'update:modelValue',
    arr.value.map((el) => ({ value: el.value, index: el.index })),
  );
};
</script>

<style lang="scss">
.spoiler-form {
  display: flex;
  align-items: center;
}
.spoiler-form:hover {
  background-color: rgba($color: #ffffff, $alpha: 0.1);
  border-radius: 8px;
  transition: background-color 0.2s ease;
}
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.4s ease;
}
.rotate-360 {
  transform: rotate(360deg);
  transition: transform 0.4s ease;
}
.spoiler-wrapper-form {
  padding-left: 30px;
}
</style>
