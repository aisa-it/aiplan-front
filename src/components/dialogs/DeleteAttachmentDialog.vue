<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <div class="abbriviated-text" style="text-wrap: wrap">
          <h6 class="q-ml-md">Удалить вложение</h6>
          <span>
            Вы действительно хотите удалить вложение —
            <b class="word-wrap">"{{ name }}"</b> ?
          </span>
          <p class="q-mb-none">
            Это вложение будет удалено навсегда. Действие необратимо.
          </p>
        </div>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          label="Отменить"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          label="Удалить"
          class="delete-btn"
          @click="handleDelete"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps<{
  currentAttachment: any;
}>();

const emit = defineEmits<{
  (e: 'delete'): void;
}>();

const name = computed(() => {
  if (props.currentAttachment?.attributes) {
    return (
      props.currentAttachment?.attributes.name ||
      props.currentAttachment?.asset.split('/')[1]
    );
  } else {
    return (
      props.currentAttachment?.asset?.name ||
      props.currentAttachment?.asset?.id.split('/')[1]
    );
  }
});

const handleDelete = () => {
  emit('delete');
};
</script>
