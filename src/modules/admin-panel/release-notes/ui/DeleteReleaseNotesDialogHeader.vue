<template>
  <q-card-section class="column q-pt-none">
    <h6 class="q-ml-md">Удаление релиза</h6>
    <span>
      Вы действительно хотите удалить версию релиза
      <b>{{ tag_name }}</b
      >?
    </span>
    <span>Данную операцию нельзя будет отменить.</span>
  </q-card-section>
</template>

<script setup lang="ts">
defineProps<{ tag_name: string }>();
</script>
