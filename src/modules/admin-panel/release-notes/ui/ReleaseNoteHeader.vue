<template>
  <AdminHeader :title="'Версии'" isFlex>
    <CreateButton @click="$emit('create')" />
  </AdminHeader>
</template>

<script setup lang="ts">
import AdminHeader from '../../ui/AdminHeader.vue';
import CreateButton from './CreateButton.vue';
defineEmits<{ create: [] }>();
</script>

<style scoped lang="scss">
.admin-header {
  justify-content: space-between;
}
@media screen and (max-width: 400px) {
  .admin-header {
    flex-direction: row;
    align-items: center;
  }
}
</style>
