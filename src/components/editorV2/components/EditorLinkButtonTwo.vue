<template>
  <q-btn
    dense
    flat
    @click="toggleLinkTooltip"
    :class="{ 'format-active': isActive }"
  >
    <HintTooltip>Ссылка</HintTooltip>
    <component :is="ICONS.linkIcon" color="currentColor" />
  </q-btn>

  <q-popup-proxy
    v-if="showPicker"
    v-model="showPicker"
    transition-show="scale"
    transition-hide="scale"
    :offset="[40, 0]"
    anchor="bottom left"
    self="top left"
    :target="popupTarget"
    style="box-shadow: none; background: transparent !important"
  >
    <q-card
      @click="showPicker = false"
      class="q-pa-sm card-input"
      style="box-shadow: none"
    >
      <q-form @submit="pasteUrl">
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
          />
        </div>

        <!-- Переключатель: внешняя ссылка или якорь внутри документа -->
        <div @click.stop class="q-mb-xs q-px-xs q-py-xs input-link">
          <q-btn-toggle
            v-model="mode"
            :options="modeOptions"
            class="full-w"
            dense
            flat
            no-caps
            spread
            toggle-color="primary"
          />
        </div>

        <div
          v-if="mode === 'url'"
          @click.stop
          class="q-pb-sm q-px-sm input-link"
        >
          <q-input
            v-model="linkUrl"
            dense
            class="full-w base-input"
            label="Введите ссылку"
            :rules="[
              (val) =>
                isValidURL(val) || 'Введите URL в формате schema://example.com',
            ]"
          />
        </div>

        <div
          v-else-if="anchorTargets.length"
          @click.stop
          class="q-pb-sm q-px-sm input-link"
        >
          <q-select
            ref="anchorSelect"
            v-model="anchorId"
            :options="anchorTargets"
            :display-value="anchorDisplay"
            option-value="id"
            option-label="label"
            emit-value
            map-options
            dense
            hide-bottom-space
            class="full-w base-input"
            label="Выберите якорь"
          >
            <template v-slot:option="scope">
              <q-item
                v-bind="scope.itemProps"
                :style="{ paddingLeft: `${optionIndent(scope.opt)}px` }"
              >
                <q-item-section avatar class="anchor-option-icon">
                  <q-icon
                    :name="scope.opt.type === 'heading' ? 'title' : 'tag'"
                    size="16px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption lines="1">
                    {{ optionCaption(scope.opt) }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>

        <div
          v-else
          @click.stop
          class="q-pa-sm input-link text-caption text-grey"
        >
          В документе нет якорей — сначала добавьте якорь или заголовок.
        </div>
      </q-form>
    </q-card>
  </q-popup-proxy>
</template>

<script setup lang="ts">
import { Editor } from '@tiptap/vue-3';
import { computed, ref, watch, nextTick } from 'vue';
import { ICONS } from 'src/utils/icons';
import { isValidURL } from 'src/utils/validation';
import {
  isAnchorHref,
  parseCommentLink,
  parseDocAnchorLink,
} from 'src/utils/links';
import { collectAnchorTargets, type AnchorTarget } from 'src/utils/anchorSlug';
import { useMenuHandler } from 'src/composables/useMenuHandler';

const props = defineProps<{
  editorInstance: Editor;
}>();

// Режим попапа: обычная ссылка или якорь внутри документа
type LinkMode = 'url' | 'anchor';

const modeOptions = [
  { label: 'Ссылка', value: 'url' },
  { label: 'Якорь в документе', value: 'anchor' },
];

const showPicker = ref(false);
const linkUrl = ref('');
const mode = ref<LinkMode>('url');
const anchorId = ref<string | null>(null);
const anchorTargets = ref<AnchorTarget[]>([]);
const anchorSelect = ref();
const popupTarget = ref<HTMLElement | null>(null);
let virtualAnchor: HTMLElement | null = null;

// закрываем выпадашку якорей при скролле: иначе она отрывается от поля
useMenuHandler(anchorSelect);

const isActive = computed(() => {
  return props.editorInstance.isActive('link');
});

// Название выбранного якоря берём по ПОЛНОМУ списку целей: ссылка могла
// остаться от удалённого якоря, и тогда честнее сказать об этом, чем
// показывать голый идентификатор.
const anchorDisplay = computed(() => {
  if (!anchorId.value) return undefined;

  const target = anchorTargets.value.find((item) => item.id === anchorId.value);
  return target ? target.label : `${anchorId.value} (якорь не найден)`;
});

// Заголовки в списке отбиваем вправо по уровню, явные якоря — по левому краю
const optionIndent = (target: AnchorTarget) =>
  target.type === 'heading' ? 8 + ((target.level ?? 1) - 1) * 12 : 8;

const optionCaption = (target: AnchorTarget) =>
  target.type === 'heading'
    ? `Заголовок H${target.level ?? 1} · #${target.id}`
    : `Якорь · #${target.id}`;

const toggleLinkTooltip = (e: MouseEvent) => {
  e.stopPropagation();

  if (virtualAnchor) {
    virtualAnchor.remove();
    virtualAnchor = null;
  }

  const { from, empty } = props.editorInstance.state.selection;

  if (empty && !props.editorInstance.isActive('link')) {
    return;
  }

  // Список целей собираем на открытии: документ мог измениться с прошлого раза
  anchorTargets.value = collectAnchorTargets(props.editorInstance.state.doc);

  const coords = props.editorInstance.view.coordsAtPos(from);

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
  showPicker.value = true;

  nextTick(() => {
    const href = props.editorInstance.isActive('link')
      ? props.editorInstance.getAttributes('link').href || ''
      : '';

    // Курсор стоит на ссылке-якоре — сразу открываем нужный режим
    if (isAnchorHref(href)) {
      mode.value = 'anchor';
      anchorId.value = parseDocAnchorLink(href)?.anchorId ?? null;
      linkUrl.value = '';
      return;
    }

    mode.value = 'url';
    linkUrl.value = href;
    anchorId.value = null;
  });
};

const pasteUrl = () => {
  // Режим якоря: правило isValidURL здесь не применяется вовсе — `#введение`
  // это не URL со схемой, а ссылка внутри текущего документа
  if (mode.value === 'anchor') {
    if (!anchorId.value) return;

    props.editorInstance
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: `#${anchorId.value}` })
      .run();

    showPicker.value = false;
    return;
  }

  const { from, to } = props.editorInstance.state.selection;
  const selectedText = props.editorInstance.state.doc.textBetween(from, to);
  const parsed = parseCommentLink(linkUrl.value, selectedText);
  if (parsed) {
    const node =
      props.editorInstance.state.schema.nodes.commentLinkMention?.create(
        parsed,
      );
    const tr = props.editorInstance.state.tr.replaceSelectionWith(node);
    props.editorInstance.view.dispatch(tr);
  } else {
    props.editorInstance
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: linkUrl.value })
      .run();
  }

  showPicker.value = false;
};

watch(showPicker, (val) => {
  if (!val && virtualAnchor) {
    virtualAnchor.remove();
    virtualAnchor = null;
    popupTarget.value = null;
    linkUrl.value = '';
    mode.value = 'url';
    anchorId.value = null;
    anchorTargets.value = [];
  }
});
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

// иконка типа цели не должна съедать ширину у названия
.anchor-option-icon {
  min-width: 24px;
  padding-right: 8px;
}
</style>
