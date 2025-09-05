<template>
  <div class="q-mb-md" style="font-size: 15px">
    <div class="q-mb-xs"><b>Пользователь:</b> {{ userName }}</div>
    <div><b>Email:</b> {{ userEmail }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ userName: string; userEmail: string }>();
</script>
