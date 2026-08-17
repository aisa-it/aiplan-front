<template>
  <v-menu
    v-if="showTooltip"
    v-model="isOpen"
    :target="anchor"
    location-strategy="connected"
    location="bottom start"
    :close-on-content-click="false"
    :class="classPrevent"
    content-class="mention-menu"
    @mouseenter="cancelDelayedClose"
    @mouseleave="closeMenu"
  >
    <div class="mention-menu-wrapper">
      <div class="mention-popup">
        <v-avatar :size="28" class="avatar square none-avatar">
          <!-- TODO: getUrlFile is not migrated yet — showing initials instead of the avatar image. -->
          <div class="mention-avatar-text none-avatar">
            {{ content.avatarText }}
          </div>
        </v-avatar>
        <div class="full-w">
          <div v-if="content.title">
            <span class="body-medium word-wrap full-w font-weight-bold">
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
  </v-menu>
</template>

<script setup lang="ts">
// core
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

// utils
// TODO: getUrlFile is not migrated yet — the mention tooltip shows initials instead of the avatar image.
// import { getUrlFile } from 'src/utils/helpers';
import type { ContentMention } from '../utils/tiptap';

const props = defineProps<{
  showTooltip: boolean;
  anchor?: HTMLElement;
  content: ContentMention;
  classPrevent: string;
}>();

const emits = defineEmits<{
  showTooltip: [];
}>();

//vars
const isOpen = ref(false);
const closeTimer = ref();

// function
const closeMenu = () => {
  if (!props.content) return;
  isOpen.value = false;
  emits('showTooltip');
};

const cancelDelayedClose = () => {
  clearTimeout(closeTimer.value);
};

const hideTooltipOnScroll = () => {
  if (isOpen.value && props.showTooltip) {
    isOpen.value = false;
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
        isOpen.value = true;
      });
    } else {
      isOpen.value = false;
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

.none-avatar {
  background-color: #ccdbff;
  color: rgb(var(--v-theme-primary));
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
