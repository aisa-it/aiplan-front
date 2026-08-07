<template>
  <div class="emoji" :class="classPrevent">
    <v-btn
      class="emoji-btn"
      variant="text"
      density="compact"
      :disabled="isDisabled"
      @click.stop="handleClickEmoji"
    >
      <span>{{ emojiValue }}</span>
      <HintTooltip>Добавить реакцию</HintTooltip>
    </v-btn>

    <v-menu
      v-model="isOpenSelect"
      location="bottom end"
      :close-on-content-click="true"
      :offset="4"
      content-class="emoji-wrapper"
    >
      <template #activator="{ props: menuProps }">
        <v-btn
          v-bind="menuProps"
          class="emoji-chevron"
          variant="text"
          density="compact"
          :disabled="isDisabled"
        >
          <ArrowDown
            :width="16"
            :height="16"
            color="currentColor"
            class="chevron-rotate"
            :class="{ 'rotate-180': isOpenSelect }"
          />
        </v-btn>
      </template>

      <ul class="emoji-list" :class="classPrevent">
        <li v-for="emoji in listEmoji" :key="emoji">
          <v-btn
            class="emoji-item"
            variant="text"
            density="compact"
            @click="updateEmoji(emoji)"
          >
            {{ emoji }}
          </v-btn>
        </li>
      </ul>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { shallowRef, computed } from 'vue';
import { Editor } from '@tiptap/vue-3';
import HintTooltip from './HintTooltip.vue';
import ArrowDown from '@/components/icons/ArrowDown.vue';
import { emojiList } from '../utils/tiptap';

const props = defineProps<{
  editorInstance: Editor;
  classPrevent?: string;
  isMobile?: boolean;
}>();

const listEmoji = shallowRef(emojiList);
const emojiValue = shallowRef(emojiList[0]);
const isOpenSelect = shallowRef(false);

const isDisabled = computed(() => {
  return props.editorInstance.isActive('codeBlock');
});

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
</script>

<style lang="scss">
.emoji-wrapper {
  border-radius: 4px !important;
  overflow: visible !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12) !important;
}
</style>

<style lang="scss" scoped>
.emoji {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid $dark-border-color;
  border-radius: 4px;
  max-width: fit-content;
  height: 24px;
  box-sizing: border-box;
  overflow: hidden;

  :deep(.v-btn__overlay) {
    display: none;
  }

  .v-btn {
    max-width: fit-content !important;
    border-radius: 0 !important;
    line-height: 1;
    min-width: 0 !important;
    height: 100% !important;
    min-height: 0 !important;
    padding: 0 !important;
    color: $text-color;

    &:hover :deep(.v-btn__overlay) {
      display: block;
      opacity: 0.08;
    }
  }

  .emoji-btn {
    padding: 0 2px !important;
    border-right: 1px solid $dark-border-color;
    max-width: 22px !important;
    min-width: 22px !important;
    width: 22px !important;
  }

  .emoji-chevron {
    max-width: 22px !important;
    min-width: 22px !important;
    width: 22px !important;
    color: $text-color;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
  }
}

.chevron-rotate {
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.emoji-list {
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(7, auto);
  margin: 0;
  padding: 8px;
  list-style: none;
  background: #fff;
}

.emoji-item {
  min-width: 28px !important;
  min-height: 28px !important;
  width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  border: 1px solid $dark-border-color !important;
  border-radius: 4px !important;
  background: #fff !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
  font-size: 16px;
  line-height: 1;
}
</style>
