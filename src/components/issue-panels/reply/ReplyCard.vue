<template>
  <div class="q-pa-xs full-w" :class="preventClass">
    <q-card class="reply-card">
      <q-card-section class="reply-card__section">
        <q-icon v-if="isNotMessage" name="reply"/>
        <q-btn
          no-caps
          class="reply-card__text q-pa-sm"
          align="left"
          @click="handleClickOpenPreview"
        >
          <div class="reply-card__text-wrapper">
            <h6 class="reply-card__text-title">
              <span v-if="isNotMessage">В ответ:</span>
              {{ userFirstNameAndLastName }}
            </h6>
            <div class="reply-card__text-description abbriviated-text">
              <span v-html="commentStripped"></span>
            </div>
          </div>
        </q-btn>
        <q-btn
          v-if="isNotMessage"
          dense
          flat
          size="8px"
          @click="handleClickDelete"
        >
          <CloseIcon />
          <HintTooltip> Убрать ответ </HintTooltip>
        </q-btn>
      </q-card-section>
    </q-card>

    <ReplyPreviewDialog
      v-model="showCommentPreview"
      :comment-preview="replyComment"
      :members="members"
      :class="preventClass"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import CloseIcon from 'components/icons/CloseIcon.vue';
import ReplyPreviewDialog from 'components/issue-panels/reply/ReplyPreviewDialog.vue';

export default defineComponent ({
  name: 'ReplyCard',
  components: { ReplyPreviewDialog, CloseIcon },
  props: {
    replyComment: {
      type: Object,
      required: false,
      default: () => {
        return {}
      }
    },
    isNotMessage: {
      type: Boolean,
      required: false,
      default: false,
    },
    members: {
      type: Array,
      required: false,
      default: () => [],
    },
    preventClass: {
      type: String,
      required: false,
    },
  },
  emits: ['delete-reply'],
  setup(props, { emit }) {

    const showCommentPreview = ref<boolean>(false);

    const userFirstNameAndLastName = computed(() => {
      const firstName = props.replyComment?.actor_detail?.first_name?? '';
      const lastName = props.replyComment?.actor_detail?.last_name?? '';

      if (!firstName && !lastName) {
        return '';
      }

      return `${firstName} ${lastName}`;
    });

    const commentStripped = computed(() => {
      return `${props.replyComment?.comment_stripped?? ''}`
    });

    const handleClickDelete = () => {
      emit('delete-reply');
    };

    const handleClickOpenPreview = () => {
      showCommentPreview.value = true;
    };

    return {
      commentStripped,
      handleClickDelete,
      showCommentPreview,
      handleClickOpenPreview,
      userFirstNameAndLastName,
    }
  }
});
</script>

<style lang="scss" scoped>
.reply-card {
  &__section {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px;
  }

  &__text {
    overflow: hidden;
    width: 100%;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      background-color: $primary-light;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    &-wrapper {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 5px;
      flex-grow: 1;
      flex-shrink: 1;
      overflow: hidden;
      text-align: left;
    }

    &-title {
      font-size: $small-font-size;
      margin: 0 !important;
    }
  }
}
</style>
