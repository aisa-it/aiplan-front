<template>
  <q-chat-message
    :id="'comment_' + comment.id"
    :sent="isAuthor"
    class="chat-message"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
    @touchstart="handleTouchStart"
  >
    <template v-slot:avatar>
      <AvatarImage
        :style="'margin-right: 10px; margin-left: 10px;'"
        border
        rounded
        class="chat-message__avatar"
        :class="{ 'chat-message__avatar-author': isAuthor }"
        :tooltip="handleTooltip(comment.actor_detail)"
        :text="handleTooltipText(comment.actor_detail)"
        :image="comment.actor_detail.avatar_id"
        :member="comment.actor_detail"
        @click="navigateToActivityPage(comment.actor_detail.id)"
      />
    </template>

    <template v-slot:default>
      <div
        :class="`chat-message-wrapper ${
          canDeleteComment && project?.current_user_membership?.role > 5
            ? 'include-delete-btn'
            : ''
        }
          `"
      >
        <ReplyCard
          v-if="comment.reply_to_comment_id && comment.original_comment"
          :reply-comment="comment.original_comment"
          :members="members"
        />

        <EditorTipTapV2
          :editor-id="'message-editor-' + comment.id"
          :model-value="comment.comment_html"
          :can-edit="false"
          read-only-editor
          :members="members"
          is-mention
        />
        <q-btn
          v-if="canDeleteComment && project?.current_user_membership?.role > 5"
          dense
          flat
          size="8px"
          style="position: absolute; right: 7px"
          class="q-mt-xs"
          @click="handleDeleteComment"
        >
          <CloseIcon />
          <HintTooltip> Удалить </HintTooltip>
        </q-btn>
      </div>
    </template>

    <template v-slot:stamp>
      <div class="chat-message-stamp">
        <div class="row justify-between items-center" style="gap: 10px">
          <span class="stamp-text"
            >{{ formatDateTimeWithDay(comment.created_at) }}
            <span v-if="comment?.updated_by_id"
              >изменено
              <HintTooltip>{{
                formatDateTimeWithDay(comment?.updated_at)
              }}</HintTooltip>
            </span></span
          >
          <div class="flex">
            <q-btn
              class="stamp-btn"
              dense
              flat
              size="8px"
              @click.prevent.stop="
                singleIssueStore.issueСommentsLinkToClipboard(comment.id)
              "
            >
              <LinkIcon :width="18" :height="18" />
              <HintTooltip> Скопировать ссылку </HintTooltip>
            </q-btn>
            <q-btn
              v-if="hasPermissionByIssue(issueData, project, 'add-comment')"
              class="stamp-btn"
              dense
              flat
              size="8px"
              icon="reply"
              @click.prevent.stop="handleClickReply"
            >
              <HintTooltip> Ответить </HintTooltip>
            </q-btn>
            <q-btn
              v-if="
                isAuthor &&
                hasPermissionByIssue(issueData, project, 'add-comment')
              "
              class="stamp-btn"
              dense
              flat
              size="8px"
              @click.prevent.stop="editComment"
            >
              <EditIcon />
              <HintTooltip> Редактировать </HintTooltip>
            </q-btn>
          </div>
        </div>

        <ReactionList
          class="q-mb-sm"
          :reaction-list="reactionList"
          @update-reaction="handleUpdateReaction"
        />
        <ReactionSelectEmoji
          v-if="hasPermissionByIssue(issueData, project, 'add-comment')"
          :is-touch-start="isTouchStart"
          :is-show-reaction-menu="isHoverMessageText"
          :position-menu-left="isAuthor"
          @mouseenter="handleMouseEnterReaction"
          @mouseleave="handleMouseLeaveReaction"
          @update-reaction="handleUpdateReaction"
        />
      </div>
    </template>
  </q-chat-message>
</template>

<script setup lang="ts">
// core
import {
  computed,
  onBeforeMount,
  onUnmounted,
  ref,
  watch,
} from 'vue';

// store
import { storeToRefs } from 'pinia';
import { useUserStore } from 'stores/user-store';
import { useRolesStore } from 'stores/roles-store';
import { useProjectStore } from 'stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useWorkspaceStore } from 'stores/workspace-store';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDateTimeWithDay } from 'src/utils/time';

// components
import EditIcon from '../icons/EditIcon.vue';
import CloseIcon from '../icons/CloseIcon.vue';
import AvatarImage from '../AvatarImage.vue';
import ReplyCard from 'components/issue-panels/reply/ReplyCard.vue';
import ReactionList from 'components/issue-panels/reaction/ReactionList.vue';
import ReactionSelectEmoji from 'components/issue-panels/reaction/ReactionSelectEmoji.vue';
import LinkIcon from '../icons/LinkIcon.vue';
import EditorTipTapV2 from '../editorV2/EditorTipTapV2.vue';

// composables
import { useUserActivityNavigation } from 'src/composables/useUserActivityNavigation';

const props = defineProps<{
  comment: any;
  members: any[];
}>();

const emits = defineEmits<{
  'handle-edit': [];
  'handle-delete': [];
  'handle-reply': [];
  'add-reaction': [value: string];
  'delete-reaction': [value: string];
}>();

// store
const userStore = useUserStore();
const singleIssueStore = useSingleIssueStore();
const projectStore = useProjectStore();

// store to vars
const { user } = userStore;
const { project } = storeToRefs(projectStore);
const { issueData } = storeToRefs(singleIssueStore);
const { hasPermissionByIssue, hasPermission } = useRolesStore();

// vars
const isUpdateComment = ref<boolean>(false);
const closeTimer = ref();
const isHoverMessageText = ref(false);
const isTouchStart = ref<boolean>(false);
const isTouchReaction = ref<boolean>(false);

const { navigateToActivityPage } = useUserActivityNavigation();

const isAuthor = computed(() => {
  return user.id === props.comment.actor_id;
});

const canDeleteComment = computed(
  () => isAuthor.value || hasPermission('delete-issue-comment'),
);
const reactionList = computed(() => {
  const reactions = [];

  const reactionSummary = props.comment.reaction_summary;
  for (const reactionKey in reactionSummary) {
    const commentReactionsFilter = props.comment.reactions.filter(
      (r) => reactionKey === r.reaction,
    );

    const users = [];

    commentReactionsFilter.forEach((r) => {
      const member = props.members.find((m) => r.user_id === m.member_id)
        ?.member;

      const user = {
        ...r,
        user_detail: member,
      };

      users.push(user);
    });

    const reaction = {
      reaction: reactionKey,
      count: reactionSummary[reactionKey],
      users: users,
    };

    reactions.push(reaction);
  }

  return reactions;
});

const editComment = () => {
  emits('handle-edit');
  isUpdateComment.value = false;
  isTouchStart.value = false;
  isHoverMessageText.value = false;
  isTouchReaction.value = false;
};

const handleDeleteComment = () => {
  emits('handle-delete');
  isTouchReaction.value = false;
  isTouchStart.value = false;
  isHoverMessageText.value = false;
};

const handleClickReply = () => {
  emits('handle-reply');
  isTouchReaction.value = false;
  isTouchStart.value = false;
  isHoverMessageText.value = false;
};

const handleTooltip = (detail: string): string => {
  return aiplan.UserName(detail).join(' ');
};

const handleTooltipText = (detail: string): string => {
  return [
    aiplan.UserName(detail)[0].at(0),
    aiplan.UserName(detail)[1]?.at(0),
  ].join(' ');
};

const handleMouseMove = (e: MouseEvent) => {
  if (isTouchReaction.value) {
    return;
  }
  e.preventDefault();
  isHoverMessageText.value = !!(
    e.target && e.target.closest('.q-message-text')
  );
  cancelDelayedClose();
};

const handleMouseLeave = (e: MouseEvent) => {
  e.preventDefault();
  delayedCloseMenu();
};

const closeMenu = () => {
  isHoverMessageText.value = false;
  isTouchReaction.value = false;
};

const delayedCloseMenu = () => {
  closeTimer.value = setTimeout(() => {
    closeMenu();
  }, 200);
};

const cancelDelayedClose = () => {
  clearTimeout(closeTimer.value);
};

const handleMouseEnterReaction = () => {
  cancelDelayedClose();
};

const handleMouseLeaveReaction = () => {
  delayedCloseMenu();
};

const handleTouchStart = (e: TouchEvent) => {
  if (e.target && e.target.closest('.q-btn.reaction')) {
    isHoverMessageText.value = false;
    isTouchStart.value = false;
    isTouchReaction.value = true;
    return;
  }

  isHoverMessageText.value = false;
  isTouchStart.value = !!(e.target && e.target.closest('.q-message-text'));
};

const addReaction = (value: string) => {
  emits('add-reaction', value);
};

const deleteReaction = (value: string) => {
  emits('delete-reaction', value);
};

const handleUpdateReaction = (value: string) => {
  if (!hasPermissionByIssue(issueData.value, project.value, 'add-comment'))
    return;

  const findReaction = reactionList.value.find((r) => r.reaction === value);

  if (findReaction) {
    const currentUserReaction = findReaction.users.find(
      (u) => u.user_id === user.id,
    );

    if (currentUserReaction) {
      deleteReaction(value);
    } else {
      addReaction(value);
    }
  } else {
    addReaction(value);
  }

  closeMenu();
};

const onTouchStartOutside = (e: TouchEvent) => {
  const target = e.target as HTMLElement;
  if (!target.closest(`#comment_${props.comment.id}`)) {
    isHoverMessageText.value = false;
    isTouchStart.value = false;
    isTouchReaction.value = false;
  }
};

