<template>
  <LoadPage v-if="me === undefined && project === undefined" />
  <div v-else>
    <q-table
      flat
      class="q-my-md q-px-none table-bottom-reverse"
      :columns="columns"
      :rows="rows"
      row-key="user"
      :hide-no-data="!loading"
      :loading="loading"
      loading-label="Загружается..."
      :rows-per-page-options="[10, 25, 100]"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template #pagination>
        <PaginationDefault
          v-model:selected-page="pagination.page"
          :rows-number="pagination.rowsNumber"
          :rows-per-page="pagination.rowsPerPage"
          @update:selectedPage="() => onRequest({ pagination })"
        />
      </template>

      <template v-slot:top>
        <div class="flex q-table__title q-mr-sm">Пользователи</div>
        <q-input
          label="Поиск"
          dense
          class="base-input admin-search members-search"
          v-model="searchQuery"
          @update:model-value="handleSearchMembers"
        >
          <template v-slot:prepend>
            <SearchIcon />
          </template>
        </q-input>
        <q-space />
        <q-btn
          v-if="canLeaveProject"
          no-caps
          class="delete-btn q-mr-sm"
          @click="isLeaveProject = true"
        >
          Выйти
        </q-btn>
        <q-btn
          no-caps
          class="secondary-btn"
          @click="isInviteOpen = !isInviteOpen"
        >
          Добавить
        </q-btn>
      </template>

      <template v-slot:body-cell-username="props">
        <q-td key="username" :props="props">
          <AvatarImage
            style="
              padding: 0 !important;
              border-radius: 30px !important;
              margin: 16px 16px 16px 0;
            "
            :border="false"
            :text="
              [
                props.row.member.last_name[0],
                props.row.member.first_name[0],
              ].join(' ')
            "
            :member="props.row.member"
            :image="props.row.member?.avatar_id"
            @click.stop="handleRedirectToProfile(props.row.member.id)"
            size="40px"
          />
          <span class="q-mr-sm">
            {{ props.value }}
          </span>
          <q-badge
            v-if="props.row.member?.id === me?.member_id"
            class="user-badge pending q-ml-xs"
          >
            Текущий пользователь
          </q-badge>
          <q-badge
            v-if="props.row.member?.id === project?.project_lead"
            class="user-badge pending q-ml-xs"
          >
            Лид проекта
          </q-badge>
          <q-badge
            v-if="isAdminWs(props.row.member_id)"
            class="user-badge pending q-ml-xs"
          >
            Админ пространства
          </q-badge>
          <q-badge
            v-if="props.row.member?.is_active === false"
            class="user-badge blocked"
          >
            Заблокирован
          </q-badge>
          <q-badge
            v-if="props.row.member?.is_superuser === true"
            class="user-badge q-ml-xs"
          >
            Суперпользователь
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-buttons="props">
        <q-td :props="props">
          <div v-if="!isAdminWs(props.row.member_id)">
            <ProjectMemebersButtons
              v-if="hasPermissionProjectMemberChange(me, props.row)"
              :show-delete="!props.row.member?.is_superuser"
              @edit="editUser(props.row)"
              @delete="confirmDelUser(props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>
    <div
      v-show="!loading && !rows.length"
      class="centered-horisontally justify-center"
    >
      <h6>Пользователь не найден</h6>
    </div>
    <InviteProjectDialog
      :workspaceMembers="wsMembers"
      :projectMembers="allProjectMembers"
      :isSuperuser="Boolean(user.is_superuser)"
      :userId="user.id"
      v-model="isInviteOpen"
      @success="onSuccess(SUCCESS_INVITE_USER)"
    />
    <EditProjectMemberDialog
      v-model="isEditOpen"
      :user="memberToEdit"
      :me="me"
      @success="onSuccess(SUCCESS_CHANGE_USER_ROLE)"
    />
    <DeleteProjectMemberDialog
      v-model="isDeleteOpen"
      :user="memberToEdit"
      @delete="onSuccess(SUCCESS_DELETE_PROJECT_USER)"
    />
    <LeaveProjectDialog :members="rows" v-model="isLeaveProject" />
  </div>
</template>

<script setup lang="ts">
// core
import { useMeta, debounce } from 'quasar';
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// components
import LoadPage from 'src/pages/LoadPage.vue';
import PaginationDefault from 'components/pagination/PaginationDefault.vue';
import ProjectMemebersButtons from 'src/modules/project-settings/members/ui/ProjectMembersButtons.vue';
import LeaveProjectDialog from 'src/modules/project-settings/members/ui/dialogs/LeaveProjectDialog.vue';
import InviteProjectDialog from 'src/modules/project-settings/members/ui/dialogs/InviteProjectDialog.vue';
import EditProjectMemberDialog from 'src/modules/project-settings/members/ui/dialogs/EditProjectMemberDialog.vue';
import DeleteProjectMemberDialog from 'src/modules/project-settings/members/ui/dialogs/DeleteProjectMemberDialog.vue';
import SearchIcon from 'src/components/icons/SearchIcon.vue';
import AvatarImage from 'src/components/AvatarImage.vue';

// utils
import { valToRole } from 'src/utils/translator';

