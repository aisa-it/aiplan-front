<template>
  <q-page class="fully-centered">
    <div class="column items-center">
      <BufferIcon :width="56" :height="56" />
      <h6>Пространств нет</h6>
      <span class="q-mb-sm">Создайте новое пространство</span>
      <q-btn
        :style="'width: 100%'"
        dense
        flat
        no-caps
        data-id="create-workspace"
        class="primary-btn"
        @click="open = !open"
      >
        Создать пространство
      </q-btn>
    </div>
  </q-page>
  <NewWorkspaceDialog
    v-model="open"
    @ws-name="(val) => $router.push(`/${val}`)"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';

// components
import BufferIcon from './icons/BufferIcon.vue';
import NewWorkspaceDialog from './dialogs/NewWorkspaceDialog.vue';

const open = ref(false);
</script>

<style lang="scss" scoped>
.fully-centered {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
