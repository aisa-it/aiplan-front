<template>
  <q-dialog :model-value="modelValue" @update:modelValue="updateModelValue">
    <q-card class="dialog-card">
      <q-card-section class="row no-wrap items-center">
        <div class="text-h6 text-weight-bold text-wrap">
          Настройка прав доступа к документу
        </div>
        <q-space />
        <q-btn class="btn-only-icon-sm" icon="close" v-close-popup />
      </q-card-section>

      <q-card-section v-if="currentRole" class="q-pa-md">
        <div class="permissions-list">
          <div v-for="action in actions" :key="action.key">
            <div class="row items-center q-mb-sm permissions-row">
              <div class="text-subtitle1 text-weight-medium">
                {{ action.label }}
              </div>
              <q-select
                :model-value="getRoleObject(currentRole[action.roleField])"
                @update:model-value="(val) => updateRole(action.roleField, val)"
                :options="availableRoles"
                :readonly="!isAdminOrAuthor"
                option-value="value"
                option-label="label"
                emit-value
                map-options
                class="base-selector role-select"
                dense
              />
            </div>
          </div>

          <div class="text-h6 text-weight-bold q-mt-lg q-mb-md">
            Индивидуальные права доступа
          </div>

          <q-input
            v-model="searchQuery"
            class="base-input members-search-input"
            label="Поиск"
            dense
            debounce="300"
            @update:model-value="getUsersBySearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <div class="members-list-container">
            <div
              v-for="member in filteredMembers"
              :key="member.member_id"
              class="member-item q-pa-sm"
            >
              <div class="row items-center justify-between">
                <div class="row items-center">
                  <AvatarImage
                    :text="
                      [
                        member.member?.last_name[0],
                        member.member?.first_name[0],
                      ].join(' ')
                    "
                    :image="member.member?.avatar_id"
                    :member="member.member"
                    :size="'32px'"
                    :btnsize="'10px'"
                  />
                  <div class="flex column member-info q-ml-sm">
                    <div class="member-name abbriviated-text name-width">
                      {{ member.member?.last_name }}
                    </div>
                    <div class="member-name abbriviated-text name-width">
                      {{ member.member?.first_name }}
                    </div>
                  </div>
                </div>
                <q-select
                  :model-value="getIndividualRoleObject(member.member_id)"
                  :options="memberRoles"
                  option-value="value"
                  option-label="label"
                  :readonly="!isAdminOrAuthor"
                  emit-value
                  map-options
                  class="base-selector role-select"
                  dense
                  @update:model-value="
                    (val) => updateIndividualRole(member.member_id, val)
                  "
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions
        v-if="isAdminOrAuthor"
        class="dialog-card__actions"
        align="right"
      >
        <q-btn
          flat
          no-caps
          label="Отмена"
          style="width: 110px"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Сохранить"
          style="width: 110px"
          class="primary-btn"
          @click="saveChanges"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, computed } from 'vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';
import AvatarImage from 'src/components/AvatarImage.vue';

interface Action {
  key: string;
  label: string;
  roleField: keyof Roles;
}

interface Role {
  value: number;
  label: string;
}

interface Roles {
  reader_role?: number;
  editor_role?: number;
  reader_ids?: string[];
  editor_ids?: string[];
}

const props = defineProps<{
  modelValue: boolean;
  roles: Roles;
  isAdminOrAuthor: boolean;
}>();

const emit = defineEmits(['update:roles', 'update:modelValue']);

const currentRole = ref<Roles | null>(null);

const workspaceStore = useWorkspaceStore();
const { workspaceUsers } = storeToRefs(workspaceStore);

const availableMembers = computed(() => {
  return workspaceUsers.value.filter((user) => {
    return user.member?.is_onboarded;
  });
});

const availableRoles: Role[] = [
  { value: 20, label: 'Никто' },
  { value: 5, label: 'Гости' },
  { value: 10, label: 'Участники' },
  { value: 15, label: 'Администраторы и автор' },
];

