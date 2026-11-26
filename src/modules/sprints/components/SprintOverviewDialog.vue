<template>
  <v-dialog
    :model-value="!!action"
    :persistent="saving"
    max-width="700"
    @update:model-value="close"
  >
    <v-card v-if="action" rounded="xl">
      <v-form @submit.prevent="submit">
        <v-card-title class="sprint-dialog-title wrap-break-word whitespace-normal">
          {{ t(`sprints.overview.dialog.${action.type}`, { name: 'name' in action ? action.name : '' }) }}
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-if="action.type === 'createFolder' || action.type === 'renameFolder'"
            v-model="name"
            :label="action.type === 'createFolder' ? t('sprints.overview.dialog.folderName') : undefined"
            :aria-label="t('sprints.overview.dialog.folderName')"
            :error-messages="nameError"
            :disabled="saving"
            autofocus
          />
          <template v-else-if="action.type === 'moveSprint'">
            <fieldset :disabled="saving">
              <legend class="sr-only">{{ t('sprints.overview.dialog.folder') }}</legend>
              <div v-for="folder in namedFolders" :key="folder.id" class="flex min-h-12 items-center gap-2">
                <label
                  class="flex min-h-12 min-w-0 cursor-pointer items-center gap-2"
                  :class="{ 'flex-1': editingFolderId !== folder.id }"
                >
                  <input
                    v-model="selectedFolder"
                    class="sprint-folder-radio"
                    type="radio"
                    name="sprint-folder"
                    :value="folder.id"
                    :aria-label="editingFolderId === folder.id ? folder.name : undefined"
                  />
                  <span v-if="editingFolderId !== folder.id" class="min-w-0 wrap-break-word">
                    {{ folderNameDrafts.get(folder.id) ?? folder.name }}
                    <small v-if="folderNameErrors.has(folder.id)" class="block text-error">
                      {{ folderNameErrors.get(folder.id) }}
                    </small>
                  </span>
                </label>
                <v-text-field
                  v-if="editingFolderId === folder.id"
                  class="min-w-0 flex-1"
                  :model-value="folderNameDrafts.get(folder.id) ?? folder.name"
                  :aria-label="t('sprints.overview.dialog.folderName')"
                  :error-messages="folderNameErrors.get(folder.id)"
                  :disabled="saving"
                  density="compact"
                  hide-details="auto"
                  autofocus
                  @update:model-value="folderNameDrafts.set(folder.id, $event ?? '')"
                />
                <v-btn
                  type="button"
                  icon
                  size="x-small"
                  variant="text"
                  color="text"
                  :aria-label="t('sprints.overview.dialog.renameFolder', { name: folder.name ?? '' })"
                  :title="t('sprints.overview.renameFolder')"
                  @click="editingFolderId = folder.id"
                >
                  <EditIcon :width="16" :height="16" />
                </v-btn>
                <span
                  class="inline-flex"
                  :tabindex="folder.sprints.length ? 0 : undefined"
                  :aria-label="folder.sprints.length ? t('sprints.overview.deleteFolder') : undefined"
                >
                  <v-btn
                    type="button"
                    icon
                    size="x-small"
                    variant="text"
                    color="error"
                    :aria-label="t('sprints.overview.deleteFolder')"
                    :title="folder.sprints.length ? undefined : t('sprints.overview.deleteFolder')"
                    :disabled="folder.sprints.length > 0"
                    @click="emit('folderAction', { type: 'deleteFolder', id: folder.id, name: folder.name ?? '' })"
                  >
                    <BinIcon :width="16" :height="16" color="currentColor" />
                  </v-btn>
                  <v-tooltip
                    v-if="folder.sprints.length"
                    activator="parent"
                    location="bottom"
                    :text="t('sprints.overview.onlyEmptyFolderCanBeDeleted')"
                  />
                </span>
              </div>
              <label class="flex min-h-12 cursor-pointer items-center gap-2">
                <input
                  v-model="selectedFolder"
                  class="sprint-folder-radio sprint-folder-radio--root"
                  type="radio"
                  name="sprint-folder"
                  :value="ROOT_SPRINT_FOLDER_ID"
                />
                <span>{{ t('sprints.overview.noFolder') }}</span>
              </label>
            </fieldset>
            <v-btn
              v-if="canCreateFolder"
              type="button"
              variant="text"
              color="text"
              prepend-icon="mdi-plus"
              @click="emit('folderAction', { type: 'createFolder' })"
            >
              {{ t('sprints.overview.createFolder') }}
            </v-btn>
          </template>
          <p v-else class="wrap-break-word">
            {{ t(`sprints.overview.dialog.${action.type}Confirm`, { name: action.name }) }}
          </p>
          <p v-if="saveFailed" class="mt-2 text-error" role="alert">
            {{ t('sprints.overview.dialog.saveError') }}
          </p>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="outlined" color="primary" min-width="110" :disabled="saving" @click="close(false)">
            {{ t('sprints.overview.dialog.cancel') }}
          </v-btn>
          <v-btn
            type="submit"
            :variant="isDelete ? 'outlined' : 'flat'"
            :color="isDelete ? 'error' : 'primary'"
            min-width="110"
            :loading="saving"
            :disabled="!canSubmit || saving"
          >
            {{ t(isDelete ? 'common.actions.delete' : action.type === 'createFolder' ? 'common.actions.create' : 'common.actions.save') }}
          </v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import EditIcon from '@/components/icons/EditIcon.vue';
