<template>
  <div class="q-pb-xs q-px-sm">
    <div class="flex no-wrap q-mb-xs">
      <span
        v-if="readOnly"
        class="base-title text-bold full-w centered-horisontally"
      >
        {{ documentTitle }}
      </span>
      <q-input
        v-else
        v-model="documentTitle"
        class="base-textarea base-textarea-sm text-bold full-w input-editor-header"
        :class="[
          {
            'readonly-title-issue': readOnly,
            'no-outline': true,
          },
          isAutoSave ? preventClickClass : '',
        ]"
        hide-bottom-space
        :readonly="readOnly"
        autogrow
        :rules="rules"
        @update:model-value="emit('update:modelValue', documentTitle)"
      >
      </q-input>
      <div class="flex no-wrap" style="height: 32px">
        <q-btn
          v-if="canEdit"
          class="btn-only-icon-sm"
          dense
          flat
          no-caps
          no-wrap
          :class="isAutoSave ? preventClickClass : ''"
          :disable="
            !readOnly &&
            (documentTitle.length > 150 || documentTitle.length <= 0)
          "
          @click="editTitle"
        >
          <HintTooltip v-if="readOnly">Редактировать</HintTooltip>
          <HintTooltip v-else>Сохранить</HintTooltip>
          <EditIcon v-if="readOnly" :width="24" :height="24" />
          <CheckIcon v-else :width="24" :height="24" />
        </q-btn>
        <q-btn
          v-if="screen.gt.sm"
          class="btn-only-icon-sm"
          dense
          flat
          no-wrap
          no-caps
          align="center"
          @click="openRulesDialog"
        >
          <q-icon name="manage_accounts" dense size="24px" />
          <HintTooltip>Права доступа</HintTooltip>
        </q-btn>
        <q-btn
          v-if="screen.gt.md"
          dense
          flat
          class="btn-only-icon-sm"
          no-caps
          no-wrap
          align="center"
          @click="openWatchersDialog"
        >
          <q-icon name="visibility" dense size="24px" />
          <HintTooltip>Наблюдатели</HintTooltip>
        </q-btn>
        <AidocVersionSelect
          v-if="screen.gt.md"
          :docVersionList="docVersionList"
          :isDisabled="!canEdit"
          mini
          @refresh="emit('refresh')"
        />
        <q-btn
          v-if="screen.gt.lg"
          dense
          flat
          no-wrap
          no-caps
          class="btn-only-icon-sm"
          @click="copyLink(props.document.short_url)"
        >
          <LinkIcon :width="24" :height="24" />
          <HintTooltip>Скопировать ссылку</HintTooltip>
        </q-btn>
        <q-btn
          v-if="isAdminOrAuthor && canEdit && screen.gt.lg"
          class="btn-only-icon-sm"
          dense
          flat
          no-wrap
          no-caps
          @click="emit('openDeleteDialog')"
        >
          <HintTooltip>Удалить</HintTooltip>
          <BinIcon color="#dc3e3e" :width="24" :height="24"></BinIcon>
        </q-btn>
        <q-btn
          v-if="!readOnly"
          dense
          flat
          class="btn-only-icon-sm"
          @click="closeEditor"
        >
          <CloseIcon />
        </q-btn>
        <q-btn v-if="screen.lt.xl" class="btn-only-icon-sm" dense flat>
          <q-icon name="more_vert" :width="24" :height="24" />
          <q-popup-proxy
            ref="popup"
            class="hide-scrollbar menu q-pa-sm"
            style="margin-top: 4px !important"
            breakpoint="0"
          >
            <div class="flex flex-col">
              <q-btn
                v-if="screen.lt.md"
                class="btn-only-icon-sm"
                dense
                flat
                no-wrap
                no-caps
                align="left"
                @click="openRulesDialog"
              >
                <q-icon name="manage_accounts" dense size="24px" />
                <span class="q-ml-xs">Права доступа</span>
                <HintTooltip>Права доступа</HintTooltip>
              </q-btn>
              <q-btn
                v-if="screen.lt.lg"
                dense
                flat
                class="btn-only-icon-sm"
                no-caps
                no-wrap
                align="left"
                @click="openWatchersDialog"
              >
                <q-icon name="visibility" dense size="24px" />
                <span class="q-ml-xs">Наблюдатели</span>
                <HintTooltip>Наблюдатели</HintTooltip>
              </q-btn>
              <AidocVersionSelect
                v-if="screen.lt.lg"
                @refresh="emit('refresh')"
                :docVersionList="docVersionList"
                :isDisabled="!canEdit"
              />
              <q-btn
                v-if="screen.lt.xl"
                dense
                flat
                no-wrap
                no-caps
                class="btn-only-icon-sm"
                align="left"
                @click="copyLink(props.document.short_url)"
              >
                <LinkIcon :width="24" :height="24" />
                <span class="q-ml-xs">Скопировать ссылку</span>
                <HintTooltip>Скопировать ссылку</HintTooltip>
              </q-btn>
              <q-btn
                v-if="isAdminOrAuthor && canEdit && screen.lt.xl"
                class="btn-only-icon-sm red-btn"
                dense
                flat
                no-wrap
                no-caps
                align="left"
                @click="emit('openDeleteDialog')"
              >
                <HintTooltip>Удалить</HintTooltip>
                <BinIcon color="#dc3e3e" :width="24" :height="24"></BinIcon>
                <span class="q-ml-xs">Удалить </span>
              </q-btn>
            </div>
          </q-popup-proxy>
        </q-btn>
      </div>
    </div>
    <div class="text-caption text-grey">
      <span
        >Создал(а)
        <UserLink
          :member="getAuthor"
          @click="navigateToActivityPage(getAuthor?.id)"
        />
        {{ createDate }}
      </span>
      <span v-if="document.update_by"
        >, редактировал(а)
        <UserLink
          :member="getLastUpdateBy"
          @click="navigateToActivityPage(getLastUpdateBy?.id)"
        />
        {{ updateDate }}</span
      >
    </div>

    <AidocRulesDialog
      v-model="isRulesDialogOpen"
      :roles="{
        editor_role: document.editor_role,
        reader_role: document.reader_role,
        reader_ids: document.reader_ids,
        editor_ids: document.editor_ids,
      }"
      :isAdminOrAuthor="isAdminOrAuthor"
      @update:roles="(val) => emit('updateDocument', val)"
    />

    <AidocWatchersDialog
      v-model="isWatchersDialogOpen"
      :can-edit="canEdit"
      :doc-id="document.id"
      :watchers="document.watchers"
      :loading="loading"
      @refresh="emit('refresh')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import EditIcon from './icons/EditIcon.vue';