const memberRoles: Role[] = [
  { value: 0, label: 'Отсутствует' },
  { value: 1, label: 'Просмотр' },
  { value: 2, label: 'Редактирование' },
];

const actions: Action[] = [
  { key: 'view', label: 'Просмотр раздела', roleField: 'reader_role' },
  { key: 'edit', label: 'Редактирование', roleField: 'editor_role' },
];

const getRoleObject = (value: number): Role | null => {
  return availableRoles.find((role) => role.value === value) || null;
};
const getIndividualRoleObject = (member: any): Role | null => {
  if (!currentRole.value) return null;

  if (currentRole.value.editor_ids?.includes(member)) {
    return memberRoles.find((role) => role.value === 2) || null;
  }
  if (currentRole.value.reader_ids?.includes(member)) {
    return memberRoles.find((role) => role.value === 1) || null;
  }
  return memberRoles.find((role) => role.value === 0) || null;
};

const updateRole = (field: keyof Roles, role: Role) => {
  if (currentRole.value) {
    currentRole.value[field] = role;
  }
};

const updateIndividualRole = (memberId: string, role: number) => {
  if (!currentRole.value) return;
  if (!role || role === 0) {
    currentRole.value.editor_ids =
      currentRole.value.editor_ids?.filter((id) => id !== memberId) || [];
    currentRole.value.reader_ids =
      currentRole.value.reader_ids?.filter((id) => id !== memberId) || [];
    return;
  }

  if (role === 1) {
    currentRole.value.editor_ids =
      currentRole.value.editor_ids?.filter((id) => id !== memberId) || [];
    if (!currentRole.value.reader_ids?.includes(memberId)) {
      currentRole.value.reader_ids = [
        ...(currentRole.value.reader_ids || []),
        memberId,
      ];
    }
  } else if (role === 2) {
    currentRole.value.reader_ids =
      currentRole.value.reader_ids?.filter((id) => id !== memberId) || [];
    if (!currentRole.value.editor_ids?.includes(memberId)) {
      currentRole.value.editor_ids = [
        ...(currentRole.value.editor_ids || []),
        memberId,
      ];
    }
  }
};

// Поиск среди пользователей (фильтрация)
const searchQuery = ref<string>('');
const filteredMembers = ref<Array<any>>([...availableMembers.value]);

const getUsersBySearch = (): void => {
  filteredMembers.value = availableMembers.value.filter(
    (user) =>
      user.member?.first_name
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase()) ||
      user.member?.last_name
        ?.toLowerCase()
        .includes(searchQuery.value.toLowerCase()),
  );
};

const updateModelValue = (value: boolean) => emit('update:modelValue', value);

const saveChanges = () => {
  if (currentRole.value) {
    emit('update:roles', currentRole.value);
  }
  updateModelValue(false);
};

watch(workspaceUsers, () => {
  getUsersBySearch();
});

watch(
  () => props.roles,
  (newVal) => {
    currentRole.value = { ...newVal };
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.dialog-card {
  min-width: 600px;

  &__actions {
    padding: 8px 16px 16px;
  }
}

.permissions-row {
  display: flex;
  justify-content: space-between;
}

.members-search-input {
  margin-bottom: 4px;
}

.members-list-container {
  max-height: 500px;
  overflow-y: auto;
}
.members-list-container::-webkit-scrollbar {
  display: block !important;
}

.member-item {
  padding: 8px 0;
}

.name-width {
  max-width: 150px;
}

.role-select {
  width: 150px;
}

.member-name {
  font-weight: 500;
  line-height: 1.2;
}

@media screen and (max-width: 650px) {
  .dialog-card {
    min-width: unset;
  }
}

@media screen and (width < 360px) {
  .role-select {
    min-width: 150px;
    width: 100%;
  }
}
</style>
