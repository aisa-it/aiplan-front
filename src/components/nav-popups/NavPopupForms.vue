<template>
  <div class="nav-popup">
    <NavPopupSection title="Формы">
      <q-list dense>
        <q-item
          v-for="form in forms"
          :key="form.id"
          clickable
          v-ripple
          class="nav-popup__item"
          :to="`/${currentWorkspaceSlug}/forms/${form.slug}`"
        >
          <q-item-section avatar>
            <DocumentIcon />
          </q-item-section>
          <q-item-section>
            <q-item-label class="ellipsis">
              {{ form.title }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </NavPopupSection>
    <q-separator />

    <q-item
      clickable
      v-ripple
      class="nav-popup__footer-link"
      :to="`/${currentWorkspaceSlug}/forms`"
      v-close-popup
    >
      Просмотр всех форм
    </q-item>
  </div>
</template>

<script setup lang="ts">
// core
import { computed } from 'vue';
import { storeToRefs } from 'pinia';

// stores
import { useWorkspaceStore } from 'src/stores/workspace-store';

// components
import NavPopupSection from './NavPopupSection.vue';
import DocumentIcon from 'src/components/icons/DocumentIcon.vue';

const workspaceStore = useWorkspaceStore();
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

const forms = computed(() => workspaceStore.workspaceSummary?.forms ?? []);
</script>
