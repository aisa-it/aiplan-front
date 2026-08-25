<template>
  <!--
    В режиме чтения якорь ничего не рисует: это точка привязки, а не контент.
    Пустой inline-span не занимает места, не даёт лишнего пробела и не создаёт
    точку переноса строки, но у него есть позиция в потоке — по ней
    scrollToAnchor находит цель через data-anchor-id.
  -->
  <NodeViewWrapper
    as="span"
    class="doc-anchor"
    :class="{
      'doc-anchor--editable': !readonly,
      'doc-anchor--selected': selected,
    }"
    :data-anchor-id="node.attrs.anchorId"
    :data-anchor-title="node.attrs.title"
  >
    <span
      v-if="!readonly"
      class="doc-anchor__chip"
      contenteditable="false"
      :title="`Якорь #${node.attrs.anchorId}`"
      @click.stop
    >
      <q-icon name="bookmark" size="14px" class="doc-anchor__icon" />
      <span class="doc-anchor__label">{{ label }}</span>

      <q-menu
        ref="anchorMenu"
        anchor="bottom left"
        self="top left"
        :offset="[0, 4]"
        @before-show="syncDraftTitle"
      >
        <q-card class="doc-anchor__menu q-pa-sm" @click.stop>
          <q-form @submit.prevent="renameAnchor">
            <q-input
              v-model="draftTitle"
              class="full-w base-input"
              label="Название якоря"
              dense
              autofocus
              hide-bottom-space
              :rules="[(val) => !!val?.trim() || 'Введите название якоря']"
            />
            <div class="row justify-end q-mt-sm">
              <q-btn
                class="primary-btn"
                label="Переименовать"
                type="submit"
                flat
                dense
                no-caps
              />
            </div>
          </q-form>

          <q-separator class="q-my-sm" />

          <q-list dense>
            <q-item
              v-if="canCopyLink"
              v-close-popup
              clickable
              @click="copyLink"
            >
              <q-item-section avatar class="doc-anchor__menu-icon">
                <q-icon name="link" size="18px" />
              </q-item-section>
              <q-item-section>Скопировать ссылку</q-item-section>
            </q-item>

            <q-item v-close-popup clickable @click="removeAnchor">
              <q-item-section avatar class="doc-anchor__menu-icon">
                <q-icon name="delete" size="18px" />
              </q-item-section>
              <q-item-section>Удалить</q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </q-menu>
    </span>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { copyToClipboard, QMenu } from 'quasar';
import { useRoute } from 'vue-router';
import { useMenuHandler } from 'src/composables/useMenuHandler';
import { useNotificationStore } from 'src/stores/notification-store';
import { getDocumentAnchorLink } from 'src/utils/links';
import {
  SUCCESS_COPY_LINK_TO_CLIPBOARD,
  ERROR_COPY_LINK_TO_CLIPBOARD,
} from 'src/constants/notifications';

const props = defineProps(nodeViewProps);

const route = useRoute();
const { setNotificationView } = useNotificationStore();

const readonly = inject('isEditorReadOnly', ref(true));

const anchorMenu = ref<QMenu | null>(null);
const draftTitle = ref('');

// Без этого выпадашка отрывается от якоря при скролле страницы —
// грабля в проекте уже ловилась дважды.
useMenuHandler(anchorMenu);

const label = computed(
  () => props.node.attrs.title || props.node.attrs.anchorId || 'Якорь',
);

const workspaceSlug = computed(() => route.params.workspace as string);
const docId = computed(() => route.params.doc as string);

// Редактор живёт не только в АИДоке: вне документа ссылку строить не из чего.
const canCopyLink = computed(() =>
  Boolean(workspaceSlug.value && docId.value && props.node.attrs.anchorId),
);

const syncDraftTitle = () => {
  draftTitle.value = props.node.attrs.title || '';
};

/**
 * Переименование меняет ТОЛЬКО отображаемое название (data-anchor-title).
 * Слаг замораживается в момент создания якоря и не пересоздаётся — иначе
 * все ранее разосланные ссылки `#slug` протухли бы после правки названия.
 */
const renameAnchor = () => {
  const title = draftTitle.value.trim();
  if (!title) return;

  props.updateAttributes({ title });
  anchorMenu.value?.hide();
};

const copyLink = async () => {
  try {
    await copyToClipboard(
      getDocumentAnchorLink(
        workspaceSlug.value,
        docId.value,
        props.node.attrs.anchorId,
      ),
    );
    setNotificationView({
      type: 'success',
      open: true,
      customMessage: SUCCESS_COPY_LINK_TO_CLIPBOARD,
    });
  } catch (e) {
    setNotificationView({
      type: 'error',
      open: true,
      customMessage: ERROR_COPY_LINK_TO_CLIPBOARD,
    });
  }
};

const removeAnchor = () => {
  props.deleteNode();
};
</script>

<style lang="scss" scoped>
.doc-anchor {
  // Режим чтения: элемент пустой, поэтому строчный span не влияет ни на
  // ширину строки, ни на перенос — но остаётся findable по data-anchor-id.
  display: inline;
}

.doc-anchor__chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  max-width: 200px;
  padding: 0 6px 0 4px;
  border: 1px dashed var(--primary, $primary);
  border-radius: 10px;
  font-size: 11px;
  line-height: 16px;
  color: $primary;
  cursor: pointer;
  user-select: none;
  vertical-align: baseline;
}

.doc-anchor__chip:hover {
  background: rgba(102, 106, 255, 0.08);
}

.doc-anchor--selected .doc-anchor__chip {
  border-style: solid;
}

.doc-anchor__icon {
  flex: 0 0 auto;
}

.doc-anchor__label {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doc-anchor__menu {
  min-width: 260px;
}

.doc-anchor__menu-icon {
  min-width: 28px;
  padding-right: 0;
}
</style>
