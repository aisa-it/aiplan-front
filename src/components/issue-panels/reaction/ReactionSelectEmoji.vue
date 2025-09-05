<template>
  <transition name="fade-reaction">
    <div
      v-if="showReactionMenu || isTouchStart"
      class="reaction-menu"
      :class="classPositionMenu"
      @mouseenter="showEmojis"
      @mouseleave="hideEmojis"
    >
      <q-btn-group
        class="reaction-menu__list scrollable-content"
        :class="buttonGroupClasses"
        rounded
        @scroll.stop
      >
        <template
          v-for="(emoji, index) in reactionEmojisList"
          :key="emoji"
        >
          <q-btn
            v-show="index === 0 || isShowEmojis || isTouchStart"
            round
            dense
            class="reaction-menu__item"
            @click="handleClickReaction(emoji.label)"
          >
            <span>{{ emoji.label }}</span>
          </q-btn>
        </template>
      </q-btn-group>
    </div>
  </transition>

</template>

<script lang="ts">
// core
import { computed, defineComponent, ref, watch } from 'vue';

// utils
import { getEmojiFromHexCode } from 'src/utils/helpers';

// constants
import { REACTION_EMOJIS } from 'src/constants/emojis';

export default defineComponent({
  name: 'ReactionSelectEmoji',
  props: {
    isTouchStart: {
      Boolean,
      required: false,
      default: false,
    },
    isShowReactionMenu: {
      type: Boolean,
      required: true,
      default: false,
    },
    positionMenuLeft: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits:['update-reaction'],
  setup(props, { emit }) {
    const isShowEmojis = ref(false);

    const reactionEmojisList = REACTION_EMOJIS.map((code) => {
      return {
        label: getEmojiFromHexCode(code),
        value: code,
      };
    });

    const showReactionMenu = computed(() => {
      return props.isShowReactionMenu;
    });

    const classPositionMenu = computed(() => {
      return props.positionMenuLeft? 'reaction-menu_left' : 'reaction-menu_right';
    });

    const buttonGroupClasses = computed(() => {
      return [
        isShowEmojis.value || props.isTouchStart ? 'reaction-menu__list_active' : '',
        props.isTouchStart ? 'reaction-menu__list_touch' : '',
      ];
    });

    const showEmojis = () => {
      setTimeout(() => {
        isShowEmojis.value = true;
      }, 200);

    };

    const hideEmojis = () => {
      isShowEmojis.value = false;
    };

    const handleClickReaction = (value: string) => {
      emit('update-reaction', value);
    };

    watch(
      () => showReactionMenu.value,
      () => {
        hideEmojis();
      }
    );


    return {
      showEmojis,
      hideEmojis,
      isShowEmojis,
      showReactionMenu,
      classPositionMenu,
      buttonGroupClasses,
      reactionEmojisList,
      handleClickReaction,
    }
  }
});
</script>

<style lang="scss" scoped>
.reaction-menu {
  position: absolute;
  z-index: 10;
  bottom: -5px;

  &_left {
    left: -30px;
  }

  &_right {
    right: -30px;
  }

  &__list {
    padding: 4px 0;
    overflow-y: auto;
    overflow-x: hidden;
    height: 30px;
    width: 30px;
    display: flex;
    flex-direction: column-reverse;
    gap: 4px;
    z-index: 20;
    background-color: $base;
    transition: height 0.3s ease;
    scroll-behavior: smooth;

    &_active {
      height: 80px;
      transition: height 0.3s ease;
    }

    &_touch {
      height: 80px;
    }
  }

  &__item {
    min-height: 22px;
    max-height: 22px;
    max-width: 22px;
    min-width: 22px;
    padding: 4px;
    line-height: 1;
    border-radius: 50% !important;
    margin-left: auto;
    margin-right: auto;
  }
}

.fade-reaction-enter-active,
.fade-reaction-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-reaction-enter-from,
.fade-reaction-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.fade-reaction-enter-to,
.fade-reaction-leave-from {
  opacity: 1;
  transform: scale(1);
}

.reaction-item-enter-active,
.reaction-item-leave-active {
  transition: all 0.3s ease;
}

.reaction-item-enter,
.reaction-item-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.body--light {
  .reaction-menu {
    &__list {
      background-color: $base;
    }
  }
}

.body--dark {
  .reaction-menu {
    &__list {
      background-color: $dark;
    }
  }
}
</style>
