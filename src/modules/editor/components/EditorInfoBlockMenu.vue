<template>
  <v-menu v-model="isOpen">
    <template #activator="{ props: menuProps }">
      <v-tooltip :text="t('editor.information')" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...menuProps, ...tooltipProps }"
            :aria-label="t('editor.information')"
            :class="{ 'editor-info-menu__button--active': isActive }"
            :color="isActive ? 'primary' : 'text'"
            :disabled="disabled"
            icon
            size="small"
            variant="text"
            class="editor-info-menu__button"
          >
            <EditorIcon name="info" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-card class="editor-info-menu__card" elevation="4">
      <v-btn
        v-for="option in options"
        :key="option.name"
        :icon="option.icon"
        :color="option.color"
        :aria-label="option.label"
        :title="option.label"
        size="small"
        variant="text"
        @click="selectInfoBlock(option)"
      />
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, ref } from 'vue';
import type { Editor } from '@tiptap/vue-3';
import { useTheme } from 'vuetify';

import { useEditorRevision } from '../composables/useEditorRevision';
import EditorIcon from './EditorIcon.vue';
import { getSelectedEditorBlock } from '../utils/selectEditorBlockContent';

const { t } = useI18n();

interface InfoBlockOption {
  name: string;
  icon: string;
  label: string;
  color: string;
}

const props = withDefaults(
  defineProps<{
    editor: Editor;
    disabled?: boolean;
  }>(),
  {
    disabled: false,
  },
);

const theme = useTheme();
const revision = useEditorRevision(props.editor);
const isOpen = ref(false);
const isActive = computed(() => {
  void revision.value;
  return props.editor.isActive('info-block');
});
const options = computed<InfoBlockOption[]>(() => {
  const dark = theme.current.value.dark;

  return [
    {
      name: 'infoIcon',
      icon: 'mdi-information-outline',
      label: t('editor.information'),
      color: dark ? '#7EA2FC' : '#3F76FF',
    },
    {
      name: 'checkStatusIcon',
      icon: 'mdi-check-circle-outline',
      label: t('editor.success'),
      color: dark ? '#7CB342' : '#43A047',
    },
    {
      name: 'closeIconBorder',
      icon: 'mdi-close-box-outline',
      label: t('editor.error'),
      color: dark ? '#FF7A7A' : '#DC3E3E',
    },
    {
      name: 'alertIcon',
      icon: 'mdi-alert-outline',
      label: t('editor.warning'),
      color: dark ? '#FFAB00' : '#FF8B00',
    },
  ];
});

const getActiveInfoBlock = () => getSelectedEditorBlock(props.editor, 'info-block');

const selectInfoBlock = (option: InfoBlockOption) => {
  const activeBlock = getActiveInfoBlock();

  if (activeBlock) {
    const transaction = props.editor.state.tr.setNodeMarkup(
      activeBlock.pos,
      undefined,
      {
        ...activeBlock.node.attrs,
        icon: option.name,
        iconColor: option.color,
      },
    );
    props.editor.view.dispatch(transaction);
  } else {
    props.editor
      .chain()
      .focus()
      .setInfoBlock({ icon: option.name, iconColor: option.color })
      .run();
  }

  isOpen.value = false;
};
</script>

<style scoped>
.editor-info-menu__button {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}

.editor-info-menu__button--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.editor-info-menu__card {
  display: flex;
  gap: 4px;
  padding: 6px;
}
</style>
