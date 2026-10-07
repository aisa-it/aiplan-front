<template>
  <v-dialog v-model="isOpen" persistent max-width="576">
    <v-card class="flex flex-col gap-3 p-6" rounded="xl">
      <div class="flex items-center justify-between">
        <h6 class="m-0 text-lg font-semibold">Создать уведомление</h6>

        <v-btn
          aria-label="Закрыть"
          icon="mdi-close"
          variant="text"
          @click="isOpen = false"
        />
      </div>

      <v-text-field v-model="form.title" density="compact" label="Тема" />

      <v-textarea
        v-model="form.msg"
        auto-grow
        counter
        density="compact"
        label="Описание"
        maxlength="100"
        rows="3"
      />

      <div class="flex items-center justify-between gap-4 max-sm:flex-col-reverse max-sm:items-stretch">
        <v-checkbox
          class="shrink-0"
          density="compact"
          hide-details
          label="Отправить всем"
          :model-value="isAllSelected"
          @update:model-value="setAllSelected"
        />

        <v-autocomplete
          v-model="form.members"
          class="w-[336px] max-sm:w-full"
          chips
          clearable
          closable-chips
          density="compact"
          hide-details
          item-value="id"
          label="Получатели"
          multiple
          no-data-text="Пользователь не найден"
          :disabled="isAllSelected"
          :item-title="getMemberName"
          :items="availableMembers"
          :loading="isLoadingMembers"
        >
          <template #item="{ props: itemProps, item }">
            <v-list-item v-bind="itemProps">
              <template #prepend>
                <UserAvatar :user="getMemberUser(item)" />
              </template>
            </v-list-item>
          </template>
        </v-autocomplete>
      </div>

      <div class="flex items-start justify-between gap-4 max-sm:flex-col-reverse max-sm:items-stretch">
        <v-checkbox
          class="shrink-0"
          density="compact"
          hide-details
          label="Отправить сейчас"
          :model-value="isSendNow"
          @update:model-value="setSendNow"
        />

        <v-text-field
          v-model="form.send_at"
          class="w-[336px] max-sm:w-full"
          density="compact"
          hide-details="auto"
          label="Дата и время отправки"
          type="datetime-local"
          :disabled="isSendNow"
          :error="isDateInvalid"
          :error-messages="
            isDateInvalid ? 'Время не может быть меньше текущего' : undefined
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
          Отменить
        </v-btn>
        <v-btn
          class="normal-case max-sm:w-full"
          color="primary"
          :disabled="!isReadyToSend"
          :loading="isSending"
          @click="onSend"
        >
          Отправить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import dayjs from 'dayjs';

import UserAvatar from '@/components/user-avatar/UserAvatar.vue';
import { useCreateWorkspaceNotification } from '../composables';

import type {
  DtoUser,
  DtoWorkspaceMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  workspaceSlug: string;
}>();

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
    'Не Выбран'
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