// constants
import {
  SUCCESS_UPDATE_DATA,
  SUCCESS_INVITE_USER,
  SUCCESS_DELETE_PROJECT_USER,
  SUCCESS_CHANGE_USER_ROLE,
} from 'src/constants/notifications';

// interfaces
import {
  DtoProjectMember,
  DtoProjectMemberLight,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { IQuasarPaginationValues } from 'src/interfaces/issues';
import { useRouter } from 'vue-router';

const emits = defineEmits<{ update: [] }>();

//core
const router = useRouter();

// stores
const userStore = useUserStore();
const { hasPermissionProjectMemberChange } = useRolesStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

// stores to refs
const { user } = storeToRefs(userStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);
const { project, currentProjectID } = storeToRefs(projectStore);

// vars
const me = ref<DtoProjectMember>();
const rows = ref<DtoProjectMemberLight[]>([]);
const allProjectMembers = ref<DtoProjectMemberLight[]>([]);
const memberToEdit = ref<DtoProjectMemberLight>();
const wsMembers = ref<DtoWorkspaceMember[]>([]);
const loading = ref(false);
const isEditOpen = ref(false);
const isLeaveProject = ref(false);
const isInviteOpen = ref(false);
const isDeleteOpen = ref(false);
const searchQuery = ref<string>();
const canLeaveProject = computed(
  () =>
    user.value?.is_superuser &&
    project.value?.current_user_membership?.member_id === user.value.id &&
    project.value?.current_user_membership?.id,
);

const columns = [
  {
    name: 'username',
    label: 'Имя пользователя',
    align: 'left' as const,
    field: (row: DtoProjectMemberLight) => {
      return !!(row.member?.first_name && row.member?.last_name)
        ? `${row.member?.first_name} ${row.member?.last_name}`
        : `${row.member?.email}`;
    },
  },
  {
    name: 'email',
    label: 'Email',
    sortable: true,
    align: 'left' as const,
    field: (row: DtoProjectMemberLight) => row.member?.email,
  },
  {
    name: 'role',
    label: 'Роль',
    field: 'role',
    sortable: true,
    align: 'left' as const,
    format: (val: number) => valToRole(val).label,
  },
  {
    name: 'buttons',
    label: '',
    field: 'role',
    align: 'left' as const,
  },
];

const pagination = ref<IQuasarPaginationValues>({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const metadata = ref({
  title: 'Загрузка...',
});

useMeta(() => {
  return {
    title: metadata.value.title,
  };
});

function setAnotherTitle(title: string) {
  metadata.value.title = `Настройки ${title}`;
}

async function onRequest(p: { pagination: IQuasarPaginationValues }) {
  const { page, rowsPerPage, sortBy, descending, rowsNumber } = p.pagination;

  loading.value = true;
  await projectStore
    .getProjectMembers(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      {
        offset: 0,
        limit: 1000,
      },
    )
    .then((res) => {
      if (res) allProjectMembers.value = res.result;
    });

  await projectStore
    .getProjectMembers(
      currentWorkspaceSlug.value as string,
      currentProjectID.value,
      {
        offset: (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage),
        limit: rowsPerPage == 0 ? rowsNumber || 10 : rowsPerPage,
        search_query: searchQuery.value,
        order_by: sortBy,
        desc: descending,
      },
    )
    .then((res) => {
      if (res) {
        pagination.value.rowsNumber = res.count ?? 0;
        pagination.value.page = page;
        pagination.value.rowsPerPage = res.limit ?? 0;
        pagination.value.sortBy = sortBy;
        pagination.value.descending = descending;
        rows.value = res.result;
        loading.value = false;
      }
    });
}

async function refresh() {
  await onRequest({ pagination: pagination.value });
  const meInProject = await projectStore.getMeInProject(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
  );
  if (meInProject) me.value = meInProject;

  await workspaceStore
    .getWorkspaceMembers(currentWorkspaceSlug.value as string)
    .then((res) => (wsMembers.value = res?.result || []));

  setAnotherTitle(project.value.name);
}

onMounted(async () => await refresh());

async function onSuccess(msg?: string) {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_UPDATE_DATA,
  });
  await refresh();
  emits('update');
}

const isAdminWs = (member_id: string) => {
  return (
    wsMembers.value?.find((member) => member_id === member.member_id)?.role ===
    15
  );
};

const handleSearchMembers = debounce(async () => {
  await onRequest({ pagination: pagination.value });
}, 700);

const editUser = (row: DtoProjectMemberLight) => {
  memberToEdit.value = { ...row };
  isEditOpen.value = true;
};

const confirmDelUser = (row: DtoProjectMemberLight) => {
  memberToEdit.value = { ...row };
  isDeleteOpen.value = true;
};

const handleRedirectToProfile = (id: string) => {
  if (id === me?.value?.member_id) {
    router.push({
      path: '/profile',
    });
  } else if (currentWorkspaceSlug.value) {
    router.push({
      path: `/${currentWorkspaceSlug.value}/user-activities/${id}`,
    });
  }
};
</script>

<style scoped lang="scss">
.blocked {
  background: $warning-lignt;
  color: $warning;
}

@media screen and (max-width: 625px) {
  .members-search {
    order: 3;
    margin-top: 8px;
  }
}
</style>
