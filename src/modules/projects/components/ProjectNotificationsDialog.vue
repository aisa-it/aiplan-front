<template>
  <v-dialog
    :model-value="!!target"
    :persistent="saving"
    :aria-labelledby="titleId"
    width="608"
    max-width="calc(100% - 32px)"
    class="project-notifications-dialog"
    @update:model-value="onDialogUpdate"
  >
    <v-card v-if="target" class="rounded-xl">
      <v-card-title :id="titleId" class="project-notifications-title">
        {{
          t(`projects.notificationSettings.${target.kind}Title`, {
            name: target.projectName,
          })
        }}
      </v-card-title>
      <v-tabs
        v-model="channel"
        grow
        color="primary"
        density="compact"
        class="mx-4"
      >
        <v-tab
          v-for="option in notificationChannels"
          :key="option"
          :value="option"
          class="project-notifications-tab"
        >
          {{ t(`projects.notificationSettings.${option}`) }}
        </v-tab>
      </v-tabs>

      <v-card-text>
        <div v-if="loading" class="py-8 text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            :aria-label="t('common.states.loading')"
          />
        </div>
        <p v-else-if="!draft">
          {{ t('projects.notificationSettings.loadError') }}
        </p>
        <template v-else>
          <p v-if="muted" class="px-2 text-warning">
            {{ t('projects.notificationSettings.muted') }}
          </p>
          <p class="project-notifications-subtitle mb-2 px-2">
            {{ t(`projects.notificationSettings.${channel}Subtitle`) }}
          </p>

          <div
            class="project-notifications-list"
            :class="{ 'project-notifications-list--task': target.kind === 'task' }"
          >
            <div class="project-notifications-row project-notifications-header">
              <strong>{{ t('projects.notificationSettings.name') }}</strong>
              <span v-for="column in columns" :key="column.key">
                {{ t(`projects.notificationSettings.${column.label}`) }}
              </span>
            </div>
            <div
              v-for="row in rows"
              :key="row ?? 'all'"
              class="project-notifications-row"
            >
              <span>{{ labelFor(row) }}</span>
              <v-checkbox-btn
                v-for="column in columns"
                :key="column.key"
                class="project-notifications-checkbox"
                density="compact"
                color="primary"
                :aria-label="`${labelFor(row)} — ${t(`projects.notificationSettings.${column.label}`)}`"
                :disabled="muted || saving"
                :model-value="row
                  ? isEnabled(column.key, row)
                  : fields.every((field) => isEnabled(column.key, field))"
                @update:model-value="
                  setEnabled(column.key, row ? [row] : fields, $event === true)
                "
              />
            </div>
          </div>
        </template>
      </v-card-text>

      <v-card-actions class="project-notifications-actions">
        <v-btn
          color="primary"
          variant="outlined"
          :disabled="saving"
          @click="target = null"
        >
          {{ t('projects.notificationSettings.cancel') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          :disabled="!draft || muted"
          :loading="saving"
          @click="save"
        >
          {{ t('common.actions.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import type { AiplanProjectNotificationRequest } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ProjectService } from '@/services/project.service';
import { useUserStore } from '@/stores/user-store';
import { toast } from '@/modules/toast';
import {
  copyNotificationSettings,
  notificationChannels,
  notificationFields,
  notificationMuteKeys,
  type NotificationChannel,
  type NotificationField,
  type NotificationSettingsKey,
  type ProjectNotificationTarget,
} from '../model/project-notifications';

const target = defineModel<ProjectNotificationTarget | null>({ required: true });
const titleId = useId();
const { user } = storeToRefs(useUserStore());
const { t } = useI18n();
const channel = ref<NotificationChannel>('email');
const draft = ref<AiplanProjectNotificationRequest | null>(null);
const loading = ref(false);
const saving = ref(false);

const muted = computed(
  () => !!user.value?.settings?.[notificationMuteKeys[channel.value]],
);
const fields = computed(() => notificationFields[target.value?.kind ?? 'task']);
const rows = computed(() => [null, ...fields.value]);
const memberKey = computed(
  () => `notification_settings_${channel.value}` as const,
);
const authorKey = computed(
  () => `notification_author_settings_${channel.value}` as const,
);
const columns = computed(() =>
  target.value?.kind === 'project'
    ? [{ key: memberKey.value, label: 'enabled' } as const]
    : [
        { key: authorKey.value, label: 'author' } as const,
        { key: memberKey.value, label: 'member' } as const,
      ],
);

function onDialogUpdate(open: boolean) {
  if (!open) target.value = null;
}

watch(
  target,
  async (selected, _, onCleanup) => {
    draft.value = null;
    channel.value = 'email';
    loading.value = !!selected;
    saving.value = false;
    if (!selected) return;

    const controller = new AbortController();
    onCleanup(() => controller.abort());
    try {
      const membership = await ProjectService.getMeInProject(
        selected.workspaceSlug,
        selected.projectId,
        controller.signal,
      );
      if (!controller.signal.aborted) {
        draft.value = copyNotificationSettings(membership);
      }
    } catch {
      // API errors are displayed by the response interceptor.
    } finally {
      if (!controller.signal.aborted) loading.value = false;
    }
  },
  { immediate: true },
);

function labelFor(field: NotificationField | null) {
  return field
    ? t(`projects.notificationSettings.fields.${field}`)
    : t('projects.notificationSettings.all');
}

function isEnabled(key: NotificationSettingsKey, field: NotificationField) {
  const flag = draft.value?.[key]?.[field];
  return target.value?.kind === 'project' ? !flag : flag === false;
}

function setEnabled(
  key: NotificationSettingsKey,
  fields: readonly NotificationField[],
  enabled: boolean,
) {
  if (!draft.value || muted.value || saving.value) return;
  const changes = Object.fromEntries(fields.map((field) => [field, !enabled]));
  draft.value[key] = { ...draft.value[key], ...changes };
  // Project events use the same setting for both roles in Email and Telegram.
  if (target.value?.kind === 'project' && channel.value !== 'app') {
    draft.value[authorKey.value] = { ...draft.value[authorKey.value], ...changes };
  }
}

async function save() {
  const selected = target.value;
  if (!selected || !draft.value || muted.value || saving.value) return;
  saving.value = true;
  try {
    await ProjectService.updateMyNotifications(
      selected.workspaceSlug,
      selected.projectId,
      draft.value,
    );
    if (target.value !== selected) return;
    toast.success();
    target.value = null;
  } catch {
    // The interceptor displays the API error and the draft stays open for retry.
  } finally {
    if (target.value === selected) saving.value = false;
  }
}
</script>

<style scoped src="../styles/ProjectNotificationsDialog.css"></style>
