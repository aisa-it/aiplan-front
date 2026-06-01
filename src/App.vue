<template>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

const $q = useQuasar();
$q.dark.set(JSON.parse(localStorage.getItem('dark') as string) ?? false);
</script>
