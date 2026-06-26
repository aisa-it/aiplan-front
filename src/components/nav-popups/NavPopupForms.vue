<template>
  <q-menu
    anchor="top end"
    self="top start"
    :offset="[8, 0]"
    max-height="70vh"
    class="nav-popup"
  >
    <div
      class="text-caption text-weight-bold text-uppercase text-grey-7 q-pt-sm q-px-md q-pb-xs non-selectable shrink"
    >
      Формы
    </div>
    <div class="scroll">
      <q-list dense>
        <q-item
          v-for="form in forms"
          :key="form.id"
          clickable
          v-ripple
          :active="route.params.formSlug === form.slug"
          active-class="nav-popup__item--active text-weight-medium"
          :to="`/${currentWorkspaceSlug}/forms/${form.slug}`"
        >
          <q-item-section side class="q-pr-sm">
            <DocumentIcon />
          </q-item-section>
          <q-item-section>
            <q-item-label class="ellipsis">
              {{ form.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    <q-separator class="shrink" />

    <q-item
      dense
      clickable
      v-ripple
      class="shrink q-py-sm text-body2"
      :to="`/${currentWorkspaceSlug}/forms`"
      v-close-popup
    >
      <q-item-section>
        <div class="text-primary">Просмотр всех форм</div>
      </q-item-section>
    </q-item>
  </q-menu>
</template>

<script setup lang="ts">
// core
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const route = useRoute();

const forms = computed(() => workspaceStore.workspaceSummary?.forms ?? []);
</script>
