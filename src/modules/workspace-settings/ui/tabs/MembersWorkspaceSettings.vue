<template>
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
        @update:selectedPage="onRequest({ pagination })"
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
        v-if="
          user?.is_superuser &&
          computedWorkspaceInfo?.current_user_membership?.member_id === user.id
        "
        no-caps
        style="width: 95px"
        class="delete-btn q-mr-sm"
        @click="isLeaveWorkspace = true"
      >
        Выйти
      </q-btn>
      <q-btn
        v-if="canEdit"
        no-caps
        data-id="workspace-add-members-settings"
        class="secondary-btn"
        @click="isInviteOpenDialog()"
      >
        Добавить
      </q-btn>

      <InviteMemberDialog
        v-model="isInviteOpen"
        :userMail="user.email"
        :isSuperuser="user.is_superuser"
        :currentWsSlug="currentWsSlug"
        @success="onSuccess(SUCCESS_INVITE_USER)"
        @update="onUpdate"
      />
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
        <span class="q-mr-sm">{{ props.value }} </span>

        <q-badge v-if="!props.row.member?.email" class="user-badge blocking">
          Требуется email
        </q-badge>

        <q-badge v-if="props.row.member?.id === user?.id" class="user-badge me">
          Текущий пользователь
        </q-badge>
        <q-badge
          v-if="props.row.member?.id === computedWorkspaceInfo.owner_id"
          class="user-badge me"
        >
          Владелец
        </q-badge>
        <q-badge v-if="props.row.isMember === false" class="user-badge pending"
          >В ожидании</q-badge
        >
        <q-badge
          v-if="props.row.member?.is_active === false"
          class="user-badge blocked"
        >
          Заблокирован
        </q-badge>
        <q-badge
          v-if="props.row.member?.is_integration === true"
          class="user-badge integration"
        >
          Интеграция</q-badge
        >
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
        <WorkspaceMembersButtons
          v-if="
            rolesStore.hasPermissionWsMemberChange(
              user,
              props.row,
              computedWorkspaceInfo,
            )
          "
          :isActive="props.row.member?.is_active"
          :show-delete="!props.row.member?.is_superuser"
          @edit="editUser(props.row)"
          @block="blockUser(props.row)"
          @unblock="unblockUser(props.row)"
          @delete="confirmDelUser(props.row)"
        />
      </q-td>
    </template>
  </q-table>
  <div
    v-show="!loading && !rows.length"
    class="centered-horisontally justify-center"
  >
    <h6>Пользователь не найден</h6>
  </div>
  <EditMemberDialog
    v-model="isEditOpen"
    :user="currentUser"
    :currentWsSlug="currentWsSlug"
    data-id="edit-member-dialog-button"
    @update="onSuccess(SUCCESS_CHANGE_USER_ROLE)"
  />
  <DeleteMemberDialog
    v-model="isConfirmDelOpen"
    :user="currentUser"
    :currentWsSlug="currentWsSlug"
    data-id="delete-member-dialog-button"
    @delete="onDelete()"
  />
  <LeaveWorkspaceDialog
    v-model="isLeaveWorkspace"
    :members="rows"
    :currentWsInfo="currentWsInfo"
    :currentWsSlug="currentWsSlug"
    :isInAdminPanel="isInAdminPanel"
    @refreshData="refreshData"
  />
</template>

<script setup lang="ts">
// core
import { useMeta, debounce } from 'quasar';
import { storeToRefs } from 'pinia';
import { nextTick, onMounted, ref, computed } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useRolesStore } from 'src/stores/roles-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useNotificationStore } from 'src/stores/notification-store';

// components
import {
  InviteMemberDialog,
  LeaveWorkspaceDialog,
  EditMemberDialog,
  DeleteMemberDialog,
} from 'src/modules/workspace-settings/ui/dialogs';
import PaginationDefault from 'components/pagination/PaginationDefault.vue';
import WorkspaceMembersButtons from 'src/components/buttons/WorkspaceMembersButtons.vue';
import SearchIcon from 'src/components/icons/SearchIcon.vue';
import AvatarImage from 'src/components/AvatarImage.vue';

// utils
import { valToRole } from 'src/utils/translator';

// constants
import {
  SUCCESS_BLOCK_USER,
  SUCCESS_DELETE_USER,
  SUCCESS_INVITE_USER,
  SUCCESS_UNBLOCK_USER,
  SUCCESS_CHANGE_USER_ROLE,
} from 'src/constants/notifications';
import { useRouter } from 'vue-router';

const props = defineProps({
  currentWsInfo: { type: Object, required: true },
  currentWsSlug: { type: String, required: true },
  isInAdminPanel: {
    type: Boolean,
    required: false,
    default: () => false,
  },
});

//core
const router = useRouter();

// stores
const userStore = useUserStore();
const rolesStore = useRolesStore();
const workspaceStore = useWorkspaceStore();
const { setNotificationView } = useNotificationStore();

