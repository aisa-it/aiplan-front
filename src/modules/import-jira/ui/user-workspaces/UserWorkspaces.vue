<template>
  <div>
    <h6>Выберите пространство</h6>
    <q-form
      v-if="!loading"
      class="user-workspaces-wrapper"
      ref="formRef"
      @submit="setUserWs()"
      @reset="getBack()"
    >
      <q-select
        v-model="workspace"
        dense
        label="Пространство"
        options-dense
        map-options
        clearable
        behavior="menu"
        class="base-selector"
        :options="filterOptions"
        :rules="[(val) => val || 'Выберите пространство для переноса']"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <div class="row centered-horisontally">
                {{ scope.opt.name }}
              </div>
            </q-item-section>
          </q-item>
        </template>

        <template v-slot:selected>
          <span class="centered-horisontally">
            {{ workspace?.name }}
          </span>
        </template>
      </q-select>
      <div class="row justify-between">
        <q-btn no-caps class="secondary-btn" type="reset"> Назад </q-btn>
        <q-btn no-caps class="primary-btn" type="submit"> Далее </q-btn>
      </div>
    </q-form>
    <q-inner-loading v-else showing color="primary" />
  </div>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { computed, onMounted, ref } from 'vue';
// stores
import { useUserStore } from 'src/stores/user-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useImportStore } from 'src/modules/import-jira/stores/import-store';

// emits
const emits = defineEmits(['next', 'get-back']);

// stores
const userStore = useUserStore();
const importStore = useImportStore();
const workspaceStore = useWorkspaceStore();

// stores to ref
const { userWorkspaces } = storeToRefs(userStore);
const { workspaceInfo } = storeToRefs(workspaceStore);
// vars
const workspace = ref(importStore.userWs);
const loading = ref(false);

// computed
const filterOptions = computed(() => {
  return userWorkspaces.value.filter(
    (ws) => ws?.current_user_membership?.role === 15,
  );
});

onMounted(() => {
  workspace.value = workspaceInfo?.value;
});
// functions
const setUserWs = async () => {
  loading.value = true;
  await importStore.setUserWs(workspace.value);
  emits('next');
};

const getBack = () => {
  emits('get-back');
  importStore.userWs = null;
};
</script>

<style scoped lang="scss">
.user-workspaces-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
