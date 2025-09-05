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
          label="Отменить"
          v-close-popup
        />
        <q-btn
          flat
          dense
          no-caps
          class="delete-btn"
          label="Удалить"
          v-close-popup
          @click="$emit('onDelete')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
// core
import { computed, defineComponent } from 'vue';

// utils
import aiplan from 'src/utils/aiplan';
import { formatDateTime } from 'src/utils/time';

export default defineComponent({
  name: 'IssueCommentDeleteDialog',
  props: {
    isOpenDialog: {
      type: Boolean,
      default: false,
    },
    comment: {
      type: Object,
      required: true,
    },
  },
  emits: ['onDelete'],
  setup(props) {
    const commentUserName = computed(() => {
      return aiplan.UserName(props.comment.actor_detail).join(' ');
    });

    const commentCreatedAt = computed(() => {
      return formatDateTime(props.comment.created_at);
    });

    return {
      commentUserName,
      commentCreatedAt,
    };
  },
});
</script>
