<template>
  <q-btn-dropdown
    :class="isActive ? 'format-active' : 'no-hover'"
    :content-class="classPrevent"
    :disable="!canRunCommand"
    dense
    flat
    @contextmenu.prevent
    @hide="clearStyleSpoiler"
  >
    <!-- @before-hide="" -->
    <template #label>
      <HintTooltip>Спойлер</HintTooltip>
      <span>
        <component :is="ICONS.spoilerIcon" />
      </span>
    </template>
    <ColorPicker
      :is-bg-color="false"
      :is-spoiler="true"
      :style-colors="styleSpoiler"
      @select="(value) => runCommand(value)"
    />
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed, ref, inject, onMounted, onBeforeUnmount } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { ICONS } from 'src/utils/icons';
import ColorPicker from './ColorPicker.vue';
import { EventBus } from 'quasar';

const props = defineProps({
  editorInstance: {
    type: Object as () => Editor,
    required: true,
  },
  command: {
    type: String,
    required: true,
  },
  tooltip: {
    type: String,
    required: true,
  },
  iconName: {
    type: String,
    required: true,
  },
  formatName: {
    type: String,
    default: '',
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  hasRunCommandListener: {
    type: Boolean,
    default: false,
  },
  classPrevent: {
    type: String,
    required: false,
  },

  isSpoilerButtonClicked: {
    type: Boolean,
    required: true,
  },
});

interface IStyleSpoiler {
  bgColor: string;
  textColor: string;
}

const emit = defineEmits<{
  resetClickState: [value: boolean];
}>();

const bus = inject('bus') as EventBus;
const styleSpoiler = ref<IStyleSpoiler>({
  bgColor: '',
  textColor: '',
});

const expectedSpoilerPos = ref<number | null>(null);
const wasPosInTitle = ref<boolean>(false);

const isActive = computed<boolean>(() => {
  return props.formatName
    ? props.editorInstance.isActive(props.formatName)
    : false;
});

const canRunCommand = computed(() => {
  const chain = props.editorInstance.can().chain().focus() as any;
  return chain[props.command]?.().run();
});

function setFocusedSpoilerPos(
  pos: number,
  styleColors: IStyleSpoiler,
  isFocusedSpoilerTitle: boolean,
  isEditingAllowed: boolean,
): void {
  if (!isFocusedSpoilerTitle) {
    // Если перешли от одного заголовка в другой
    if (
      expectedSpoilerPos.value !== null &&
      expectedSpoilerPos.value !== pos &&
      isEditingAllowed
    ) {
      console.log(
        `Переход между заголовками. expect ${expectedSpoilerPos.value}, was ${wasPosInTitle.value}`,
      );
    } else if (props.isSpoilerButtonClicked && wasPosInTitle.value) {
      // Если клик по кнопке и мы были в заголовке, то редактируем
      expectedSpoilerPos.value = pos;
      console.log(
        `В кнопке. expect ${expectedSpoilerPos.value}, was ${wasPosInTitle.value} `,
      );
    } else if (!isEditingAllowed) {
      // Если клик был в теле спойлера, то отключаем редактирование
      expectedSpoilerPos.value = null;
      wasPosInTitle.value = false;
      console.log(
        `В теле спойлера ${pos}. expect ${expectedSpoilerPos.value}, was ${wasPosInTitle.value} `,
      );
    } else {
      // Клик вне спойлера и во время удаления
      expectedSpoilerPos.value = null;
      wasPosInTitle.value = false;
      console.log(
        `Вне спойлера. expect ${expectedSpoilerPos.value}, was ${wasPosInTitle.value} `,
      );
    }
    // Действие провели, сбрасываем состояние кнопки
    emit('resetClickState', false);
  } else {
    // Мы в заголовке, включаем режим редактирования
    expectedSpoilerPos.value = pos;
    wasPosInTitle.value = true;
    // Включаем состояние кнопки
    emit('resetClickState', true);
    styleSpoiler.value = styleColors;
    console.log(
      `В заголовке. expect ${expectedSpoilerPos.value}, was ${wasPosInTitle.value} `,
    );
  }
}

const clearStyleSpoiler = (): void => {
  styleSpoiler.value = { bgColor: '', textColor: '' };
};

const runCommand = (value: IStyleSpoiler) => {
  const editor = props.editorInstance;
  const { state } = editor;

  if (expectedSpoilerPos.value !== null) {
    // Редактируем спойлер по полученной позиции
    const pos = expectedSpoilerPos.value;
    const node = state.doc.nodeAt(pos);

    console.log('Редактируем');
    if (node && node.type.name === 'spoiler') {
      editor.commands.command(({ tr, dispatch }) => {
        tr.setNodeMarkup(pos, undefined, {
          ...node.attrs,
          style: `background-color: ${value.bgColor}; color: ${value.textColor};`,
        });
        if (dispatch) dispatch(tr);
        return true;
      });
    }
    // Сброс редактирования и позиции спойлера
    expectedSpoilerPos.value = null;
    wasPosInTitle.value = false;
    console.log(
        `Очистка после редактирования. expect ${expectedSpoilerPos.value}, was ${wasPosInTitle.value} `,
      );
  } else {
    // Создаем новый спойлер в точке курсора
    console.log('Создаем');
    const chain = editor.chain() as any;
    const commandOptions = {
      style: `background-color: ${value.bgColor}; color: ${value.textColor};`,
    };

    if (!props.isMobile) {
      chain.focus()[props.command](commandOptions).run();
    } else {
      chain[props.command](commandOptions).run();
    }
  }
};

onMounted(() => {
  if (bus) {
    bus.on('focusSpoiler', setFocusedSpoilerPos);
  }
});
onBeforeUnmount(() => {
  if (bus) {
    bus.off('focusSpoiler', setFocusedSpoilerPos);
  }
});
</script>

<style lang="scss" scoped>
@media screen and (max-width: 760px) {
  .no-hover:hover,
  .no-hover:focus,
  .no-hover:active {
    background-color: transparent !important;
    box-shadow: none !important;
    color: inherit !important;
  }
}
</style>
