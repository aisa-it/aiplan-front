<template>
  <q-drawer
    :model-value="modelValue"
    @update:model-value="(val) => $emit('update:modelValue', val)"
    show-if-above
    :side="isMobile ? 'right' : 'left'"
    :width="200"
    :breakpoint="451"
    :behavior="isMobile ? 'mobile' : 'default'"
  >
    <div class="column fit">
      <q-item-label header class="text-weight-bold text-uppercase col-shrink">
        Прогресс
      </q-item-label>
      <q-scroll-area class="col">
        <q-list padding>
          <q-item
            v-for="page in visiblePages"
            :key="page.index"
            clickable
            :disable="page.disabled"
            @click="$emit('go-to-page', page.index)"
            :active="page.active"
            active-class="text-primary bg-blue-1"
            class="q-mb-sm rounded-borders"
          >
            <q-item-section avatar style="min-width: 40px">
              <q-icon
                v-if="page.passed"
                name="check_circle"
                color="positive"
                size="24px"
              />
              <q-icon
                v-else-if="page.active"
                name="radio_button_checked"
                color="primary"
                size="24px"
              />
              <q-icon
                v-else
                name="radio_button_unchecked"
                color="grey-5"
                size="24px"
              />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-weight-medium">
                Вопрос {{ page.index + 1 }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
//core
import { useQuasar } from 'quasar';
import { computed } from 'vue';

interface StepperPage {
  index: number;
  label: string;
  active: boolean;
  passed: boolean;
  disabled: boolean;
}

defineProps<{
  visiblePages: StepperPage[];
  modelValue?: boolean;
}>();

defineEmits(['go-to-page', 'update:modelValue']);

//core
const quasar = useQuasar();

//computed
const isMobile = computed(() => quasar.screen.width < 451);
</script>
