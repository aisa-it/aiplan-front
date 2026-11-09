<template>
  <v-dialog v-model="isOpen" persistent max-width="576">
    <v-card class="flex flex-col gap-3 p-6 text-default" rounded="xl">
      <div class="flex items-center justify-between">
        <h6 class="m-0 text-lg font-semibold">
          {{ t('workspaceNotifications.create') }}
        </h6>

        <v-btn
          :aria-label="t('common.actions.close')"
          icon="mdi-close"
          variant="text"
          color="text"
          @click="isOpen = false"
        />
      </div>

      <v-text-field
        v-model="form.title"
        density="compact"
        :label="t('workspaceNotifications.dialog.subject')"
      />

      <v-textarea
        v-model="form.msg"
        auto-grow
        counter
        density="compact"
        :label="t('common.fields.description')"
        maxlength="100"
        rows="3"
      />

      <div
        class="flex items-center justify-between gap-4 max-sm:flex-col-reverse max-sm:items-stretch"
      >
        <v-checkbox
          class="shrink-0"
          density="compact"
          hide-details
          :label="t('workspaceNotifications.dialog.sendToAll')"
          :model-value="isAllSelected"
          @update:model-value="setAllSelected"
        />

        <!-- TODO: вставить универсальный выбор пользователя, когда будет реализован -->
        <v-autocomplete
          v-model="form.members"
          class="w-84 max-sm:w-full"
          chips
          clearable
          closable-chips
          density="compact"
          hide-details
          item-value="id"
          :label="t('workspaceNotifications.dialog.recipients')"
          multiple
          :no-data-text="t('workspaceNotifications.dialog.userNotFound')"
          :disabled="isAllSelected"
          :item-title="getMemberName"
          :items="availableMembers"
          :loading="isLoadingMembers"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <template #prepend>
                <UserAvatarMenu :user="getMemberUser(item)" hide-user-name />
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </div>

      <div
        class="flex items-start justify-between gap-4 max-sm:flex-col-reverse max-sm:items-stretch"
      >
        <v-checkbox
          class="shrink-0"
          density="compact"
          hide-details
          :label="t('workspaceNotifications.dialog.sendNow')"
          :model-value="isSendNow"
          @update:model-value="setSendNow"
        />

        <!-- TODO: вставить универсальный выбор даты с дата пикером, когда будет реализован -->
        <v-text-field
          v-model="form.send_at"
          class="w-84 max-sm:w-full"
          density="compact"
          hide-details="auto"
          :label="t('workspaceNotifications.dialog.sendAt')"
          type="datetime-local"
          :disabled="isSendNow"
          :error="isDateInvalid"
          :error-messages="
            isDateInvalid
              ? t('workspaceNotifications.dialog.pastDate')
              : undefined
          "
          :min="minimumDateTime"
          @update:model-value="isDateInvalid = false"
        />
      </div>

      <v-card-actions class="gap-2 p-0 max-sm:flex-col-reverse">
        <v-spacer class="max-sm:hidden" />

        <v-btn
          class="normal-case max-sm:w-full"
          variant="outlined"
          @click="isOpen = false"
        >
          {{ t('common.actions.cancel') }}
        </v-btn>
        <v-btn
          class="normal-case max-sm:w-full"
          color="primary"
          variant="flat"
          :disabled="!isReadyToSend"
          :loading="isSending"
          @click="onSend"
        >
          {{ t('workspaceNotifications.dialog.send') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';
import { useI18n } from 'vue-i18n';

import UserAvatarMenu from '@/components/user-avatar-menu/UserAvatarMenu.vue';
import { useCreateWorkspaceNotification } from '../composables';

import type {
  DtoUser,
  DtoWorkspaceMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  workspaceSlug: string;
}>();

const { t } = useI18n();

const isOpen = defineModel<boolean>({ required: true });

const {
  availableMembers,
  form,
  isAllSelected,
  isDateInvalid,
  isLoadingMembers,
  isReadyToSend,
  isSending,
  isSendNow,
  loadMembers,
  reset,
  send,
  setAllSelected,
  setSendNow,
} = useCreateWorkspaceNotification();

const minimumDateTime = ref('');

const getMemberName = (membership: DtoWorkspaceMemberLight) => {
  const member = membership.member;
  return (
    [member?.last_name, member?.first_name].filter(Boolean).join(' ') ||
    member?.email ||
    t('workspaceNotifications.dialog.notSelected')
  );
};

const getMemberUser = (membership: DtoWorkspaceMemberLight) =>
  (membership.member ?? {}) as DtoUser;

const onSend = async () => {
  if (await send(props.workspaceSlug)) isOpen.value = false;
};

watch(isOpen, (open) => {
  if (!open) return;

  reset();
  minimumDateTime.value = dayjs().format('YYYY-MM-DDTHH:mm');
  void loadMembers(props.workspaceSlug);
});
</script>
