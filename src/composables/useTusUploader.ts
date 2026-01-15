import { computed, ref } from 'vue';
import * as tus from 'tus-js-client';

export type UploadType = 'simulate' | 'tus';
export type EntityType = 'issue' | 'doc';

export interface UploadFileState {
  name: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error' | 'cancelled';
  size?: number;
  error?: string;
  id?: string;
}

interface UseUploaderOptions {
  type: UploadType;
  uploadUrl?: string;
  entityId?: string;
  entityType?: EntityType;
  concurrency?: number;
  onNotify?: (payload: {
    type: 'success' | 'error' | 'cancelled';
    file: UploadFileState;
    message?: string;
    onClick?: () => void;
  }) => void;
}

export function useTusUploader(options: UseUploaderOptions) {
  const queue = ref<File[]>([]);
  const activeCount = ref(0);
  const uploading = ref(false);
  const uploadsState = ref<UploadFileState[]>([]);

  const fileMap = new Map<string, File>();
  const activeTus = new Map<string, tus.Upload>();
  const activeSim = new Map<string, () => void>();

  // Для отслеживания всех промисов загрузки
  const allUploads = ref<Promise<void>[]>([]);

  const isAllUploaded = computed(() => {
    return uploadsState.value.every((f) => f.status === 'success');
  });

  const notify = (
    type: 'success' | 'error' | 'cancelled',
    file: UploadFileState,
    message?: string,
    onClick?: () => void,
  ) => {
    options.onNotify?.({ type, message, file, onClick });
  };

  const updateState = (name: string, patch: Partial<UploadFileState>) => {
    const state = uploadsState.value.find((f) => f.name === name);
    if (state) Object.assign(state, patch);
  };

  const enqueue = (file: File) => {
    if (fileMap.has(file.name)) {
      notify(
        'error',
        {
          name: file.name,
          progress: 0,
          status: 'cancelled',
          size: file.size,
        },
        `Файл "${file.name}" уже в очереди.`,
        () => void 0,
      );
      return;
    }
    queue.value.push(file);
    fileMap.set(file.name, file);
    uploadsState.value.push({
      name: file.name,
      progress: 0,
      status: 'pending',
    });
    uploading.value = false;
    processQueue();
  };

  const cancel = (fileName: string) => {
    queue.value = queue.value.filter((f) => f.name !== fileName);
    activeCount.value--;

    for (let i = allUploads.value.length - 1; i >= 0; i--) {
      const p: any = allUploads.value[i];
      if (p && p.fileName === fileName) {
        allUploads.value.splice(i, 1);
      }
    }

    if (options.type === 'simulate') {
      const stop = activeSim.get(fileName);
      if (stop) {
        stop();
        activeSim.delete(fileName);
      }
    } else {
      const upload = activeTus.get(fileName);
      if (upload) {
        upload.abort();
        activeTus.delete(fileName);
      }
    }

    updateState(fileName, { status: 'cancelled' });
    notify('cancelled', {
      name: fileName,
      progress: 0,
      status: 'cancelled',
    });
  };

  const cancelAll = () => {
    for (const file of queue.value) {
      updateState(file.name, { status: 'cancelled' });
    }
    allUploads.value = [];
    queue.value = [];

    const activeKeys =
      options.type === 'tus' ? activeTus.keys() : activeSim.keys();

    for (const fileName of activeKeys) {
      cancel(fileName);
    }
  };

  const deleteFile = (fileName: string) => {
    queue.value = queue.value.filter((f) => f.name !== fileName);
    uploadsState.value = uploadsState.value.filter((f) => f.name !== fileName);
    fileMap.delete(fileName);
  };

  const retry = (fileName: string) => {
    const file = fileMap.get(fileName);
    const state = uploadsState.value.find((f) => f.name === fileName);

    if (!file || !state) return;
    if (state.status !== 'cancelled' && state.status !== 'error') return;

    queue.value.push(file);
    updateState(fileName, {
      progress: 0,
      status: 'pending',
      error: undefined,
    });

    uploading.value = false;
    processQueue();
  };

  const processQueue = async () => {
    if (uploading.value) return;

    uploading.value = true;

    const max = options.concurrency ?? 2;

    while (activeCount.value < max && queue.value.length > 0) {
      const file = queue.value.shift();
      if (!file) continue;

      activeCount.value++;
      updateState(file.name, {
        status: 'uploading',
        progress: 0,
        size: file.size,
      });

      // отслеживание промиса загрузки
      let uploadPromise: Promise<void>;
      try {
        if (options.type === 'simulate') {
          uploadPromise = simulateUpload(file);
        } else {
          uploadPromise = uploadWithTus(file);
        }
        (uploadPromise as any).fileName = file.name;
        allUploads.value.push(uploadPromise);

        await uploadPromise;

        updateState(file.name, { status: 'success', progress: 100 });
        notify('success', {
          name: file.name,
          progress: 100,
          status: 'success',
          size: file.size,
        });
      } catch (err: any) {
        if (err?.message !== 'Upload cancelled') {
          updateState(file.name, { status: 'error', error: err.message });
          notify(
            'error',
            {
              name: file.name,
              progress: 0,
              status: 'error',
              size: file.size,
              error: err.message,
            },
            '',
            () => retry(file.name),
          );
        }
      }

      activeCount.value--;
    }

    uploading.value = false;

    if (queue.value.length > 0) {
      setTimeout(processQueue, 0);
    }
  };

  //  метод ожидания всех загрузок ---
  const waitAll = async () => {
    await Promise.allSettled(allUploads.value);
    // После завершения всех загрузок очищаем массив
    allUploads.value.length = 0;
  };

  const simulateUpload = (file: File): Promise<void> => {
    const total = file.size || 1_000_000;
    const chunkSize = total / 50;
    let uploaded = 0;

    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(() => {
        uploaded = Math.min(uploaded + chunkSize, total);
        updateState(file.name, {
          progress: +((uploaded / total) * 100).toFixed(1),
        });

        if (uploaded >= total) {
          clearInterval(interval);
          activeSim.delete(file.name);
          resolve();
        }
      }, 50);

      activeSim.set(file.name, () => {
        clearInterval(interval);
        reject(new Error('Upload cancelled'));
      });
    });
  };

  function startOrResumeUpload(upload: tus.Upload, fileName: string) {
    // Check if there are any previous uploads to continue.
    upload.findPreviousUploads().then(function (previousUploads) {
      // Found previous uploads so we select the first one.
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0]);
      }
      activeTus.set(fileName, upload);
      // Start the upload
      upload.start();
    });
  }

  const uploadWithTus = (file: File): Promise<void> => {
    if (!options.uploadUrl) {
      return Promise.reject(new Error('Missing upload URL'));
    }

    return new Promise<void>((resolve, reject) => {
      const metadata: Record<string, string> = {
        file_name: file.name,
        file_type: file.type,
        file_size: file.size.toString(),
      };

      if (options.entityId) {
        metadata[`${options.entityType}_id`] = options.entityId;
      }

      if (options.entityType) {
        metadata.entity_type = options.entityType;
      }

      //тестовый урл `https://tusd.tusdemo.net/files/`
      const upload = new tus.Upload(file, {
        endpoint: options.uploadUrl,
        metadata,
        storeFingerprintForResuming: false,
        removeFingerprintOnSuccess: true,
        retryDelays: [0, 1000, 3000, 5000],

        onError: (error) => {
          activeTus.delete(file.name);
          reject(error);
        },
        onProgress: (uploaded, total) => {
          updateState(file.name, {
            progress: +((uploaded / total) * 100).toFixed(1),
          });
        },
        onSuccess: () => {
          activeTus.delete(file.name);
          let id: string | undefined = undefined;
          if (upload.url) {
            const parts = upload.url.split('/');
            id = parts[parts.length - 1] || undefined;
          }

          updateState(file.name, {
            id,
            status: 'success',
          });
          resolve();
        },
      });

      startOrResumeUpload(upload, file.name);
    });
  };

  const resetTusStates = () => {
    uploadsState.value = [];
    allUploads.value = [];
    queue.value = [];
    activeTus.clear();
    activeSim.clear();
    fileMap.clear();
    uploading.value = false;
    activeCount.value = 0;
  };

  return {
    retry,
    cancel,
    enqueue,
    cancelAll,
    deleteFile,
    resetTusStates,
    waitAll,
    uploading,
    uploadsState,
    activeCount,
    isAllUploaded,
  };
}
