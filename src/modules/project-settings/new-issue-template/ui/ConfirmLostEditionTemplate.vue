<template>
  <q-dialog>
    <q-card class="inner-modal-card">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Закрыть редактирование шаблона</h6>
        <span>
          Вы уверены, что хотите закрыть окно? Все внесенные данные будут
          утеряны.</span
        >
        <span></span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          dense
          no-caps
          class="secondary-btn"
          label="Вернуться в шаблон"
          style="width: 180px"
          @click="() => emit('backToEdition')"
        />
        <q-btn
          flat
          dense
          no-caps
          class="primary-btn"
          label="Закрыть"
          style="width: 180px"
          @click="() => emit('closeEdition')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">

const emit = defineEmits(['closeEdition', 'backToEdition']);

</script>

<style scoped>
.confirm-lost-edition-card {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  padding: 18px;
}

.confirm-text {
  text-align: center;
}

.q-item {
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
}

.q-item:last-child {
  margin-top: -25px;
}

.q-item > p {
  margin-bottom: 0;
}

.confirm-btn-wrapper {
  margin-top: 15px;
  width: 250px;
  display: flex;
  justify-content: space-between;
}
</style>