import BinIcon from '@/components/sidebar/icons/BinIcon.vue';
import { toast } from '@/modules/toast';
import { sprintService } from '../api/sprint.service';
import { ROOT_SPRINT_FOLDER_ID, type SprintFolder, type SprintOverviewAction } from '../model/sprint-folders';

const props = withDefaults(
  defineProps<{ workspaceSlug: string; folders?: SprintFolder[]; canCreateFolder?: boolean }>(),
  { folders: () => [] },
);
const action = defineModel<SprintOverviewAction | null>({ required: true });
const emit = defineEmits<{
  saved: [workspaceSlug: string, action: SprintOverviewAction];
  folderAction: [action: SprintOverviewAction];
}>();
const { t } = useI18n();
const name = ref('');
const selectedFolder = ref(ROOT_SPRINT_FOLDER_ID);
const editingFolderId = ref<string>();
const folderNameDrafts = reactive(new Map<string, string>());
const saving = ref(false);
const saveFailed = ref(false);

const isFolderName = computed(() => action.value?.type === 'createFolder' || action.value?.type === 'renameFolder');
const isDelete = computed(() => action.value?.type === 'deleteFolder' || action.value?.type === 'deleteSprint');
const namedFolders = computed(() => props.folders.filter(({ id }) => id !== ROOT_SPRINT_FOLDER_ID));

function duplicateFolderName(value: string, editingId?: string) {
  const normalized = value.trim().toLowerCase();
  return namedFolders.value.some((folder) =>
    folder.id !== editingId &&
    (folder.name?.trim().toLowerCase() === normalized ||
      folderNameDrafts.get(folder.id)?.trim().toLowerCase() === normalized),
  );
}

const nameError = computed(() => {
  if (!isFolderName.value || !name.value.trim()) return '';
  const editingId = action.value?.type === 'renameFolder' ? action.value.id : undefined;
  return duplicateFolderName(name.value, editingId) ? t('sprints.overview.dialog.duplicateName') : '';
});
const folderRenames = computed(() => namedFolders.value.flatMap(({ id, name }) => {
  const draft = folderNameDrafts.get(id)?.trim();
  return draft !== undefined && draft !== (name ?? '').trim() ? [{ id, name: draft }] : [];
}));
const folderNameErrors = computed(() => {
  const errors = new Map<string, string>();
  for (const { id, name } of folderRenames.value) {
    if (!name) errors.set(id, t('sprints.overview.dialog.requiredName'));
    else if (duplicateFolderName(name, id)) errors.set(id, t('sprints.overview.dialog.duplicateName'));
  }
  return errors;
});
const canSubmit = computed(() => {
  const current = action.value;
  if (!current) return false;
  switch (current.type) {
    case 'createFolder':
      return !!name.value.trim() && !nameError.value;
    case 'renameFolder':
      return !!name.value.trim() && name.value.trim() !== current.name && !nameError.value;
    case 'moveSprint':
      return !folderNameErrors.value.size &&
        (selectedFolder.value !== current.folderId || folderRenames.value.length > 0) &&
        (selectedFolder.value === current.folderId || selectedFolder.value === ROOT_SPRINT_FOLDER_ID ||
          namedFolders.value.some(({ id }) => id === selectedFolder.value));
    case 'deleteFolder':
      return props.folders.some(({ id, sprints }) => id === current.id && !sprints.length);
    case 'deleteSprint':
      return true;
  }
});