const addListener = () => {
  document.addEventListener('touchstart', onTouchStartOutside);
};

const removeListener = () => {
  document.removeEventListener('touchstart', onTouchStartOutside);
};

onBeforeMount(() => {
  addListener();
});

onUnmounted(() => {
  removeListener();
});

watch(
  () => props.comment,
  (newValue, oldValue) => {
    if (newValue.comment_stripped !== oldValue.comment_stripped) {
      isUpdateComment.value = true;
    }
  },
);
</script>

<style lang="scss">
.select-comments-list__comment-wrapper > p > img {
  max-width: 100%;
}

@media screen and (max-width: 500px) {
  .comments__item > .q-card {
    max-width: calc(100% - 103px) !important;
  }

  .issue-panel__comments-card > .q-tab-panels {
    width: 100%;
  }
}

.q-message-text--received {
  color: var(--comments__item-bgc);
  border: 1px solid var(--comments__item__border-color);
  width: 100%;
}

.chat-message-wrapper > img {
  width: 100%;
}

.chat-message-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
}

pre {
  display: block;
  margin-block-start: 1em;
  margin-block-end: 1em;
  margin-inline-start: 0;
  margin-inline-end: 0;
  unicode-bidi: isolate;
  white-space: pre-wrap;
}
</style>

<style scoped lang="scss">
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
        max-width: 90%;
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
      opacity: 0.6;
    }
  }

  &-stamp {
    display: flex;
    flex-direction: column;
  }
}

.chat-message-wrapper {
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

.include-delete-btn {
  padding-right: 30px;

  &__btn-delete {
    position: absolute;
    right: 7px;
  }
}
</style>
