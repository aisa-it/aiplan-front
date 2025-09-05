<template>
  <span
    >{{
      route.fullPath.includes('signin') || route.fullPath.includes('signup')
        ? version
        : version.split('v')[1]
    }}
  </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useUtilsStore } from 'src/stores/utils-store';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AiplanVersion',
  setup() {
    const utilsStore = useUtilsStore();
    const route = useRoute();
    const { version } = storeToRefs(utilsStore);

    return {
      route,
      version,
    };
  },
});
</script>
