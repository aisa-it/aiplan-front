<template>
  <div class="q-mt-md">
    <q-btn no-caps class="secondary-btn" @click="isOpen = true">
      Настроить бизнес процесс
    </q-btn>

    <q-dialog
      v-model="isOpen"
      maximized
      @show="diagramVisible = true"
      @hide="diagramVisible = false"
    >
      <q-card class="column no-wrap" style="width: 100%; height: 100%">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Бизнес процесс</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm q-pb-none">
          <q-banner rounded style="background: rgba(25,118,210,0.08); border: 1px solid rgba(25,118,210,0.25)">
            <template #avatar>
              <q-icon name="info" color="primary" size="sm" />
            </template>
            <p class="q-mb-xs">Укажите стрелками возможные переходы между статусами:</p>
            <ul class="q-mb-none q-pl-md">
              <li>Если в статус не ведут стрелки, в него можно перейти из любого другого статуса</li>
              <li>Круг обозначает создание задачи</li>
            </ul>
          </q-banner>
        </q-card-section>

        <q-card-section class="col q-pa-none">
          <WorkflowFlowDiagram
            v-if="diagramVisible"
            ref="diagramRef"
            :initial-flow="project?.states_flow"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat no-caps outline class="secondary-btn" label="Отменить" @click="onCancel" />
          <q-btn no-caps class="primary-btn" label="Сохранить" @click="onSave" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useProjectStore } from 'src/stores/project-store';
import WorkflowFlowDiagram from './WorkflowFlowDiagram.vue';
import { useNotificationStore } from 'src/stores/notification-store';

const route = useRoute();
const projectStore = useProjectStore();
const { setNotificationView } = useNotificationStore();
const { project } = storeToRefs(projectStore);

const isOpen = ref(false);
const diagramVisible = ref(false);
const diagramRef = ref(null);

const onCancel = () => {
  isOpen.value = false;
};

const onSave = async () => {
  const flowData = diagramRef.value?.getFlowData();
  try {
    await projectStore.updateProjectInfo(
      route.params.workspace as string,
      route.params.project as string,
      { states_flow: flowData },
    );
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Бизнес процесс успешно сохранен',
    });
  } catch (error) {
    console.error(error);
  } finally {
    isOpen.value = false;
  }
};
</script>
