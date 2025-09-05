<template>
  <q-table
    flat
    class="q-my-md q-px-none table-bottom-reverse integration-setting-table"
    :columns="columns"
    :rows="rows"
    row-key="integration"
    :hide-no-data="!loading"
    :loading="loading"
    loading-label="Загружается..."
    hide-pagination
  >
    <template v-slot:top>
      <h6 style="margin: 0 !important">Интеграции</h6>
    </template>

    <template v-slot:body-cell-avatar="props">
      <q-td :props="props">
        <span
          v-if="props.row.avatar"
          class="integration-setting-table__avatar"
          v-html="handleAvatarSvgAddViewBox(props.row.avatar)"
        >
        </span>
      </q-td>
    </template>
    <template v-slot:body-cell-name="props">
      <q-td :props="props">
        <span>{{ props.row.name }}</span>
      </q-td>
    </template>

    <template v-slot:body-cell-description="props">
      <q-td :props="props">
        <div class="integration-setting-table__description">
          {{ props.row.description }}
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-buttons="props">
      <q-td v-if="canEdit" :props="props">
        <q-btn
          v-if="!props.row.added"
          flat
          dense
          :disable="isDisableAdd"
          @click.stop="addIntegration(props.row.name)"
        >
          <AddIcon />
          <HintTooltip> Подключить интеграцию </HintTooltip>
        </q-btn>
        <q-btn
          v-if="props.row.added"
          flat
          dense
          :disable="isDisableAdd"
          @click.stop="deleteIntegration(props.row.name)"
        >
          <RemoveIcon />
          <HintTooltip> Отключить интеграцию </HintTooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>
  <div
    v-if="!loading && !rows.length"
    class="centered-horisontally justify-center"
  >
    <h6>Интеграции не найдены</h6>
  </div>
</template>

<script lang="ts" setup>
// core
import { onMounted, ref, computed } from 'vue';
import { useNotificationStore } from 'src/stores/notification-store';
import { useRolesStore } from 'src/stores/roles-store';
import AddIcon from 'components/icons/AddIcon.vue';
import RemoveIcon from 'components/icons/RemoveIcon.vue';
import {
  SUCCESS_ADD_INTEGRATION_WS,
  SUCCESS_DEL_INTEGRATION_WS,
} from 'src/constants/notifications';
import { useAiplanStore } from 'src/stores/aiplan-store';
import {
  getWorkspaceIntegrations,
  addWorkspaceIntegration,
} from 'src/modules/workspace-settings/services/api';

const props = defineProps({
  currentWsInfo: { type: Object, required: true },
  currentWsSlug: { type: String, required: true },
});

const { setNotificationView } = useNotificationStore();
const aiplanStore = useAiplanStore();
const { hasPermissionByWorkspace } = useRolesStore();

// vars
const loading = ref(false);
const isDisableAdd = ref(false);

const canEdit = computed(() =>
  hasPermissionByWorkspace(props.currentWsInfo, 'ws-settings'),
);

const rows = ref([]);
const columns = [
  {
    name: 'avatar',
    label: 'Аватар',
    align: 'center',
    style: 'width: 10px',
    headerStyle: 'width: 10px',
  },
  {
    name: 'name',
    label: 'Имя',
    align: 'left',
  },
  {
    name: 'description',
    label: 'Справочная информация',
    align: 'left',
  },
  {
    name: 'buttons',
    align: 'center',
    style: 'width: 10%',
  },
];

async function onRequest() {
  loading.value = true;
  await getWorkspaceIntegrations(props.currentWsSlug as string)
    .then((res) => {
      rows.value = res || [];
    })
    .finally(() => {
      loading.value = false;
    });
}

const onAddSuccess = () => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_ADD_INTEGRATION_WS,
  });
};

const onDelSuccess = () => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: SUCCESS_DEL_INTEGRATION_WS,
  });
};

const addIntegration = async (name: string) => {
  isDisableAdd.value = true;
  await addWorkspaceIntegration(props.currentWsSlug as string, name)
    .then(() => {
      onAddSuccess();
      onRequest();
    })
    .finally(() => {
      isDisableAdd.value = false;
    });
};

const deleteIntegration = async (name: string) => {
  isDisableAdd.value = true;
  //await workspaceStore.deleteWorkspaceIntegration(currentWorkspaceSlug.value, name) TODO: change when API updated
  aiplanStore.api
    .delete(`/api/auth/workspaces/${props.currentWsSlug}/integrations/${name}/`)
    .then(() => {
      onDelSuccess();
      onRequest();
    })
    .finally(() => {
      isDisableAdd.value = false;
    });
  onDelSuccess();
  onRequest();
  isDisableAdd.value = false;
};

const handleAvatarSvgAddViewBox = (avatarSvg: string) => {
  const hasViewBox = avatarSvg.includes('viewBox');

  if (!hasViewBox) {
    const widthMatch = avatarSvg.match(/width="(\d+)"/);
    const heightMatch = avatarSvg.match(/height="(\d+)"/);
    const width = widthMatch ? widthMatch[1] : '100';
    const height = heightMatch ? heightMatch[1] : '100';

    return avatarSvg.replace('<svg', `<svg viewBox="0 0 ${width} ${height}"`);
  }

  return avatarSvg;
};

onMounted(async () => {
  await onRequest();
});
</script>

<style scoped lang="scss">
.integration-setting-table {
  &__avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    width: 40px;
    height: 40px;

    :deep(svg) {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  &__description {
    white-space: normal;
  }
}

.body--dark {
  .integration-setting-table {
    &__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      width: 40px;
      height: 40px;

      :deep(svg) {
        path:not([class]) {
          fill: $extra-light;
        }
      }
    }
  }
}
</style>
