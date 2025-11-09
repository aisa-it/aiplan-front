<template>
  <q-item
    class="centered-horisontally menu-link"
    clickable
    :active="route.params.formSlug === form?.slug"
    @click="router.push(`/${route.params.workspace}/forms/${form?.slug}`)"
  >
    <DocumentIcon class="q-mr-sm" />
    <span class="abbriviated-text">
      {{ form?.title }}
    </span>
    <slot />
  </q-item>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { DtoFormLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

import DocumentIcon from 'src/components/icons/DocumentIcon.vue';

defineProps<{ form: DtoFormLight }>();

const route = useRoute();
const router = useRouter();
</script>
