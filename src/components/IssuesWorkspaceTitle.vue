<template>
  <div class="col-2 q-table-sub-title" :style="{ paddingLeft: '10px' }">
    {{ user.first_name }} {{ user.last_name }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import aiplan from 'src/utils/aiplan';

export default defineComponent({
  name: 'IssuesUserTitle',
  props: ['user', 'count', 'placeholder'],
  setup() {
    return {
      avatarText: aiplan.UserName,
    };
  },
});
</script>