import CheckIcon from './icons/CheckIcon.vue';
import CloseIcon from './icons/CloseIcon.vue';
import UserLink from 'src/components/UserLink.vue';
import AidocRulesDialog from './aidoc/AidocRulesDialog.vue';
import {
  DtoDoc,
  DtoHistoryBodyLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import LinkIcon from './icons/LinkIcon.vue';
import { useQuasar } from 'quasar';
import {
  ERROR_COPY_LINK_TO_CLIPBOARD,
  SUCCESS_COPY_LINK_TO_CLIPBOARD,
} from 'src/constants/notifications';
import { useNotificationStore } from 'src/stores/notification-store';
import AidocVersionSelect from './aidoc/AidocVersionSelect.vue';
import BinIcon from './icons/BinIcon.vue';
import AidocWatchersDialog from './aidoc/AidocWatchersDialog.vue';
import { useMenuHandler } from 'src/composables/useMenuHandler';
import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

const props = defineProps<{
  modelValue: string;
  canEdit: boolean;
  isAutoSave?: boolean;
  rules?: object;
  preventClickClass?: string;
  listItem?: object;
  document: DtoDoc;
  docVersionList: DtoHistoryBodyLight[];
  loading?: boolean;
  isAdminOrAuthor: boolean;
  createDate?: string;
  updateDate?: string;
}>();

const emit = defineEmits([
  'update:modelValue',
  'saveValue',
  'updateDocument',
  'refresh',
  'openDeleteDialog',
]);

const $q = useQuasar();
const { screen } = $q;

const { setNotificationView } = useNotificationStore();
const readOnly = ref(true);
const documentTitle = ref('');
const popup = ref();
const isRulesDialogOpen = ref(false);
const isWatchersDialogOpen = ref(false);
const getAuthor = computed(() => props.document.author);
const getLastUpdateBy = computed(() => props.document.update_by);

const { navigateToActivityPage } = useUserActivityNavigation();

const editTitle = () => {
  if (readOnly.value) {
    readOnly.value = false;
  } else {
    emit('update:modelValue', documentTitle.value);
    emit('saveValue');
    readOnly.value = true;
  }
};

const closeEditor = () => {
  documentTitle.value = props.modelValue;
  readOnly.value = true;
};

const copyLink = async (short_url: string | undefined) => {
  if (short_url) {
    try {
      await navigator.clipboard.writeText(short_url);
      setNotificationView({
        open: true,
        type: 'success',
        customMessage: SUCCESS_COPY_LINK_TO_CLIPBOARD,
      });
    } catch (err) {
      setNotificationView({
        open: true,
        type: 'error',
        customMessage: ERROR_COPY_LINK_TO_CLIPBOARD,
      });
    }
  }
};

const openRulesDialog = async () => {
  emit('refresh');
  isRulesDialogOpen.value = true;
};

const openWatchersDialog = async () => {
  emit('refresh');
  isWatchersDialogOpen.value = true;
};

useMenuHandler(popup);

watch(
  () => props.modelValue,
  (newVal) => {
    documentTitle.value = newVal;
  },
);

onMounted(() => {
  documentTitle.value = props.modelValue;
});
</script>

<style lang="scss" scoped>
.input-editor-header textarea {
  min-height: 22px !important;
}

.red-btn {
  color: $negative !important;
}
</style>
