<template>
  <q-btn-dropdown
    v-model="isOpenSelect"
    ref="emojiMenu"
    dense
    flat
    :disable="isDisabled"
    class="emoji"
    :content-class="`emoji-wrapper ${classPrevent}`"
  >
    <template #label>
      <q-btn class="emoji-btn" flat dense @click.stop="handleClickEmoji">
        <span>{{ emojiValue }}</span>
        <HintTooltip>Добавить реакцию</HintTooltip>
      </q-btn>

      <q-btn @click.stop="isOpenSelect = !isOpenSelect" flat dense>
        <ArrowDown
          :width="18"
          :height="18"
          class="chevron-rotate"
          :class="{ 'rotate-180': isOpenSelect }"
        />
      </q-btn>
    </template>

    <ul class="emoji-list">
      <li v-for="emoji in listEmoji" :key="emoji">
        <q-btn @click="updateEmoji(emoji)">{{ emoji }}</q-btn>
      </li>
    </ul>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { shallowRef, computed, ref } from 'vue';
import { Editor } from '@tiptap/vue-3';
// utils
import { emojiList } from 'src/components/editorV2/utils/tiptap';

import ArrowDown from 'components/icons/ArrowDown.vue';
import { QBtnDropdown } from 'quasar';
import { useMenuHandler } from 'src/composables/useMenuHandler';

const props = defineProps<{
  editorInstance: Editor;
  classPrevent?: string;
  isMobile?: boolean;
}>();

// var
const listEmoji = shallowRef(emojiList);
const emojiValue = shallowRef(emojiList[0]);
const isOpenSelect = shallowRef(false);
const emojiMenu = ref<QBtnDropdown>();
// computed
const isDisabled = computed(() => {
  return props.editorInstance.isActive('codeBlock');
});

// function
const updateEmoji = (value: string) => {
  emojiValue.value = value;
  isOpenSelect.value = false;
  if (props.isMobile) {
    props.editorInstance.chain().insertContent(value).run();
  } else {
    props.editorInstance.chain().focus().insertContent(value).run();
  }
};

const handleClickEmoji = (e: Event) => {
  e.preventDefault();
  if (props.isMobile) {
    props.editorInstance.chain().insertContent(emojiValue.value).run();
  } else {
    props.editorInstance.chain().focus().insertContent(emojiValue.value).run();
  }
};

useMenuHandler(emojiMenu);
</script>
<style lang="scss">
.body--light .q-menu.emoji-wrapper {
  border-radius: 4px !important;
}
</style>

<style lang="scss" scoped>
.emoji {
  display: flex;
  border: 1px solid $dark-border-color;
  max-width: fit-content !important;

  :deep(.q-focus-helper) {
    display: none;
    background: none;
  }

  .q-btn {
    max-width: fit-content !important;
    border-radius: 0;
    line-height: 1;

    &:hover > {
      :deep(.q-focus-helper) {
        display: block;
        background: currentColor;
      }
    }
  }

  .emoji-btn {
    padding: 0 2px;
    border-bottom-right-radius: 0;
    border-top-right-radius: 0;
    border-right: 1px solid $dark-border-color;
    max-width: 22px !important;
    min-width: 22px !important;
    width: 100%;
  }
}

.emoji-list {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(7, auto);
  margin: 8px;
  padding: 0;
  list-style-type: none;

  .q-btn {
    min-height: fit-content;
    padding: 4px;
    height: 22px;
    width: 22px;
    line-height: 1;
  }
}
</style>
