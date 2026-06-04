<template>
  <q-avatar
    data-id="workspace-avatar"
    style="font-size: 32px; border-radius: 8px"
    :square="true"
  >
    <q-img
      v-if="workspaceLogo"
      :src="srcWorkspaceLogo"
      :style="'object-fit: cover; width: 100%; height: 100%; background-color: inherit; color: inherit'"
    >
      <template #error>
        <NoneAvatar :workspaceName="workspaceName" />
      </template>
    </q-img>

    <NoneAvatar v-else :workspaceName="workspaceName" />

    <!-- <HatXmasIcon
        v-if="ny"
        :class="ny ? 'q-mt-xs hat-overlay' : 'hat-overlay'"
        :width="36"
        :height="36"
        :style="
          userStore.getTheme === 'light'
            ? 'filter: drop-shadow(-3px -1px 4px rgba(0, 0, 0, 0.7));'
            : ''
        "
      /> -->
  </q-avatar>
</template>

<script setup lang="ts">
import { getUrlFile } from 'src/utils/helpers';
import { computed } from 'vue';
import NoneAvatar from './NoneAvatar.vue';

const props = defineProps<{
  workspaceLogo: string | undefined | null;
  workspaceName: string | undefined;
}>();

const srcWorkspaceLogo = computed(() => {
  return props.workspaceLogo ? getUrlFile(props.workspaceLogo) : '';
});
</script>
