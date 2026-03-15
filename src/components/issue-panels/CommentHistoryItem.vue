<template>
  <q-chat-message
    :id="'comment_' + comment.comment_id"
    :sent="isAuthor"
    class="chat-message"
  >
    <template v-slot:avatar>
      <AvatarImage
        :style="'margin-right: 10px; margin-left: 10px;'"
        border
        rounded
        class="chat-message__avatar"
        :class="{ 'chat-message__avatar-author': isAuthor }"
        :tooltip="handleTooltip(comment.actor_update)"
        :text="handleTooltipText(comment.actor_update)"
        :image="comment.actor_update.avatar_id"
        :member="comment.actor_update"
        @click="navigateToActivityPage(comment.actor_update.id)"
      />
    </template>

    <template v-slot:default>
      <div class="chat-message-wrapper">
        <EditorTipTapV2
          :editor-id="'message-editor-' + comment.comment_id"
          :model-value="comment.comment_html"
          :can-edit="false"
          read-only-editor
          :members="members"
          is-mention
        />
      </div>
    </template>

    <template v-slot:stamp>
      <p class="stamp-text"
        >{{ formatDateTimeWithDay(comment.created_at) }}
        <span v-if="edited">изменено</span>
        <HintTooltip>{{
          formatDateTimeWithDay(comment.created_at)
        }}</HintTooltip>
      </p>
    </template>
  </q-chat-message>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { useUserStore } from 'stores/user-store';

import AvatarImage from '../AvatarImage.vue';
import EditorTipTapV2 from '../editorV2/EditorTipTapV2.vue';

import aiplan from 'src/utils/aiplan';
import { formatDateTimeWithDay } from 'src/utils/time';
import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

import type { IIssueCommentHistory } from '../dialogs/CommentHistoryDialog.vue';
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  comment: IIssueCommentHistory;
  members?: any[];
  edited: boolean;
}>();

const { user } = useUserStore();

const { navigateToActivityPage } = useUserActivityNavigation();

const isAuthor = computed(() => {
  return user.id === props.comment.actor_update.id;
});

const handleTooltip = (detail: DtoUserLight): string => {
  return aiplan.UserName(detail).join(' ');
};

const handleTooltipText = (detail: DtoUserLight): string => {
  return [
    aiplan.UserName(detail)[0].at(0),
    aiplan.UserName(detail)[1]?.at(0),
  ].join(' ');
};
</script>

<style scoped lang="scss">
.chat-message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;

  & > img {
    width: 100%;
  }

  :deep(.html-editor) {
    border: none;
  }
  :deep(.tiptap) {
    min-height: auto !important;
    padding: 1px;
  }

  :deep(.html-editor__container) {
    border-radius: 0 !important;
    min-height: auto !important;
    height: fit-content !important;
    border: 0 !important;
  }
}

.chat-message {
  position: relative;

  &__avatar {
    position: absolute;
    left: 0;
    z-index: 1;
  }

  &__avatar-author {
    position: absolute;
    z-index: 1;
    right: 0;
    left: auto;
  }

  :deep(.q-message-container) {
    padding-left: 60px;
    padding-right: 40px;

    & > div {
      width: 100%;
      display: flex;
      justify-content: flex-start;

      .q-message-text {
        width: fit-content;

        @media screen and (max-width: 720px) {
          max-width: 100%;
        }
        &-content {
          width: fit-content;
          max-width: 100%;
        }
      }
    }

    &.row.reverse {
      padding-left: 40px;
      padding-right: 60px;

      & > div {
        width: 100%;
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  :deep(.q-message-stamp) {
    opacity: 1;
    margin: 4px 0px !important;

    .stamp-text {
      margin: 0;
      opacity: 0.6;
    }
  }
}
</style>
