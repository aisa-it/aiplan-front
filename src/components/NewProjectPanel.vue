<template>
  <q-card class="new-issue-card">
    <q-card-section> Нет проектов </q-card-section>

    <q-card-actions align="right" class="new-issue-buttons">
      <q-btn
        flat
        dense
        no-caps
        class="secondary-button"
        label="Отмена"
        @click="$emit('cancel')"
      />
      <q-btn
        flat
        dense
        no-caps
        class="primary-button new-issue-panel__add-btn"
        @click="handleCreateProject"
      >
        Создать
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
const emits = defineEmits<{
  'handle-create-project': [];
  cancel: [];
}>();

function handleCreateProject() {
  emits('handle-create-project');
}
</script>
<style scoped>
.new-issue-card {
  min-width: 20% !important;
  min-height: 10%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
