<template>
  <q-btn dense flat @click="openAnchorPopup">
    <HintTooltip>Якорь</HintTooltip>
    <!-- Подходящей иконки в ICONS нет, берём материальную из @quasar/extras -->
    <q-icon name="bookmark" size="20px" />
  </q-btn>

  <q-popup-proxy
    ref="popup"
    transition-show="scale"
    transition-hide="scale"
    :offset="[40, 0]"
    no-parent-event
    anchor="bottom left"
    self="top left"
    :target="popupTarget ?? true"
    style="box-shadow: none; background: transparent !important"
    @hide="onHide"
  >
    <q-card class="q-pa-sm card-input" style="box-shadow: none">
      <q-form @submit="insertAnchor">
        <div class="flex justify-end q-mb-xs">
          <q-btn
            @click.stop
            class="button-link button-link-save"
            icon="save"
            flat
            dense
            no-caps
            type="submit"
          />
          <q-btn
            class="button-link button-link-delete q-ml-xs"
            icon="close"
            flat
            dense
            no-caps
            @click="popup?.hide()"
          />
        </div>
        <div @click.stop class="q-pb-sm q-px-sm input-link">
          <q-input
            v-model="anchorTitle"
            dense
            class="full-w base-input"
            label="Название якоря"
            :rules="[(val) => !!val?.trim() || 'Введите название якоря']"
          />
        </div>
      </q-form>
    </q-card>
  </q-popup-proxy>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { QPopupProxy } from 'quasar';
import HintTooltip from 'src/components/HintTooltip.vue';
import { useMenuHandler } from 'src/composables/useMenuHandler';
import { collectAnchorIds, makeUniqueSlug } from 'src/utils/anchorSlug';

const props = defineProps<{
  editorInstance: Editor;
}>();

const popup = ref<QPopupProxy | null>(null);
const popupTarget = ref<HTMLElement | null>(null);
const anchorTitle = ref('');

let virtualAnchor: HTMLElement | null = null;

// Закрываем попап при скролле: иначе он отрывается от точки вставки.
useMenuHandler(popup);

const removeVirtualAnchor = () => {
  if (!virtualAnchor) return;

  virtualAnchor.remove();
  virtualAnchor = null;
};

/**
 * Попап показываем не у кнопки тулбара, а у курсора — там, где появится
 * якорь. Приём тот же, что у кнопки ссылки: невидимый элемент-«якорь»
 * в body по координатам позиции курсора.
 */
const openAnchorPopup = async (e: MouseEvent) => {
  e.stopPropagation();

  removeVirtualAnchor();
  anchorTitle.value = '';
  popupTarget.value = null;

  try {
    const { view, state } = props.editorInstance;
    const coords = view.coordsAtPos(state.selection.from);

    const virtualEl = document.createElement('div');
    virtualEl.style.position = 'absolute';
    virtualEl.style.left = `${coords.left + window.scrollX}px`;
    virtualEl.style.top = `${coords.bottom + window.scrollY}px`;
    virtualEl.style.width = '1px';
    virtualEl.style.height = '1px';
    virtualEl.style.pointerEvents = 'none';
    virtualEl.style.zIndex = '9999';

    document.body.appendChild(virtualEl);
    virtualAnchor = virtualEl;
    popupTarget.value = virtualEl;
  } catch (err) {
    // Позицию курсора не удалось вычислить (редактор ещё не отрисован) —
    // не беда, попап откроется у самой кнопки.
    popupTarget.value = null;
  }

  // Ждём, пока :target доедет до попапа, иначе он спозиционируется по старому.
  await nextTick();
  popup.value?.show();
};

const insertAnchor = () => {
  const title = anchorTitle.value.trim();
  if (!title) return;

  const editor = props.editorInstance;

  // Слаг считаем один раз, в момент вставки, и дальше он заморожен:
  // переименование якоря его не меняет, чтобы не ломать ссылки.
  const anchorId = makeUniqueSlug(title, collectAnchorIds(editor.state.doc));

  editor.chain().focus().setDocAnchor({ anchorId, title }).run();

  popup.value?.hide();
};

const onHide = () => {
  removeVirtualAnchor();
  popupTarget.value = null;
  anchorTitle.value = '';
};
</script>

<style lang="scss" scoped>
.button-link {
  height: 24px !important;
  width: 28px !important;
  border-radius: 50%;
}

.button-link-save {
  background-color: $primary;
  color: white;
}

.button-link-delete {
  background-color: rgb(163, 75, 75);
  color: white;
}

.card-input {
  min-width: 300px;
  height: auto;
  background: transparent !important;
}

.input-link {
  display: flex;
  align-items: center;
  border: 1px solid gray;
  border-radius: 8px;
  background: var(--bg-color) !important;
}
</style>
