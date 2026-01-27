<template>
  <q-dialog ref="dialogRef" @hide="resetDialog()" @show="showDialog">
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">
          {{ isEditLink ? 'Редактирование' : 'Добавление' }} ссылки
        </h6>

        <q-form ref="formRef" @submit="onSubmit">
          <q-input
            v-model="form.url"
            ref="urlInput"
            class="base-input relative-error"
            dense
            label="URL"
            lazy-rules
            :rules="[urlRule]"
          />
          <q-input
            v-model="form.title"
            ref="titleInput"
            label="Название"
            class="base-input q-pa-none"
            dense
            lazy-rules
            :rules="[nameRule]"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          dense
          no-caps
          class="secondary-btn"
          label="Отменить"
          style="width: 110px"
          v-close-popup
        />
        <q-btn
          flat
          dense
          no-caps
          class="primary-btn"
          style="width: 110px"
          @click="submitForm"
        >
          {{ isEditLink ? 'Сохранить' : 'Добавить' }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { DaoIssueLink } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { QDialog, QInput } from 'quasar';
import { computed, ref, watch } from 'vue';
import { isValidURL } from 'src/utils/validation';

const props = defineProps<{
  issue?: string;
  link?: DaoIssueLink;
}>();
const emits = defineEmits<{
  create: [link: DaoIssueLink];
  edit: [link: DaoIssueLink];
}>();

const formRef = ref();
const dialogRef = ref<QDialog | null>(null);
const urlInput = ref<QInput | null>(null);
const titleInput = ref<QInput | null>(null);
const form = ref<DaoIssueLink>({
  url: '',
  title: '',
});

const isEditLink = computed(() => !!props.link);

const urlRule = (val: string) =>
  isValidURL(val) || 'Введите URL в формате schema://example.com';
const nameRule = (val: string) => !!val.length || 'Введите название';

const resetDialog = () => {
  resetForm();
};

const showDialog = () => {
  if (isEditLink.value) {
    form.value.title = props.link?.title;
    form.value.url = props.link?.url;
  }
};

const submitForm = () => {
  formRef.value?.submit();
};

const resetForm = () => {
  formRef.value?.resetValidation();
  form.value.url = '';
  form.value.title = '';
};

const onSubmit = () => {
  urlInput.value?.validate();
  titleInput.value?.validate();

  const hasValidationErrors =
    urlInput.value?.hasError || titleInput.value?.hasError;

  if (hasValidationErrors) return;

  const payload = { ...form.value };

  if (isEditLink.value) {
    emits('edit', {
      id: props.link?.id,
      title: payload.title,
      url: payload.url,
    });
  } else {
    emits('create', { title: payload.title, url: payload.url });
  }
  dialogRef.value?.hide();
};

watch(
  () => props.link,
  (newValue) => {
    if (newValue) {
      form.value.title = newValue.title;
      form.value.url = newValue.url;
    }
  },
);
</script>

<style lang="scss">
.relative-error {
  padding-bottom: 5px;

  .q-field__bottom--animated {
    transform: none;
    position: static;
  }
}
</style>
