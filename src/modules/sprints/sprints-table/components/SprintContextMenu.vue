<template>
  <q-menu
    ref="menuRef"
    class="context-menu"
    :style="`z-index: ${ isDeletingOpen ? 6000 : 9001}`"
    v-bind="menuProps"
    touch-position
  >
    <q-list class="context-menu__options-list" separator>
      <q-item clickable v-close-popup @click="copySprintLink">
        <q-item-section thumbnail class="q-px-md">
          <CopyLinkIcon />
        </q-item-section>
        <q-item-section>Скопировать ссылку</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="openInNewTab">
        <q-item-section thumbnail class="q-px-md">
          <OpenNewTabIcon :height="24" />
        </q-item-section>
        <q-item-section>Открыть в новой вкладке</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="openInNewWindow">
        <q-item-section thumbnail class="q-px-md">
          <OpenNewWindowIcon />
        </q-item-section>
        <q-item-section>Открыть в новом окне</q-item-section>
      </q-item>
      <q-item clickable v-close-popup @click="copySprintTitle">
        <q-item-section thumbnail class="q-px-md">
          <CopyNameIcon />
        </q-item-section>
        <q-item-section>Скопировать название</q-item-section>
      </q-item>
      <q-item
        class="context-menu__options-item_red"
        clickable
        @click="deleteSprint"
      >
        <q-item-section thumbnail class="q-px-md">
          <BinIcon color="#cd5c5c" />
        </q-item-section>
        <q-item-section>Удалить</q-item-section>
      </q-item>
    </q-list>
    <DeleteSprintDialog
      v-model="isDeletingOpen"
      :sprint="props.row"
      @success="successDeleteHandle"
      @error="errorDeleteHandle"
    />
  </q-menu>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import { useNotificationStore } from 'src/stores/notification-store';

import CopyLinkIcon from 'src/components/icons/CopyLinkIcon.vue';
import OpenNewTabIcon from 'src/components/icons/OpenNewTabIcon.vue';
import OpenNewWindowIcon from 'src/components/icons/OpenNewWindowIcon.vue';
import CopyNameIcon from 'src/components/icons/CopyNameIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';
import { DtoSprintLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import DeleteSprintDialog from 'src/modules/sprints/delete-sprint-dialog/DeleteSprintDialog.vue'

const props = defineProps<{
  row: DtoSprintLight | null;
  anchorEvent?: MouseEvent | null;
}>();

const emit = defineEmits<{
  refresh: [];
}>();

const menuRef = ref<any>(null);

const isControlled = computed(() => !!props.anchorEvent);

const menuProps = computed(() => {
  return isControlled.value ? {} : { 'context-menu': true };
});

const { setNotificationView } = useNotificationStore();

let sprintLink = computed(() => props.row?.short_url ?? props.row?.url ?? '');
const isDeletingOpen = ref<boolean>(false);

const copySprintLink = (): void => {
  try {
    navigator.clipboard.writeText(sprintLink.value);
  } catch {
    console.error('Произошла ошибка при копировании ссылки');
  }
};

const openInNewTab = (): void => {
  window.open(sprintLink.value, '_blank');
};

const openInNewWindow = (): void => {
  window.open(sprintLink.value, '_blank', 'popup');
};

const copySprintTitle = (): void => {
  try {
    navigator.clipboard.writeText(props.row?.name as string);
  } catch {
    console.error('Произошла ошибка при копировании названия');
  }
};

const deleteSprint = (): void => {
  isDeletingOpen.value = true;
};

const showNotification = (type: 'success' | 'error', msg?: string) => {
  setNotificationView({
    open: true,
    type: type,
    customMessage: msg,
  });
};

const successDeleteHandle = () => {
  showNotification('success', 'Спринт удален');
  emit('refresh');
};

const errorDeleteHandle = () => {
  showNotification('error', 'Ошибка удаления спринта');
}

watch(
  () => props.anchorEvent,
  async (evt) => {
    if (evt && menuRef.value) {
      menuRef.value.hide();
      await nextTick();
      menuRef.value.show(evt);
    }
  },
);
</script>

<style lang="scss" scoped>
.context-menu {
  &__options-item {
    &_red {
      color: red;
    }
  }

  &__options-item_red {
    > .q-item__section {
      color: #cd5c5c !important;
    }

    &:hover > .q-item__section {
      color: red !important;
      ::v-deep(svg path) {
        fill: red !important;
      }
    }
  }
}
</style>
