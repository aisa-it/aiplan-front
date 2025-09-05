<template>
  <!-- <SpecialLoader
    v-if="
      user.id === 'dbd67d71-54c8-45b5-8137-a61a47aab7a6' ||
      LocalStorage.getItem('special-version')
    "
  /> -->
  <q-spinner-oval :color="color" :size="computedSize"></q-spinner-oval>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';
// import SpecialLoader from './SpecialLoader.vue';
import { LocalStorage } from 'quasar';

export default defineComponent({
  name: 'LoaderDefault',
  // components: { SpecialLoader },
  props: {
    size: {
      type: Number,
      default: 50,
    },
    color: {
      type: String,
      default: 'primary',
    },
    unit: {
      type: String,
      default: 'px',
      validator: (value: string) =>
        ['px', 'em', 'rem', '%', 'vw', 'vh'].includes(value),
    },
  },
  setup(props) {
    const userStore = useUserStore();
    const { user } = storeToRefs(userStore);

    const computedSize = computed(() => {
      return `${props.size}${props.unit}`;
    });
    return {
      user,
      LocalStorage,
      computedSize,
    };
  },
});
</script>
