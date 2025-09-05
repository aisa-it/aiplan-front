<template>
  <q-btn
    :class="isActive ? 'format-active' : 'no-hover'"
    :disable="!canRunCommand"
    dense
    flat
    @click="runCommand"
    @contextmenu.prevent
  >
    <HintTooltip>{{ tooltip }}</HintTooltip>
    <component :is="ICONS[iconName]" color="currentColor" />
  </q-btn>
</template>

<script setup lang="ts">
// core
import { Editor } from '@tiptap/vue-3';
import { computed, inject } from 'vue';
import { EventBus } from 'quasar';
// utils
import { ICONS } from 'src/utils/icons';

interface iEditorFormatButtonProps {
  editorInstance: Editor;
  command: string;
  tooltip: string;
  iconName: string;
  formatName?: string;
  isMobile?: boolean;
  focusAfterRun?: boolean;
  hasRunCommandListener?: boolean;
}

const props = withDefaults(defineProps<iEditorFormatButtonProps>(), {
  formatName: '',
  isMobile: false,
  focusAfterRun: false,
  hasRunCommandListener: false,
});

const emit = defineEmits<{
  runCommand: [command: string];
}>();

const bus = inject('bus') as EventBus;

const isActive = computed<boolean>(() => {
  return props.formatName
    ? props.editorInstance.isActive(props.formatName)
    : false;
});

const canRunCommand = computed<boolean>(() => {
  return props.editorInstance.can().chain().focus()[props.command]().run();
});

const runCommand = (): void => {
  const editor = props.editorInstance;
  const chain = editor.chain();

  if (props.hasRunCommandListener) {
    emit('runCommand', props.command);
  } else {
    const commandChain = !props.isMobile ? chain.focus() : chain;

    if (!editor.isActive('listItem'))
      return commandChain[props.command]().run();

    if (props.command === 'indent') {
      commandChain.sinkListItem('listItem').run();
    } else if (props.command === 'outdent') {
      commandChain.liftListItem('listItem').run();
    } else {
      commandChain[props.command]().run();
    }
  }

  if (props.focusAfterRun) chain.focus();

  bus.emit('clearEditor');
};
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
