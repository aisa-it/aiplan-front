<template>
  <q-dialog @show="loadCommentHistory" @hide="clearCommentHistory">
    <q-card class="history-comments">
      <q-card-section class="row no-wrap items-center">
        <div class="text-h6 text-weight-bold text-wrap">
          Изменения в комментарии
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="history-comments__list visible-scroll">
        <div v-if="!loading">
          <CommentHistoryItem
            v-for="(oldComment, index) in commentHistoryList"
            :key="oldComment.comment_id as string"
            :comment="oldComment"
            :edited="index !== commentHistoryList.length - 1"
            :members="members"
          />
        </div>
        <q-inner-loading v-else :showing="loading">
          <DefaultLoader />
        </q-inner-loading>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useProjectStore } from 'stores/project-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useAiDocStore } from 'src/stores/aidoc-store';

import CommentHistoryItem from '../issue-panels/CommentHistoryItem.vue';
import DefaultLoader from '../loaders/DefaultLoader.vue';

import {
  DtoCommentHistory,
  DtoDocComment,
  DtoIssueComment,
  DtoProjectMember,
  DtoProjectMemberLight,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { useWorkspaceStore } from 'src/stores/workspace-store';

const { project } = storeToRefs(useProjectStore());
const { getIssueCommentHistory } = useSingleIssueStore();
const { currentIssueID } = storeToRefs(useSingleIssueStore());
const { getDocCommentHistory } = useAiDocStore();
const { selectedDocId } = storeToRefs(useAiDocStore());
const { currentWorkspaceSlug } = storeToRefs(useWorkspaceStore());

const props = defineProps<{
  comment: DtoDocComment | DtoIssueComment;
  members?: DtoProjectMember[] | DtoProjectMemberLight[];
  context: 'issue' | 'doc';
}>();

const loading = ref<boolean>(false);
const commentHistoryList = ref<DtoCommentHistory[]>([]);

const loadCommentHistory = async () => {
  loading.value = true;
  try {
    if (props.context === 'issue') {
      commentHistoryList.value = await getIssueCommentHistory(
        currentWorkspaceSlug.value as string,
        project.value.id,
        currentIssueID.value,
        props.comment.id as string,
      ).then((data) => data.result);
    } else if (props.context === 'doc') {
      commentHistoryList.value = await getDocCommentHistory(
        currentWorkspaceSlug.value as string,
        selectedDocId.value as string,
        props.comment.id as string,
      ).then((data) => data.result);
    }
  } catch {
    clearCommentHistory();
    console.error('Не удалось загрузить историю комментария');
  } finally {
    loading.value = false;
  }
};

const clearCommentHistory = () => {
  commentHistoryList.value = [];
};
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
    max-height: 70vh;
    overflow-y: auto;
  }
}

.visible-scroll {
  scrollbar-width: auto !important;
  scrollbar-color: auto !important;
}

.visible-scroll::-webkit-scrollbar {
  display: block !important;
}
</style>
