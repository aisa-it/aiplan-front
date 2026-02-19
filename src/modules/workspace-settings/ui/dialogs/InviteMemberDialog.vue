<template>
  <q-dialog>
    <q-card class="modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Приглашение пользователей</h6>
        <q-select
          class="base-input adaptive-input"
          use-input
          use-chips
          multiple
          hide-dropdown-icon
          v-model="form.emailsList"
          new-value-mode="add-unique"
          type="email"
          input-debounce="0"
          behavior="menu"
          data-id="invite-member-email"
          label="Введите email"
          lazy-rules
          :rules="[validateEmails]"
          @keydown.space="handleInput"
          @keydown.enter="handleInput"
          @blur="handleInput"
          @remove="handleChipRemove"
          ref="emailInputRef"
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
          style="width: 115px"
          v-close-popup
        />
        <q-btn
          flat
          no-caps
          unelevated
          data-id="invite-member-button"
          label="Пригласить"
          @click="inviteMember"
          style="width: 115px"
          :disable="!areAllEmailsValid || form.emailsList.length === 0"
          class="primary-btn"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts" setup>
import { computed, onUpdated, ref, nextTick } from 'vue';
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

// interfaces
interface Form {
  emailsList: string[];
  role: (typeof ROLES)[number];
}

// vars
const form = ref<Form>({
  emailsList: [],
  role: ROLES[0],
});

const currentUserDisable = ref();
const emailInputRef = ref();

// function
const isEmailValid = (email: string) => isEmail(email) === true;

const areAllEmailsValid = computed(() => {
  return form.value.emailsList.every((email) => isEmailValid(email));
});

const validateEmails = (emails: string[]) => {
  if (!emails || emails.length === 0) {
    return 'Необходимо ввести email';
  }

  const allValid = emails.every((email) => isEmailValid(email));
  return allValid || 'Все email должны быть корректными';
};

const triggerValidation = () => {
  nextTick(() => {
    emailInputRef.value?.validate();
  });
};

const handleChipRemove = (details: { index: number; value: string }) => {
  form.value?.emailsList.splice(details.index, 1);

  emailInputRef.value?.updateInputValue('', true);
  triggerValidation();
};

const handleInput = (event: Event) => {
  event.preventDefault();

  const input = getCurrentInput();

  if (input && input.value.trim()) {
    const textValue = input.value.trim();

    emailInputRef.value?.add(textValue, true);
    emailInputRef.value?.updateInputValue('', true);

    triggerValidation();

    if (props.isSuperuser && form.value.emailsList.includes(props.userMail)) {
      form.value.role = ROLES[2];
      currentUserDisable.value = true;
    } else {
      currentUserDisable.value = false;
    }
  }
};

const getCurrentInput = () => {
  return emailInputRef.value?.$el?.querySelector('input');
};

const inviteMember = async () => {
  const emailsArray = form.value.emailsList.map((email) => {
    return {
      email: email,
      role: form.value.role.value,
    };
  });

  await inviteWorkspace(props.currentWsSlug, {
    emails: emailsArray,
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
      emailsList: [],
      role: ROLES[0],
    }),
);
</script>
