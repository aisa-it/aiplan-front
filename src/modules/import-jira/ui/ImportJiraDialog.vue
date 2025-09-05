<template>
  <q-dialog @hide="resetDialog" ref="dialogRef">
    <q-card class="import-card">
      <q-card-section>
        <div class="row justify-between">
          <h6>Импорт из Jira</h6>
          <div>
            <q-btn
              flat
              dense
              size="24px"
              padding="xs"
              @click="dialogRef.hide()"
            >
              <CloseIcon></CloseIcon>
            </q-btn>
          </div>
        </div>

        <div class="row justify-between no-wrap q-mb-md">
          <div class="row centered-horisontally">
            <FinishedStep v-if="step > 1" :width="24" :height="24" />
            <AuthIcon
              v-else
              :width="24"
              :height="24"
              first-color="#DDE2EA"
              :second-color="setColor(1)"
            />
            <span
              v-if="showStepText"
              class="q-ml-sm"
              :style="{ color: setColor(1) }"
            >
              Авторизация
            </span>
          </div>
          <q-separator class="separator" />
          <div class="row centered-horisontally">
            <FinishedStep v-if="step > 2" :width="24" :height="24" />
            <JiraIcon
              v-else
              :width="24"
              :height="24"
              first-color="#DDE2EA"
              :second-color="setColor(2)"
            />
            <span
              v-if="showStepText"
              class="q-ml-sm"
              :style="{ color: setColor(2) }"
            >
              Проект
            </span>
          </div>
          <q-separator class="separator" />
          <div class="row centered-horisontally">
            <FinishedStep v-if="step > 3" :width="24" :height="24" />
            <AiplanIcon
              v-else
              :width="24"
              :height="24"
              first-color="#DDE2EA"
              :second-color="setColor(3)"
            />
            <span
              v-if="showStepText"
              class="q-ml-sm"
              :style="{ color: setColor(3) }"
            >
              АИплан
            </span>
          </div>
          <q-separator class="separator" />

          <div class="row centered-horisontally">
            <FinishedStep v-if="step > 4" :width="24" :height="24" />
            <ImportSettingsIcon
              v-else
              :width="24"
              :height="24"
              first-color="#DDE2EA"
              :second-color="setColor(4)"
            />
            <span
              v-if="showStepText"
              class="q-ml-sm"
              :style="{ color: setColor(4) }"
            >
              Настройки
            </span>
          </div>
          <q-separator class="separator" />

          <div class="row centered-horisontally">
            <FinishedStep v-if="step > 5" :width="24" :height="24" />
            <ImportIcon
              v-else
              :width="24"
              :height="24"
              first-color="#DDE2EA"
              :second-color="setColor(5)"
            />
            <span
              v-if="showStepText"
              class="q-ml-sm"
              :style="{ color: setColor(5) }"
            >
              Импорт
            </span>
          </div>
          <q-separator class="separator" />

          <div class="row centered-horisontally">
            <FinishIcon
              v-if="step !== 6"
              :width="24"
              :height="24"
              first-color="#DDE2EA"
              :second-color="'#BAC4D5'"
            />
            <SuccessImportIcon v-else :width="24" :height="24" />
            <span
              v-if="showStepText"
              class="q-ml-sm"
              :style="{ color: setColor(6) }"
            >
              Готово
            </span>
          </div>
        </div>
        <component
          :is="defineComp"
          @next="step = step + 1"
          @to-import="step = 5"
          @get-back="step = step - 1"
        ></component>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
// core
import { ref, computed } from 'vue';
import { Screen } from 'quasar';
// stores
import { useImportStore } from 'src/modules/import-jira/stores/import-store';
// components
import JiraAuth from 'src/modules/import-jira/ui/jira-auth/JiraAuth.vue';
import JiraProject from 'src/modules/import-jira/ui/jira-project/JiraProject.vue';
import UserWorkspaces from 'src/modules/import-jira/ui//user-workspaces/UserWorkspaces.vue';
import ImportSettings from 'src/modules/import-jira/ui//import-settings/ImportSettings.vue';
import ImportStatus from 'src/modules/import-jira/ui//import-status/ImportStatus.vue';
import ImportFinish from 'src/modules/import-jira/ui//import-finish/ImportFinish.vue';
//icons
import CloseIcon from 'src/components/icons/CloseIcon.vue';
import AuthIcon from 'src/components/icons/import/AuthIcon.vue';
import JiraIcon from 'src/components/icons/import/JiraIcon.vue';
import AiplanIcon from 'src/components/icons/import/AiplanIcon.vue';
import ImportSettingsIcon from 'src/components/icons/import/ImportSettingsIcon.vue';
import ImportIcon from 'src/components/icons/import/ImportIcon.vue';
import FinishIcon from 'src/components/icons/import/FinishIcon.vue';
import FinishedStep from 'src/components/icons/import/FInishedStep.vue';
import SuccessImportIcon from 'src/components/icons/import/SuccessImportIcon.vue';

// vars
const step = ref(1);
const dialogRef = ref();
const importStore = useImportStore();

// порядок важен!
const components = [
  JiraAuth,
  JiraProject,
  UserWorkspaces,
  ImportSettings,
  ImportStatus,
  ImportFinish,
];

// computed
const defineComp = computed(() => components[step.value - 1]);

const showStepText = computed<boolean>(() => {
  return Screen.width > 1010;
});

// function
const resetDialog = () => {
  step.value = 1;
  importStore.clearState();
};

const setColor = (val: number): string => {
  return step.value === val ? 'var(--primary)' : '#BAC4D5';
};
</script>

<style scoped lang="scss">
.separator {
  display: flex;
  flex-direction: row;
  align-self: center;
  width: 7%;
  @media screen and (max-width: 1200px) {
    width: 4%;
  }
  @media screen and (max-width: 1010px) {
    width: 10%;
  }
  @media screen and (max-width: 700px) {
    width: 5%;
  }
  @media screen and (max-width: 700px) {
    width: 5%;
  }
}

:deep(.q-stepper) {
  box-shadow: none;
}
@media screen and (max-width: 1010px) {
  :deep(.q-stepper--dark.q-stepper--horizontal .q-stepper__line:before) {
    display: none !important;
  }
  :deep(.q-stepper--dark.q-stepper--horizontal .q-stepper__line:after) {
    display: none !important;
  }

  :deep(.q-stepper__tab) {
    padding: 0 !important;
  }
  :deep(.q-stepper__tab:first-child) {
    justify-content: center;
  }
  :deep(.q-stepper__tab:last-child) {
    justify-content: center;
  }
}
</style>
