<template>
  <v-menu v-model="isOpen" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip :text="t('editor.link')" location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="{ ...menuProps, ...tooltipProps }"
            :aria-label="t('editor.link')"
            :class="{ 'editor-link-menu__button--active': isActive }"
            :color="isActive ? 'primary' : 'text'"
            :disabled="!canOpen"
            icon
            size="small"
            variant="text"
            class="editor-link-menu__button"
          >
            <EditorIcon name="link" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>

    <v-card class="editor-link-menu__card" elevation="4">
      <form @submit.prevent="saveLink">
        <div class="editor-link-menu__actions">
          <v-btn
            type="submit"
            icon="mdi-content-save-outline"
            :aria-label="t('editor.saveLink')"
            color="primary"
            size="small"
            variant="tonal"
          />
          <v-btn
            v-if="isActive"
            type="button"
            icon="mdi-link-variant-off"
            :aria-label="t('editor.deleteLink')"
            color="error"
            size="small"
            variant="tonal"
            @click="removeLink"
          />
          <v-btn
            type="button"
            icon="mdi-close"
            :aria-label="t('editor.close')"
            size="small"
            variant="text"
            @click="isOpen = false"
          />
        </div>

        <v-btn-toggle v-if="enableAnchors" v-model="mode" mandatory density="compact" color="primary" class="mb-2">
          <v-btn value="url" size="small">{{ t('editor.link') }}</v-btn>
          <v-btn value="anchor" size="small">{{ t('editor.anchorInDocument') }}</v-btn>
        </v-btn-toggle>
        <v-select
          v-if="mode === 'anchor' && anchorTargets.length"
          v-model="anchorId"
          :items="anchorTargets"
          item-title="label"
          item-value="id"
          :label="t('editor.selectAnAnchor')"
          density="compact"
          hide-details="auto"
          variant="outlined"
        />
        <div v-else-if="mode === 'anchor'" class="pa-2 text-caption">{{ t('editor.thisDocumentHasNoAnchorsAddAnAnchorOrHeadingFirst') }}</div>
        <v-text-field
          v-else
          v-model="href"
          :label="t('editor.enterALink')"
          :error-messages="errorMessage"
          autofocus
          density="compact"
          hide-details="auto"
          variant="outlined"
          @update:model-value="errorMessage = ''"
        />
      </form>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { computed, ref, watch } from 'vue';
import type { Editor } from '@tiptap/vue-3';

import { useEditorRevision } from '../composables/useEditorRevision';
import EditorIcon from './EditorIcon.vue';
import { COMMENT_LINK_NODE, parseEditorSpecialLink } from '../utils/editorSpecialLinks';
import { collectAnchorTargets } from '../utils/editorAnchorSlug';

const { t } = useI18n();

const isValidLink = (value: string) => {
  if (!value || /[\u0000-\u0020]/.test(value)) return false;
  try {
    const relative = /^(\/|\.\.?\/|#|\?)/.test(value);
    const url = relative ? new URL(value, window.location.origin) : new URL(value);
    if (['http:', 'https:', 'ftp:'].includes(url.protocol)) return !!url.hostname;
    return ['mailto:', 'tel:'].includes(url.protocol) && !!url.pathname;
  } catch {
    return false;
  }
};

const props = defineProps<{
  editor: Editor;
  enableAnchors?: boolean;
}>();

const revision = useEditorRevision(props.editor);
const isOpen = ref(false);
const href = ref('');
const errorMessage = ref('');
const mode = ref<'url' | 'anchor'>('url');
const anchorId = ref<string | null>(null);
const anchorTargets = computed(() => {
  void revision.value;
  return props.enableAnchors ? collectAnchorTargets(props.editor.state.doc) : [];
});

const isActive = computed(() => {
  void revision.value;
  return props.editor.isActive('link');
});
const canOpen = computed(() => {
  void revision.value;
  if (isActive.value) return true;
  const { from, to, empty } = props.editor.state.selection;
  return !empty &&
    !!props.editor.state.doc.textBetween(from, to).trim() &&
    props.editor.can().setLink({ href: 'https://example.com' });
});

const saveLink = () => {
  if (mode.value === 'anchor') {
    if (!anchorId.value) return;
    props.editor.chain().focus().extendMarkRange('link').setLink({ href: `#${anchorId.value}` }).run();
    isOpen.value = false;
    return;
  }
  const value = href.value.trim();

  if (!isValidLink(value)) {
    errorMessage.value = t('editor.enterAUrlRelativePathOrAnchorSection');
    return;
  }

  const specialLink = parseEditorSpecialLink(value);
  const chain = props.editor.chain().focus().extendMarkRange('link');
  const applied = specialLink
    ? chain.command(({ tr, commands }) => commands.insertContent({
      type: specialLink.nodeName,
      attrs: {
        ...specialLink.attributes,
        ...(specialLink.nodeName === COMMENT_LINK_NODE
          ? { title: tr.doc.textBetween(tr.selection.from, tr.selection.to).trim() }
          : {}),
      },
    })).run()
    : chain.setLink({ href: value }).run();
  if (!applied) {
    errorMessage.value = t('editor.couldNotApplyTheLinkToTheSelection');
    return;
  }
  isOpen.value = false;
};

const removeLink = () => {
  props.editor.chain().focus().extendMarkRange('link').unsetLink().run();
  isOpen.value = false;
};

watch(isOpen, (open) => {
  errorMessage.value = '';
  const currentHref = open && isActive.value ? props.editor.getAttributes('link').href || '' : '';
  mode.value = props.enableAnchors && /^#[a-z0-9][a-z0-9_-]{0,63}$/.test(currentHref) ? 'anchor' : 'url';
  anchorId.value = mode.value === 'anchor' ? currentHref.slice(1) : null;
  href.value = mode.value === 'url' ? currentHref : '';
});
</script>

<style scoped>
.editor-link-menu__button {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
}

.editor-link-menu__button--active {
  background-color: rgba(var(--v-theme-primary), 0.12);
}

.editor-link-menu__card {
  width: min(320px, calc(100vw - 24px));
  padding: 8px;
}

.editor-link-menu__actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  margin-bottom: 8px;
}
</style>