watch(action, (current) => {
  name.value = current?.type === 'renameFolder' ? current.name : '';
  selectedFolder.value = current?.type === 'moveSprint' ? current.folderId : ROOT_SPRINT_FOLDER_ID;
  editingFolderId.value = undefined;
  folderNameDrafts.clear();
  saveFailed.value = false;
});

watch(namedFolders, (folders) => {
  const current = action.value;
  if (current?.type !== 'moveSprint') return;
  const ids = new Set(folders.map(({ id }) => id));
  for (const id of folderNameDrafts.keys()) {
    if (!ids.has(id)) folderNameDrafts.delete(id);
  }
  if (editingFolderId.value && !ids.has(editingFolderId.value)) editingFolderId.value = undefined;
  if (selectedFolder.value !== ROOT_SPRINT_FOLDER_ID &&
      !ids.has(selectedFolder.value)) {
    selectedFolder.value = current.folderId;
  }
});

function close(open: boolean) {
  if (!open && !saving.value) action.value = null;
}

async function submit() {
  const current = action.value;
  if (!current || !canSubmit.value || saving.value) return;
  const workspace = props.workspaceSlug;
  saving.value = true;
  saveFailed.value = false;
  let changed = false;
  try {
    switch (current.type) {
      case 'createFolder':
        await sprintService.createFolder(workspace, name.value.trim());
        break;
      case 'renameFolder':
        await sprintService.renameFolder(workspace, current.id, name.value.trim());
        break;
      case 'moveSprint': {
        const destination = selectedFolder.value;
        for (const folder of folderRenames.value) {
          await sprintService.renameFolder(workspace, folder.id, folder.name);
          folderNameDrafts.delete(folder.id);
          changed = true;
        }
        if (destination !== current.folderId) await sprintService.moveToFolder(workspace, current.id, destination);
        break;
      }
      case 'deleteFolder':
        await sprintService.deleteFolder(workspace, current.id);
        break;
      case 'deleteSprint':
        await sprintService.delete(workspace, current.id);
        break;
    }
    changed = true;
    if (action.value !== current || workspace !== props.workspaceSlug) return;
    action.value = null;
    toast.success();
  } catch {
    if (action.value === current && workspace === props.workspaceSlug) saveFailed.value = true;
  } finally {
    saving.value = false;
    if (changed && workspace === props.workspaceSlug) emit('saved', workspace, current);
  }
}
</script>

<style scoped>
.sprint-dialog-title {
  font-size: 18px;
  font-weight: 600;
}

.sprint-folder-radio {
  --radio-selected-color: rgb(var(--v-theme-primary));
  appearance: none;
  flex: none;
  width: 20px;
  height: 20px;
  border: 2px solid rgb(var(--v-theme-text));
  border-radius: 50%;
  cursor: pointer;
}

.sprint-folder-radio:checked {
  border-color: var(--radio-selected-color);
  background: radial-gradient(circle, var(--radio-selected-color) 5px, transparent 5.5px);
}

.sprint-folder-radio--root {
  --radio-selected-color: #808080;
}

.sprint-folder-radio:focus-visible {
  outline: 2px solid var(--radio-selected-color);
  outline-offset: 2px;
}

@media (forced-colors: active) {
  .sprint-folder-radio {
    appearance: auto;
  }
}
</style>
