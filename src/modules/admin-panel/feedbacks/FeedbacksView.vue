<template>
  <AdminHeader :title="'Отзывы'" isFlex>
    <ExportButton @click="exportFeedbacks" />
  </AdminHeader>

  <FeedbacksTable @row-c-lick="openFeedbackDetail" />

  <FeedbackDialog
    v-model="isFeedbackDetailOpen"
    :readOnlyFeedback="currentFeedback"
    @hide="closeFeedbackDetail"
  />
</template>

<script setup lang="ts">
import FeedbackDialog from 'src/components/dialogs/FeedbackDialog.vue';
import AdminHeader from '../ui/AdminHeader.vue';
import FeedbacksTable from './components/FeedbacksTable.vue';
import ExportButton from './ui/ExportButton.vue';

import { useFeedbackManagement } from './composables/useFeedbackManagement';

const {
  currentFeedback,
  isFeedbackDetailOpen,
  openFeedbackDetail,
  closeFeedbackDetail,
  exportFeedbacks,
} = useFeedbackManagement();
</script>
