<template>
  <div class="row centered-horisontally justify-between full-w">
    <q-item-section avatar>
      <MenuFormsIcon :is-dark="$q.dark.isActive" />
    </q-item-section>
    <q-item-section>Формы</q-item-section>
    <q-btn
      flat
      dense
      style="margin-right: 5px"
      @click.stop.prevent="$emit('clickAddButton')"
      ><q-icon name="add" dense size="18px" />
      <HintTooltip>Создать форму</HintTooltip>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import MenuFormsIcon from 'src/components/icons/MenuFormsIcon.vue';

defineEmits<{ clickAddButton: [] }>();

const $q = useQuasar();
</script>
