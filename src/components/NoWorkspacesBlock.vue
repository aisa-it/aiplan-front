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

<script lang="ts">
// core
import { storeToRefs } from 'pinia';
import { defineComponent, ref } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';

// components
import BufferIcon from './icons/BufferIcon.vue';
import NewWorkspaceDialog from './dialogs/NewWorkspaceDialog.vue';

export default defineComponent({
  name: 'NoWorkspacesBlock',
  components: {
    NewWorkspaceDialog,
    BufferIcon,
  },

  setup() {
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    return {
      user,
      open: ref(false),
    };
  },
});
</script>

<style lang="scss" scoped>
.fully-centered {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
