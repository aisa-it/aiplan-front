<template>
  <div>
    <h6>Выберите проект Jira</h6>
    <q-form
      v-if="!loading"
      class="jira-project-wrapper"
      ref="formRef"
      @submit="setJiraProject()"
      @reset="getBack()"
    >
      <q-select
        v-if="importStore.importJiraInfo"
        v-model="project"
        dense
        label="Проект"
        class="base-selector"
        options-dense
        map-options
        clearable
        behavior="menu"
        :rules="[(val) => val || 'Выберите проект для переноса']"
        :options="importStore.importJiraInfo.projects"
      >
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <div class="row centered-horisontally">
                <q-avatar size="24px" class="q-mr-sm">
                  <q-img
                    :src="scope.opt.avatarUrls['24x24']"
                    class="img-cover"
                  ></q-img>
                </q-avatar>
                {{ scope.opt.name }}
              </div>
            </q-item-section>
          </q-item>
        </template>

        <template v-slot:selected>
          <q-avatar size="16px" class="q-mr-sm">
            <q-img
              :src="project?.avatarUrls?.['24x24']"
              class="img-cover"
            ></q-img>
          </q-avatar>
          <span class="centered-horisontally">
            {{ project?.name }}
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
import { onMounted, ref } from 'vue';
// stores
import { useImportStore } from 'src/modules/import-jira/stores/import-store';
// interfaces
import { IImportJiraProject } from 'src/interfaces/jira';

// emits
const emits = defineEmits(['next', 'to-finish', 'get-back', 'to-import']);

// store
const importStore = useImportStore();

// vars
const project = ref(importStore.jiraProject);
const loading = ref(false);

// function
const setJiraProject = async () => {
  loading.value = true;
  importStore.importInfo =
    importStore.userImports?.find(
      (el) => el.project_key == project.value?.key && el.finished === false,
    ) || null;

  await importStore
    .getImportInfo(importStore.importInfo?.id)
    .then((data) => {
      if (data.finished === false) {
        emits('to-import');
        return;
      }

      emits('next');
    })
    .catch(() => {
      emits('next');
    })
    .finally(() => {
      loading.value = false;
    });

  await importStore.setJiraProject(project.value as IImportJiraProject);
  emits('next');
};

const getBack = () => {
  emits('get-back');
  importStore.jiraProject = null;
};

onMounted(() => {
  project.value = importStore.jiraProject;
});
</script>

<style scoped lang="scss">
.jira-project-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
