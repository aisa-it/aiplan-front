<template>
  <v-btn :ripple="false" class="create-btn">
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
  height: 32px !important;
  min-height: 32px !important;
  padding: 0 8px !important;
  letter-spacing: 0.75px;
  text-transform: none;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 18px;
}

.create-btn :deep(.v-btn__content) {
  gap: 4px;
  align-items: center;
  line-height: 1;
}

.create-btn span {
  line-height: 1;
}
</style>
