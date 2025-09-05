<template>
  <q-dialog @show="getWorkspaceBackups">
    <q-card class="modal-card">
      <q-card-section class="row items-center q-pb-none">
        <q-avatar icon="folder" class="folder-icon" />
        <h4 class="q-ml-sm">Список копий</h4>
      </q-card-section>
      <div v-if="fromFile === false">
        <div v-if="backups && backups.length > 0" :style="'overflow: hidden'">
          <q-card-section
            :style="'height: 300px; overflow: scroll;'"
            class="q-my-md q-py-none"
          >
            <q-item
              v-for="(backup, item) in backups"
              :key="item"
              class="q-px-none"
            >
              <q-item-section>
                <span>
                  Копия от
                  {{
                    backup.created_at.toString().replace('T', ' ').split('.')[0]
                  }}
                </span>
              </q-item-section>
              <div align="right">
                <q-btn
                  flat
                  no-caps
                  icon="download"
                  class="secondary-btn square-btn"
                  :style="'width: 24px;'"
                  @click="downloadBackup(backup.asset)"
                >
                  <HintTooltip>Скачать копию</HintTooltip>
                </q-btn>
                <q-btn
                  flat
                  no-caps
                  class="primary-btn square-btn q-ml-sm"
                  :style="'width: 24px;'"
                  @click="restoreFromBackup(backup)"
                  v-close-popup
                >
                  <q-icon>
                    <svg
                      width="25"
                      height="24"
                      viewBox="0 0 25 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12.333 7V10.7574C12.333 11.553 12.6491 12.3161 13.2117 12.8787L15.333 15M3.33301 12C3.33301 16.9706 7.36244 21 12.333 21C17.3036 21 21.333 16.9706 21.333 12C21.333 7.02944 17.3036 3 12.333 3C9.21259 3 6.46308 4.58803 4.84856 7M4.84856 7H4.33301V4M4.84856 7H7.33301"
                        stroke="white"
                        stroke-width="1.4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </q-icon>
                  <HintTooltip>Восстановить</HintTooltip>
                </q-btn>
              </div>
            </q-item>
          </q-card-section>
        </div>
        <q-card-section v-else> <span>Нет копий</span> </q-card-section>
      </div>
      <div v-else>
        <q-card-section v-if="!!backupFile">
          {{ backupFile.name }}
        </q-card-section>
        <q-card-section v-else>
          <q-btn
            no-caps
            class="btn upload-btn full-w dropzone"
            v-bind="getRootProps()"
          >
            <input v-bind="getInputProps()" accept=".bin" />
            <p v-if="isDragActive">Перетащите файл сюда...</p>
            <p v-else>Перетащите или нажмите, чтобы выбрать файл</p>
          </q-btn>
        </q-card-section>
      </div>
      <q-card-section class="q-py-none">
        <span
          class="link-like"
          @click="
            fromFile = !fromFile;
            backupFile = undefined;
          "
        >
          Восстановить из {{ !!fromFile ? 'копии' : 'файла' }}</span
        >
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          class="secondary-btn"
          @click="backupFile = undefined"
          v-close-popup
        >
          Отменить
        </q-btn>
        <q-btn
          v-if="fromFile === true"
          flat
          no-caps
          class="primary-btn"
          :disable="!!!backupFile"
          @click="importBackup"
          v-close-popup
        >
          Загрузить
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDropzone } from 'vue3-dropzone';
import { IWorkspaceBackup } from 'src/interfaces/workspaces';
import { defineComponent, ref } from 'vue';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { storeToRefs } from 'pinia';

export default defineComponent({
  name: 'ImportDialog',
  props: ['workspaceSlug'],
  emits: ['success', 'error'],

  setup(props, { emit }) {
    const workspaceStore = useWorkspaceStore();
    const backups = ref<IWorkspaceBackup[]>();
    const { workspaceInfo } = storeToRefs(workspaceStore);
    const fromFile = ref(false);
    const backupFile = ref<File>();

    const getWorkspaceBackups = async () => {
      backups.value = (
        await workspaceStore.getWorkspaceBackups(workspaceInfo.value.slug)
      ).reverse();
    };
    function onDrop(acceptFiles: File[]) {
      backupFile.value = acceptFiles[0];
    }

    const { getRootProps, getInputProps, ...rest } = useDropzone({ onDrop });

    const downloadBackup = (asset: string) => {
      const element = document.createElement('a');
      element.setAttribute('href', `/uploads/${asset}`);
      element.setAttribute(
        'download',
        `backup-${
          props.workspaceSlug?.slug ?? 'workspace'
        }-${new Date().toISOString()}.bin`,
      );
      element.click();
    };

    const restoreFromBackup = async (asset: IWorkspaceBackup) => {
      await workspaceStore
        .importWorkspaceFromMinio(asset)
        .then(() => emit('success'))
        .catch(() => emit('error'));
    };

    const importBackup = async () => {
      try {
        await workspaceStore.uploadAndImportWorkspace(backupFile.value as File);
        emit('success');
      } catch {
        emit('error');
      }
      backupFile.value = undefined;
    };

    return {
      ...rest,
      backups,
      fromFile,
      backupFile,
      importBackup,
      getRootProps,
      getInputProps,
      downloadBackup,
      restoreFromBackup,
      getWorkspaceBackups,
    };
  },
});
</script>
