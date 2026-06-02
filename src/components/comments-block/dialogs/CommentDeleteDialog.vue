<template>
  <q-dialog v-model="isOpen">
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
          @click="emits('onDelete')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import aiplan from 'src/utils/aiplan';
import { formatDateTime } from 'src/utils/time';
import { DtoDocComment } from '@aisa-it/aiplan-api-ts/src/data-contracts';

const props = defineProps<{
  isOpenDialog?: boolean;
  comment: DtoDocComment;
}>();

const emits = defineEmits<{ onDelete: [] }>();

const isOpen = ref(props.isOpenDialog);

watch(
  () => props.isOpenDialog,
  (newVal) => {
    isOpen.value = newVal;
  },
);

const commentUserName = computed(() =>
  aiplan.UserName(props.comment.actor_detail).join(' '),
);

const commentCreatedAt = computed(() =>
  formatDateTime(props.comment?.created_at ?? ''),
);
</script>
