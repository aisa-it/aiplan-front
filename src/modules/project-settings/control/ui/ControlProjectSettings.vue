<template>
  <LoadPage v-if="isLoading" />
  <div v-else>
    <div class="row mobile-block q-mt-md">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Лидер проекта</h4>
        <p class="text-sm text-brand-secondary">Выберите лидера проекта</p>
      </div>
      <div class="col">
        <SelectLeader
          v-model:current-value="currentProject.project_lead"
          :options="leadProjectOptions"
          :is-disabled="
            !rolesStore.hasPermissionByProject(project, 'change-lead-project')
          "
        />
      </div>
    </div>

    <div class="row mobile-block q-mt-md">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">
          Исполнитель по умолчанию
        </h4>
        <p class="text-sm text-brand-secondary">
          Выберите исполнителя по умолчанию при создании задачи
        </p>
      </div>
      <div class="col">
        <SelectAssignee
          v-model:assigness="currentProject.default_assignees"
          :default-assignee="currentProject.default_assignees_details"
          :projectid="currentProject.id"
          label="Исполнитель по умолчанию"
          :is-adaptive-select="false"
          :current-member="user"
        />
      </div>
    </div>

    <div class="row mobile-block q-mt-md">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">
          Наблюдатель по умолчанию
        </h4>
        <p class="text-sm text-brand-secondary">
          Выберите наблюдателя, который будет получать уведомления по всем
          задачам
        </p>
      </div>
      <div class="col">
        <SelectWatchers
          v-model:watchers="currentProject.default_watchers"
          :default-watcher="currentProject.default_watchers_details"
          label="Наблюдатель по умолчанию"
          :projectid="currentProject.id"
          :is-adaptive-select="false"
          :current-member="user"
        />
      </div>
    </div>

    <q-card-actions style="background-color: transparent" align="right">
      <q-btn no-caps @click="onSubmit" class="secondary-btn"> Сохранить </q-btn>
    </q-card-actions>
  </div>
</template>

<script setup lang="ts">
import { useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { computed, onBeforeMount, onMounted, ref } from 'vue';

import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useUserStore } from 'stores/user-store';

import { IProjectLeader } from 'src/interfaces/projects';
import {
  DtoProject,
  DtoProjectMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

import LoadPage from 'src/pages/LoadPage.vue';
import SelectAssignee from 'components/selects/SelectAssignee.vue';
import SelectWatchers from 'components/selects/SelectWatchers.vue';
import SelectLeader from 'components/selects/SelectLeader.vue';

import { updateProject } from '../../services/api';

const route = useRoute();
const rolesStore = useRolesStore();
const projectStore = useProjectStore();
const userStore = useUserStore();
const { project } = storeToRefs(projectStore);
const currentProject = ref(); 
// TODO касается типизации project, в данном компоненте идёт нарушение контракта в угоду используемым компонентам типа селекта 
// FE project_lead является по контракту строкой, здесь же используется как объект
// нужно или изменить селекты и логику получения информации об выбранном пользователе либо же создавать промежуточные стейты, а не переписывать переменные в нарушение контрактов
const projectMembers = ref<DtoProjectMemberLight[]>();
const projectOptions = ref<IProjectLeader[]>([]);
const leadProjectOptions = ref<IProjectLeader[]>([]);
const metadata = ref({
  title: 'Загрузка...',
});
const { user } = storeToRefs(userStore);

const isLoading = computed(() => {
  return (
    projectMembers.value === undefined || currentProject.value === undefined
  );
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

function setAnotherTitle(title: string) {
  metadata.value.title = `Настройки ${title}`;
}

async function refresh() {
  currentProject.value = { ...project.value };
  projectOptions.value = [
    {
      value: null,
      label: 'Не выбран',
    },
  ] as unknown as IProjectLeader[];
  leadProjectOptions.value = [] as unknown as IProjectLeader[];
  if (
    currentProject.value.project_lead_detail === null ||
    currentProject.value.project_lead_detail === undefined
  ) {
    currentProject.value.project_lead = {
      label: 'Не выбран',
      value: null,
    };
  } else {
    currentProject.value.project_lead = {
      label: `${currentProject.value.project_lead_detail.last_name} ${currentProject.value.project_lead_detail.first_name}`,
      value: currentProject.value.project_lead_detail.id,
    };
  }

  projectMembers.value = (
    await projectStore.getProjectMembers(
      route.params.workspace as string,
      route.params.project as string,
    )
  )?.result;

  projectMembers.value = projectMembers.value?.filter(
    (el) => el?.member?.is_integration !== true,
  );

  projectMembers.value?.forEach((member: any) => {
    if (member.role === 15) {
      leadProjectOptions.value.push({
        ...member,
        label: `${member.member.last_name} ${member.member.first_name}`,
        value: member.member.id,
      });
    }
  });

  setAnotherTitle(currentProject.value.name);
}

onBeforeMount(async () => await userStore.getUserInfo());
onMounted(async () => refresh());

const n = useNotificationStore();
function onSuccess() {
  n.setNotificationView({
    open: true,
    type: 'success',
  });
  refresh();
}

const onSubmit = async () => {
  const payload: DtoProject = {
    default_assignees: currentProject.value.default_assignees.map(
      (assignee: DtoProjectMemberLight) =>
        assignee?.member_id ? assignee?.member_id : assignee,
    ),
    default_watchers: currentProject.value.default_watchers.map(
      (watcher: DtoProjectMemberLight) =>
        watcher?.member_id ? watcher?.member_id : watcher,
    ),
    project_lead: currentProject.value.project_lead.value,
  };

  await updateProject(
    route.params.workspace as string,
    route.params.project as string,
    payload,
  ).then(async () => {
    await projectStore.getProjectInfo(
      route.params.workspace as string,
      project.value.id,
    );
    onSuccess();
  });
};
</script>
