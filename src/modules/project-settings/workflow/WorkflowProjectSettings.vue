<template>
  <div class="workflow-tab">
    <q-card class="workflow-tab__card column no-wrap">
      <q-card-section class="row items-center q-pa-none">
        <div class="text-h6">Бизнес процесс</div>
        <q-space />
      </q-card-section>

      <q-card-section v-if="!isMobile" class="q-pt-sm q-pb-none">
        <q-banner
          rounded
          style="
            background: rgba(25, 118, 210, 0.08);
            border: 1px solid rgba(25, 118, 210, 0.25);
          "
        >
          <template #avatar>
            <q-icon name="info" color="primary" size="sm" />
          </template>
          <p class="q-mb-xs">Укажите стрелками возможные переходы между статусами:</p>
          <ul class="q-mb-none q-pl-md">
            <li>
              Если в статус не ведут стрелки, в него можно перейти из любого другого статуса
            </li>
            <li>Круг обозначает создание задачи</li>
            <li>Указанные переходы не распространяются на администраторов проекта</li>
          </ul>
        </q-banner>
      </q-card-section>

      <q-card-section class="workflow-tab__diagram q-pa-none">
        <WorkflowFlowDiagram ref="diagramRef" :initial-flow="project?.states_flow" />
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md q-gutter-sm">
        <q-btn
          no-caps
          class="secondary-btn workflow-tab__action-btn"
          label="Отмена"
          @click="onCancel"
        />
        <q-btn
          no-caps
          class="primary-btn workflow-tab__action-btn"
          label="Сохранить"
          @click="onSave"
        />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Screen, useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { useProjectStore } from 'src/stores/project-store';
import WorkflowFlowDiagram from './WorkflowFlowDiagram.vue';
import { useNotificationStore } from 'src/stores/notification-store';

const route = useRoute();
const $q = useQuasar();
const projectStore = useProjectStore();
const { setNotificationView } = useNotificationStore();
const { project } = storeToRefs(projectStore);

const isMobile = $q.platform.is.mobile && Screen.lt.md;

const diagramRef = ref<InstanceType<typeof WorkflowFlowDiagram> | null>(null);

const onSave = async () => {
  const flowData = diagramRef.value?.getFlowData?.();
  try {
    await projectStore.updateProjectInfo(
      route.params.workspace as string,
      route.params.project as string,
      { states_flow: flowData },
    );
    diagramRef.value?.commitFlowSnapshot();
    setNotificationView({
      open: true,
      type: 'success',
      customMessage: 'Бизнес процесс успешно сохранен',
    });
  } catch (error) {
    console.error(error);
  }
};

const onCancel = () => {
  diagramRef.value?.resetFlow?.();
};
</script>

<style scoped>
.workflow-tab {
  width: 100%;
  height: calc(100vh - 250px);
  overflow: hidden;
  display: flex;
}

.workflow-tab__card {
  width: 100%;
  height: 100%;
}

.workflow-tab__diagram {
  flex: 1 1 auto;
  min-height: 0;
}

.workflow-tab__action-btn {
  width: 110px;
}

@media (max-width: 384px) {
  .workflow-tab {
    width: 100%;
    height: calc(100vh - 270px);
    overflow: hidden;
    display: flex;
  }
}
</style>
