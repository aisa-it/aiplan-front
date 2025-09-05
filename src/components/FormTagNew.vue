<template>
  <q-dialog
    class="form-tag-new__container"
    @hide="clearFields"
    @before-show="clearFields"
    ref="myModal"
  >
    <q-card class="inner-modal-card">
      <q-card-section style="flex: 1">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            class="base-input"
            dense
            v-model="color"
            :rules="['anyColor']"
          >
            <template v-slot:prepend
              ><q-badge rounded :style="{ backgroundColor: color }"
            /></template>
            <template v-slot:append>
              <q-icon
                name="colorize"
                class="cursor-pointer"
                @click="colorPickerDialogVisible = true"
              ></q-icon>
              <q-dialog v-model="colorPickerDialogVisible">
                <q-color
                  v-model="color"
                  @input="colorPickerDialogVisible = false"
                />
              </q-dialog>
            </template>
          </q-input>
          <q-input
            style="flex: 1"
            dense
            class="base-input"
            v-model="name"
            label="Название тега"
            lazy-rules
            :rules="[
              (val) => !!val || 'Введите название тега',
              (val) =>
                val.trim() !== '' || 'Тег не может состоять только из пробелов',
              (val) => val.length < 300 || 'Слишком длинное имя',
            ]"
            :error="showError"
            :error-message="errorMessage"
          />
          <div class="flex">
            <q-btn class="secondary-btn" style="flex: 1" v-close-popup
              ><CloseIcon color="var(--primary)"
            /></q-btn>
            <q-btn class="primary-btn q-ml-sm" type="submit" style="flex: 1">
              <AddIcon color="#ffffff" />
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useRoute } from 'vue-router';
import { computed, defineComponent, ref } from 'vue';
import { useAiplanStore } from 'src/stores/aiplan-store';
import CloseIcon from './icons/CloseIcon.vue';
import AddIcon from './icons/AddIcon.vue';
import { randomColorHex } from 'src/utils/helpers';
export default defineComponent({
  name: 'FormTagNew',
  emits: ['close', 'add'],
  components: { CloseIcon, AddIcon },
  setup(_, { emit }) {
    const api = useAiplanStore();
    const route = useRoute();
    const name = ref('');
    const color = ref(randomColorHex());
    const isTagExistError = ref(false);
    const showError = ref(false);
    const colorPickerDialogVisible = ref(false);
    const myModal = ref(null);

    const errorMessage = computed(() => {
      if (showError.value) {
        if (isTagExistError.value) {
          return 'Данный тег уже существует в проекте';
        } else if (name.value.length === 0) {
          return 'Введите название';
        }
      }
      return '';
    });

    const clearFields = () => {
      name.value = '';
      color.value = randomColorHex();
      isTagExistError.value = false;
    };

    return {
      onSubmit() {
        showError.value = false;
        api
          .issueLabelCreate(
            route.params.workspace,
            route.params.project,
            name.value,
            color.value,
          )
          .then((d) => {
            emit('add', d.data);
            name.value = '';
            color.value = '#000000';
            isTagExistError.value = false;
            myModal.value.hide();
          })
          .catch((error) => {
            if (error.response && error.response.status === 409) {
              isTagExistError.value = true; // Устанавливаем только при конфликте
              showError.value = true;
            } else {
              console.error('Произошла ошибка при создании тега', error);
            }
          });
      },
      errorMessage,
      showError,
      color,
      name,
      api,
      clearFields,
      colorPickerDialogVisible,
      myModal,
    };
  },
});
</script>
<style></style>
