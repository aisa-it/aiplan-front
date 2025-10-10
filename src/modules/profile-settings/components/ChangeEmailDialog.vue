<template>
  <q-dialog ref="dialogRef" @before-show="startTimer" @before-hide="beforeHide">
    <q-card class="modal-card q-pa-md">
      <div class="column">
        <div class="text-subtitle2 text-grey q-mb-md">
          Код подтверждения отправлен на {{ newEmail }}
        </div>
        <div class="row q-col-gutter-sm">
          <q-input
            v-model="code"
            :rules="[(val) => isEmpty(val, 'код')]"
            class="col-8"
            label="Введите код"
            lazy-rules
            hide-bottom-space
            dense
          />
          <q-btn
            label="Отправить"
            class="secondary-btn form-userdata__btn col-3 self-center q-ml-auto"
            no-caps
            @click="sendCode"
          />
        </div>

        <div class="row justify-center q-mt-md">
          <q-btn
            v-if="canResend"
            flat
            color="primary"
            label="Отправить код повторно"
            no-caps
            @click="resendCode"
          />
          <div v-else class="text-caption text-grey">
            Отправить код повторно можно через {{ remainingTime }} сек
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue';
import { isEmpty } from 'src/utils/validation';
import { api } from '../services/api';

const props = defineProps<{ newEmail: string }>();
const emits = defineEmits<{ emailUpdated: [] }>();

const code = ref('');
const dialogRef = ref();
const canResend = ref(false);
const remainingTime = ref(60);
let timer: number | null = null;

const sendCode = async () => {
  api
    .verifyMyEmail({ code: code.value, new_email: props.newEmail })
    .then(() => {
      emits('emailUpdated');
      dialogRef.value.hide();
    });
};

const resendCode = async () => {
  await api.changeMyEmail({ new_email: props.newEmail });
  startTimer();
};

const beforeHide = () => {
  if (timer) clearInterval(timer);
  code.value = '';
};

const startTimer = () => {
  canResend.value = false;
  remainingTime.value = 60;

  timer && clearInterval(timer);
  timer = window.setInterval(() => {
    remainingTime.value -= 1;
    if (remainingTime.value <= 0) {
      clearInterval(timer!);
      timer = null;
      canResend.value = true;
    }
  }, 1000);
};

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});
</script>
