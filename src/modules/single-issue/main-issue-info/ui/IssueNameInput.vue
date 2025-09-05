<template>
  <span
    v-show="props.isReadonly"
    class="base-title text-bold full-w centered-horisontally"
  >
    {{ issueData.name }}
  </span>
  <q-input
    v-if="!props.isReadonly"
    v-model="issueData.name"
    class="base-textarea full-w"
    dense
    autogrow
    hide-bottom-space
    :rules="[
      (val) =>
        (val.trim() && val.trim().length > 0) || 'Необходимо ввести название',
    ]"
    @click.stop
    @touchstart.stop
  >
    <template v-slot:append> </template>
  </q-input>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { useSingleIssueStore } from 'src/stores/single-issue-store';

const singleIssueStore = useSingleIssueStore();

// store to refs
const { issueData } = storeToRefs(singleIssueStore);

const props = defineProps(['isReadonly']);
</script>
