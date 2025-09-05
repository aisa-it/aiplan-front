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

<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch } from 'vue';
import aiplan from 'src/utils/aiplan';
import { formatDateTime } from 'src/utils/time';

// Определение пропсов
const props = defineProps({
  isOpenDialog: {
    type: Boolean,
    default: false,
  },
  comment: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['onDelete']);

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
  formatDateTime(props.comment.created_at),
);
</script>
