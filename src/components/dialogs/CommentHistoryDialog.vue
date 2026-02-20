<template>
  <q-dialog>
    <q-card class="history-comments">
      <q-card-section class="row no-wrap items-center">
        <div class="text-h6 text-weight-bold text-wrap">
          Изменения в комментарии
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section
        v-if="commentHistoryList.length"
        class="history-comments__list"
      >
        <CommentHistoryItem
          v-for="(oldComment, index) in commentHistoryList"
          :key="oldComment.comment_id"
          :comment="oldComment"
          :edited="index !== commentHistoryList.length - 1"
          :members="members"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue';

import { storeToRefs } from 'pinia';
import { useProjectStore } from 'stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useAiDocStore } from 'src/stores/aidoc-store';

import CommentHistoryItem from '../issue-panels/CommentHistoryItem.vue';

import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useWorkspaceStore } from 'src/stores/workspace-store';

const { project } = storeToRefs(useProjectStore());
const { getIssueCommentHistory } = useSingleIssueStore();
const { currentIssueID } = storeToRefs(useSingleIssueStore());
const { getDocCommentHistory } = useAiDocStore();
const { selectedDocId } = storeToRefs(useAiDocStore());
const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());

export interface IIssueCommentHistory {
  actor_update: DtoUserLight;
  comment_html: string;
  comment_id: string;
  comment_stripped: string;
  created_at: string;
  updated_by_id: string;
}

const props = defineProps<{
  comment: any;
  members?: any[];
  context: 'issue' | 'doc';
}>();

const commentHistoryList = ref<IIssueCommentHistory[]>([]);

watch(
  () => props.comment,
  async () => {
    try {
      if (props.context === 'issue') {
        commentHistoryList.value = await getIssueCommentHistory(
          project.value.id,
          currentIssueID.value,
          props.comment.id,
        ).then((res) => res.data.result);
      } else if (props.context === 'doc') {
        commentHistoryList.value = await getDocCommentHistory(
          currentWorkspaceSlug.value as string,
          selectedDocId.value as string,
          props.comment.id,
        ).then((res) => res.data.result);
      }
    } catch {
      commentHistoryList.value = [];
      console.error('Не удалось загрузить историю комментария');
    }
  },
);
</script>

<style lang="scss" scoped>
.history-comments {
  min-width: 60%;
  border-radius: 16px;

  @media screen and (width < 600px) {
    min-width: auto;
  }

  &__list {
    background-image: var(--bg-activities-pattern);
  }
}
</style>