// stores to refs
const { user } = storeToRefs(userStore);

const computedWorkspaceInfo = computed(() => props.currentWsInfo);

const canEdit = computed(() =>
  rolesStore.hasPermissionByWorkspace(
    computedWorkspaceInfo.value,
    'ws-settings',
  ),
);

const currentUser = ref();
const isEditOpen = ref(false);
const isInviteOpen = ref(false);
const isLeaveWorkspace = ref(false);
const isConfirmDelOpen = ref(false);
const searchQuery = ref();

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

const loading = ref(false);

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

const rows = ref([]);
const columns = [
  {
    name: 'username',
    label: 'Имя пользователя',
    align: 'left',
    field: (row: any) => {
      return !!(row.member?.first_name && row.member?.last_name)
        ? `${row.member?.first_name} ${row.member?.last_name}`
        : `${row.member?.email}`;
    },
  },
  {
    name: 'email',
    label: 'Email',
    sortable: true,
    align: 'left',
    field: (row: any) => row.member.email,
  },
  {
    name: 'role',
    label: 'Роль',
    field: 'role',
    sortable: true,
    align: 'left',
    format: (val: any) => valToRole(val).label,
  },
  { name: 'buttons' },
];

async function onRequest(p: any) {
  const { page, rowsPerPage, sortBy, descending, rowsNumber } = p.pagination;

  loading.value = true;
  await workspaceStore
    .getWorkspaceMembers(props.currentWsSlug, {
      offset: (page - 1) * (rowsPerPage == 0 ? 10 : rowsPerPage),
      limit: rowsPerPage == 0 ? rowsNumber || 10 : rowsPerPage,
      order_by: sortBy,
      desc: descending,
      search_query: searchQuery.value,
    })
    .then((res) => {
      pagination.value.rowsNumber = res?.count || 0;
      pagination.value.page = page;
      pagination.value.rowsPerPage = res?.limit || 0;
      pagination.value.sortBy = sortBy;
      pagination.value.descending = descending;
      rows.value = res?.result || [];
      loading.value = false;
    });
}

async function refreshData() {
  if (props.currentWsSlug) {
  } else {
    await workspaceStore.getWorkspaceInfo(props.currentWsSlug);
  }
  setAnotherTitle(computedWorkspaceInfo.value.name);
  await onRequest({ pagination: pagination.value });
}

onMounted(async () => {
  await refreshData();
});

const onSuccess = (msg?: string) => {
  onRequest({ pagination: pagination.value });
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_INVITE_USER,
  });
};

const onDelete = async () => {
  await onRequest({ pagination: pagination.value });
  onSuccess(SUCCESS_DELETE_USER);
};

const onUpdate = async () => {
  isEditOpen.value = false;
  await refreshData();
};

const confirmDelUser = (row: any) => {
  currentUser.value = { ...row };
  isConfirmDelOpen.value = true;
};

const isInviteOpenDialog = async () => {
  isInviteOpen.value = true;
  await nextTick();
  let el = document.querySelector('[data-id="select-roles-member-email"] span');
  if (el) {
    el.dataset.id = 'select-roles-member-label';
  }
  el = document.querySelectorAll(
    '.q-icon.notranslate.material-icons.q-select__dropdown-icon',
  )[1];
  if (el) {
    el.dataset.id = 'select-roles-member-icon-dropdown';
  }
};

const blockUser = async (row: any) => {
  await workspaceStore
    .controlWorkspaceUser(props.currentWsSlug, row.id, true)
    .then(() => {
      onSuccess(SUCCESS_BLOCK_USER);
    })

    .finally(() => {
      return onRequest({ pagination: pagination.value });
    });
};

const unblockUser = async (row: any) => {
  await workspaceStore
    .controlWorkspaceUser(props.currentWsSlug, row.id, false)

    .then(() => {
      onSuccess(SUCCESS_UNBLOCK_USER);
    })

    .finally(() => {
      return onRequest({ pagination: pagination.value });
    });
};

const editUser = (row: any) => {
  currentUser.value = { ...row };
  isEditOpen.value = true;
};

const handleRedirectToProfile = (id: string) => {
  if (id === user?.value.id) {
    router.push({
      path: '/profile',
    });
  } else if (props.currentWsSlug) {
    router.push({
      path: `/${props.currentWsSlug}/user-activities/${id}`,
    });
  }
};

const handleSearchMembers = debounce(async () => {
  await onRequest({ pagination: pagination.value });
}, 700);
</script>

<style lang="scss" scoped>
.me {
  background: $color_accent_light;
  color: $color_accent;
}

.pending {
  background: $warning-lignt;
  color: $warning;
}

.blocked {
  background: $warning-lignt;
  color: $warning;
}

.integration {
  background: $color_accent_light;
  color: $color_accent;
}

@media screen and (max-width: 625px) {
  .members-search {
    order: 3;
    margin-top: 8px;
  }
}
</style>
