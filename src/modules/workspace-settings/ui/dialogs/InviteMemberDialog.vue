<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Приглашение пользователя</h6>

        <q-input
          dense
          class="base-input"
          :model-value="form.email"
          data-id="invite-member-email"
          @update:model-value="setNewValueMail"
          label="Введите email"
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || 'Необходимо ввести email',
            (val) => isEmail(val),
          ]"
        />
        <q-select
          dense
          data-id="select-roles-member-email"
          class="base-selector"
          v-model="form.role"
          :disable="currentUserDisable"
          label="Роль"
          :options="ROLES"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <div v-bind:data-id="scope.opt.dataId">
                  {{ scope.opt.label }}
                </div>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          no-caps
          outline
          data-id="cancel-member-button"
          label="Отменить"
          class="secondary-btn"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          unelevated
          data-id="invite-member-button"
          label="Пригласить"
          @click="inviteMember"
          :disable="isEmail(form.email) !== true || form.email.length === 0"
          class="primary-btn"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { onUpdated, ref } from 'vue';
import { ROLES } from 'src/constants/constants';
import { isEmail } from 'src/utils/validation';
import { inviteWorkspace } from 'src/modules/workspace-settings/services/api';

// props
const props = defineProps<{
  userMail: string;
  isSuperuser: boolean;
  currentWsSlug: string;
}>();

const emits = defineEmits(['success', 'error', 'update']);

// vars
const form = ref({
  email: '',
  role: ROLES[0],
});
const currentUserDisable = ref();

// function
const setNewValueMail = (val: any) => {
  form.value.email = val;
  if (props.isSuperuser && form.value.email === props.userMail) {
    form.value.role = ROLES[2];
    currentUserDisable.value = true;
  } else {
    currentUserDisable.value = false;
  }
};

const inviteMember = async () => {
  await inviteWorkspace(props.currentWsSlug, {
    emails: [{ email: form.value.email, role: form.value.role.value }],
  })
    .then(async () => {
      emits('update');
      emits('success');
    })
    .catch(() => emits('error', 'Введён некорректный email.'));
};

// hooks
onUpdated(
  () =>
    (form.value = {
      email: '',
      role: ROLES[0],
    }),
);
</script>
