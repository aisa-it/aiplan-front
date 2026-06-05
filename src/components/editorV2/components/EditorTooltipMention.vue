<template>
  <q-menu
    v-if="showTooltip"
    ref="mentionRef"
    fit
    transition-show="scale"
    :class="classPrevent"
    class="mention-menu"
    no-focus
    no-refocus
    @mouseenter="cancelDelayedClose"
    @mouseleave="closeMenu"
    :target="anchor"
    :offset="[0, 0]"
  >
    <div class="mention-menu-wrapper">
      <div class="mention-popup">
        <q-avatar
          :size="'28px'"
          square
          :class="{
            avatar: true,
            'none-avatar': !content.avatar,
            square: true,
          }"
        >
          <q-img
            v-if="content.avatar"
            :src="getUrlFile(content.avatar)"
            spinner-size="28px"
            class="mention-avatar"
            :class="{ 'none-avatar': !content.avatar }"
          >
            <template v-slot:error>
              <div class="mention-avatar-text none-avatar">
                {{ content.avatarText }}
              </div>
            </template>
          </q-img>
          <div v-else class="mention-avatar-text none-avatar">
            {{ content.avatarText }}
          </div>
        </q-avatar>
        <div class="full-w">
          <div v-if="content.title">
            <span class="body-medium word-wrap full-w text-weight-bold">
              {{ content.title }}
            </span>
          </div>
          <div v-if="content.email">
            <span class="body-medium word-wrap full-w">
              {{ content.email }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </q-menu>
</template>

<script setup lang="ts">
// core
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// utils
import { getUrlFile } from 'src/utils/helpers';
import { ContentMention } from 'src/components/editorV2/utils/tiptap';

const props = defineProps<{
  showTooltip: boolean;
  anchor: HTMLElement;
  content: ContentMention;
  classPrevent: string;
}>();

const emits = defineEmits<{
  showTooltip: [];
}>();

//vars
const mentionRef = ref();
const closeTimer = ref();

// function
const closeMenu = () => {
  if (!props.content) return;
  mentionRef.value.hide();
  emits('showTooltip');
};

const delayedCloseMenu = () => {
  if (!props.content) return;
  closeTimer.value = setTimeout(() => {
    closeMenu();
  }, 200);
};

const cancelDelayedClose = () => {
  clearTimeout(closeTimer.value);
};

const hideTooltipOnScroll = () => {
  if (mentionRef.value && props.showTooltip) {
    mentionRef.value.hide();
    emits('showTooltip');
  }
};

onMounted(() => {
  const scrollContainer = document.querySelector('.comments-list');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', hideTooltipOnScroll);
  }
});

onBeforeUnmount(() => {
  const scrollContainer = document.querySelector('.comments-list');
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', hideTooltipOnScroll);
  }
});

watch(
  () => props.showTooltip,
  (newValue) => {
    if (newValue) {
      nextTick(() => {
        if (mentionRef.value) {
          mentionRef.value.show();
        }
      });
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.mention-menu-wrapper {
  max-height: 140px;
  overflow-y: auto;
  overflow-x: hidden;
  max-width: 340px;
  width: fit-content;
}

.mention-popup {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 8px;
  align-items: center;
  padding: 6px;
  width: fit-content;
  max-width: 90%;
}

.mention-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background-color: $base;
}

.none-avatar {
  background-color: #ccdbff;
  color: $primary;
}

.mention-avatar-text {
  display: flex;
  padding: 0;
  font-size: 0.75rem;
  line-height: 0.75rem;
  text-align: center;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.square {
  border-radius: 4px;
}
</style>
