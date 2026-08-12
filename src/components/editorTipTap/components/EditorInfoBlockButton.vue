<template>
  <v-menu :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        size="small"
        density="compact"
        @contextmenu.prevent
        :disabled="!canRunCommand"
        :class="isActive ? 'format-active' : 'no-hover'"
      >
        <HintTooltip>Информация</HintTooltip>
        <component :is="ICONS.infoIcon" />
      </v-btn>
    </template>

    <v-card :class="classPrevent">
      <div
        style="
          width: 150px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
        "
        class="py-4"
      >
        <v-btn
          v-for="(icon, index) in iconList"
          @click="() => runCommand(icon)"
          :key="index"
          icon
          variant="text"
          density="compact"
          style="width: 30px; height: 35px"
        >
          <component
            :is="(ICONS as any)[icon.name]"
            :color="icon.color"
            width="24"
            height="24"
          />
        </v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
import { useTheme } from 'vuetify';
import { ICONS } from '@/utils/icons';
import { colorMap } from '@/utils/editorColorMap';
import HintTooltip from './HintTooltip.vue';

const props = defineProps<{
  editorInstance: Editor;
  command: string;
  tooltip: string;
  iconName: string;
  formatName?: string;
  isMobile?: boolean;
  hasRunCommandListener?: boolean;
  classPrevent?: string;
}>();

const emits = defineEmits<{ runCommand: [string] }>();

const theme = useTheme();
const isDark = computed(() => theme.global.current.value.dark);

const isActive = computed(() => {
  return props.formatName
    ? props.editorInstance.isActive(props.formatName)
    : false;
});

const iconList = ref([
  {
    name: 'infoIcon',
    color: isDark.value ? colorMap['blue'].dark : colorMap['blue'].light,
  },
  {
    name: 'checkStatusIcon',
    color: isDark.value ? colorMap['green'].dark : colorMap['green'].light,
  },
  {
    name: 'closeIconBorder',
    color: isDark.value ? colorMap['red'].dark : colorMap['red'].light,
  },
  {
    name: 'alertIcon',
    color: isDark.value ? colorMap['orange'].dark : colorMap['orange'].light,
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
    emits('runCommand', props.command);
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
