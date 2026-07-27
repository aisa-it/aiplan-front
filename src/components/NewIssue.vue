<template>
  <v-btn size="small" :ripple="false" class="create-btn">
    <AddIcon color="#fff" :width="24" :height="24" />
    <span>Создать</span>
  </v-btn>
</template>

<script setup lang="ts">
import AddIcon from '@/components/icons/AddIcon.vue'
</script>

<style scoped>
.create-btn {
  background-color: #3f75ff !important;
  color: #fff !important;
  border-radius: 8px !important;
  height: calc(var(--v-btn-height) + 4px) !important;
  padding-inline: 8px !important;
  letter-spacing: normal;
  text-transform: none;
  font-weight: 500 !important;
  font-size: 14px !important;
}

.create-btn :deep(.v-btn__content) {
  gap: 4px;
  align-items: center;
  line-height: 1;
}

.create-btn span {
  line-height: 1;
  transform: translateY(-1px);
}
</style>
