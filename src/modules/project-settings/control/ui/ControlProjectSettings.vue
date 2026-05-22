<template>
  <LoadPage v-if="isLoading" />
  <div v-else>
    <div class="row mobile-block q-mt-md">
      <div class="col">
        <h4 class="text-lg font-semibold text-brand-base">Лидер проекта</h4>
        <p class="text-sm text-brand-secondary">Выберите лидера проекта</p>
      </div>
      <div class="col">
        <SelectMembers
          v-model="currentProject.project_lead"
          label="Лидер проекта"
          off-multiple
          off-search
          :is-disabled="
            !rolesStore.hasPermissionByProject(project, 'change-lead-project')
          "
          :refresh-members-func="fethAdmins"
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
        <SelectMembers
          v-model="currentProject.default_assignees_details"
          label="Исполнитель по умолчанию"
          :refresh-members-func="fetchMembers"
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
        <SelectMembers
          v-model="currentProject.default_watchers_details"
          label="Наблюдатель по умолчанию"
          :refresh-members-func="fetchMembers"
        />
      </div>
    </div>

    <q-card-actions style="background-color: transparent" align="right">
      <q-btn
        no-caps
        :flat="!hasChanges"
        :outline="!hasChanges"
        :class="hasChanges ? 'primary-btn' : 'secondary-btn'"
        :disable="!hasChanges"
        @click="onSubmit"
      >
        Сохранить
      </q-btn>
    </q-card-actions>
  </div>
</template>

<script setup lang="ts">
//core
import { useMeta } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { computed, onBeforeMount, onMounted, ref } from 'vue';

//stores
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useNotificationStore } from 'src/stores/notification-store';
import { useUserStore } from 'stores/user-store';
import { useFetchMembers } from 'src/components/selects/composables/useFetchMembers';

//types
import {
  DtoProject,
  DtoProjectMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

//components
import LoadPage from 'src/pages/LoadPage.vue';
import SelectMembers from 'src/components/selects/SelectMembers.vue';

//api
import { updateProject } from '../../services/api';

//composables
import { useFormChanges } from 'src/composables/useFormChanges';
import { MemberToIdArray } from 'src/components/selects/helpers/helpers';
import { Pagination } from 'src/components/selects/types/types';

const route = useRoute();
const rolesStore = useRolesStore();
const projectStore = useProjectStore();
const userStore = useUserStore();
const { project } = storeToRefs(projectStore);
const currentProject = ref();

const metadata = ref({
  title: 'Загрузка...',
});

const { fetchMembers } = useFetchMembers('project', {
  projectId: project.value.id,
});

const isLoading = computed(() => {
  return currentProject.value === undefined;
});

const { hasChanges, init } = useFormChanges(currentProject, {
  transform: (val) => {
    if (!val) return {};
    return {
      project_lead: val.project_lead?.[0]?.member_id,
      default_assignees: MemberToIdArray(val.default_assignees_details),
      default_watchers: MemberToIdArray(val.default_watchers_details),
    };
  },
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

function setAnotherTitle(title: string) {
  metadata.value.title = `Настройки ${title}`;
}

async function fethAdmins(pagination: Pagination) {
  const result = await projectStore.getProjectMembers(
    route.params.workspace as string,
    route.params.project as string,
    pagination,
  );
  if (!result) return {};
  result.result = result?.result.filter(
    (el: DtoProjectMemberLight) =>
      !el?.member?.is_integration && el?.role === 15,
  );
  return result;
}

async function refresh() {
  currentProject.value = { ...project.value, project_lead: [] };

  if (currentProject.value.project_lead_detail) {
    const admins = (await fethAdmins({ limit: -1 })).result;
    currentProject.value.project_lead = [
      admins.find(
        (el) => el.member_id === currentProject.value.project_lead_detail.id,
      ),
    ];
  }

  setAnotherTitle(currentProject.value.name);
  init();
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
    default_assignees: MemberToIdArray(
      currentProject.value.default_assignees_details,
    ),

    default_watchers: MemberToIdArray(
      currentProject.value.default_watchers_details,
    ),
    project_lead: currentProject.value.project_lead?.[0].member_id,
  };

  await updateProject(
    route.params.workspace as string,
    route.params.project as string,
    payload,
  ).then(async () => {
    await projectStore.getProjectInfo(
      route.params.workspace as string,
      route.params.project as string,
    );
    onSuccess();
  });
};
</script>
