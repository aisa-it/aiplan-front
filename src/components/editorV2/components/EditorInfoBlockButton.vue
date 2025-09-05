<template>
  <q-btn-dropdown
    dense
    flat
    @contextmenu.prevent
    :disable="!canRunCommand"
    :class="isActive ? 'format-active' : 'no-hover'"
    :content-class="classPrevent"
  >
    <template #label>
      <HintTooltip>Информация</HintTooltip>
      <component :is="ICONS.infoIcon" />
    </template>
    <div
      style="
        width: 150px;
        height: 45px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
      "
      class="q-py-md"
    >
      <q-btn
        v-for="(icon, index) in iconList"
        @click="() => runCommand(icon)"
        :key="index"
        style="width: 30px; height: 35px"
        dense
        flat
      >
        <component
          :is="(ICONS as any)[icon.name]"
          :color="icon.color"
          width="24"
          height="24"
        />
      </q-btn>
    </div>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { ICONS } from 'src/utils/icons';
import { colorMap } from 'src/utils/editorColorMap';
import { useQuasar } from 'quasar';

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
});

const emit = defineEmits(['runCommand']);
const $q = useQuasar();

const isActive = computed(() => {
  return props.formatName
    ? props.editorInstance.isActive(props.formatName)
    : false;
});

const iconList = ref([
  {
    name: 'infoIcon',
    color: $q.dark ? colorMap['blue'].dark : colorMap['blue'].light,
  },
  {
    name: 'checkStatusIcon',
    color: $q.dark ? colorMap['green'].dark : colorMap['green'].light,
  },
  {
    name: 'closeIconBorder',
    color: $q.dark ? colorMap['red'].dark : colorMap['red'].light,
  },
  {
    name: 'alertIcon',
    color: $q.dark ? colorMap['orange'].dark : colorMap['orange'].light,
  },
]);

const canRunCommand = computed(() => {
  const chain = props.editorInstance.can().chain().focus() as any;
  return chain[props.command]?.().run();
});

const runCommand = (icon: { name: string; color: string }) => {
  const editor = props.editorInstance;
  const { state } = editor;
  const { $from } = state.selection;
  let foundInfoBlock = false;
  // Поиск ближайшей родительской ноды info-block
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    if (node.type.name === 'info-block') {
      const pos = $from.before(d);
      const isAtStart = $from.pos === pos + 2;
      if (isAtStart) {
        // Если курсор в info-block — обновляем только иконку и цвет
        editor.commands.command(({ tr, dispatch }) => {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            icon: icon.name,
            iconColor: icon.color,
          });
          if (dispatch) dispatch(tr);
          return true;
        });
        foundInfoBlock = true;
        break;
      }
    }
  }
  if (foundInfoBlock) {
    return;
  }
  // Если не найден info-block — вставляем новый
  const chain = editor.chain() as any;
  if (props.hasRunCommandListener) {
    emit('runCommand', props.command);
  } else {
    if (props.isMobile) {
      chain[props.command]({ icon: icon.name, iconColor: icon.color }).run();
    } else {
      chain
        .focus()
        [props.command]({ icon: icon.name, iconColor: icon.color })
        .run();
    }
  }
};
</script>

<style lang="scss" scoped>
@media screen and (max-width: 760px) {
  .no-hover:hover,
  .no-hover:focus,
  .no-hover:active {
    background-color: transparent !important;
    box-shadow: none !important;
    color: #bdb001 !important;
  }
}
</style>
