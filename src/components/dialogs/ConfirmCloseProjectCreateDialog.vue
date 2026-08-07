<template>
  <v-dialog v-model="isOpen" max-width="650">
    <v-card class="rounded-2xl">
      <v-card-text class="flex flex-col pt-6 pb-4 px-6">
        <h6 class="text-lg font-weight-bold mb-4 text-gray-800">
          Закрыть создание проекта
        </h6>
        <span class="text-sm text-gray-700">
          Вы уверены, что хотите закрыть окно? Все внесенные данные будут
          утеряны.
        </span>
      </v-card-text>
      <v-card-actions class="pt-0 pr-6 pb-6 justify-end gap-3 mt-2">
        <v-btn
          variant="outlined"
          color="primary"
          @click="isOpen = false"
          class="w-[110px]"
        >
          Вернуться
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          @click="onClose"
          class="w-[110px]"
        >
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>();
const emit = defineEmits<{ close: [] }>();

const onClose = () => {
  isOpen.value = false;
  emit('close');
};
</script>
