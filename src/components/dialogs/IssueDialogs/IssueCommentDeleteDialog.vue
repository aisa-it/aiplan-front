<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Удаление комментария</h6>
        <span>
          Вы действительно хотите удалить комментарий
          <b>{{ commentUserName }}</b> от <b>{{ commentCreatedAt }}</b
          >? <br />
          Этот комментарий будет удален навсегда. Действие необратимо.
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          dense
          no-caps
          class="secondary-btn"
          style="width: 100px"
          label="Отменить"
          v-close-popup
        />
        <q-btn
          flat
          dense
          no-caps
          class="delete-btn"
          style="width: 100px"
          label="Удалить"
          v-close-popup
          @click="$emit('onDelete')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { computed } from 'vue';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDateTime } from 'src/utils/time';
import { DtoIssueComment } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{ comment: DtoIssueComment }>();
defineEmits<{ onDelete: [] }>();

const commentUserName = computed(() => {
  return aiplan.UserName(props.comment.actor_detail).join(' ');
});

const commentCreatedAt = computed(() => {
  return formatDateTime(props.comment.created_at ?? '');
});
</script>
