<template>
  <div class="q-pb-xs bg-base">
    <JitsiDialog />
    <NavMenuBottomBarHelpAndSupport />
    <q-banner v-show="unstableRelease" rounded class="bg-orange text-white">
      <b>Внимание!</b> Вы находитесь на активно разрабатываемой версии АИПлана.
      Сохранность данных не гарантируется.
    </q-banner>
  </div>
</template>

<script lang="ts">
// core
import { defineComponent, ref } from 'vue';
import JitsiDialog from 'src/components/dialogs/JitsiDialog.vue';

//components
import NavMenuBottomBarHelpAndSupport from 'components/menu/NavMenuBottomBarHelpAndSupport.vue';

export default defineComponent({
  name: 'NavMenuBottomBar',
  setup() {
    // ordinary vars
    const unstableRelease = ref(
      location.hostname === 'test.aiplan.aisa.ru' ||
        location.hostname === 'localhost',
    );

    return {
      unstableRelease,
    };
  },

  components: {
    JitsiDialog,
    NavMenuBottomBarHelpAndSupport,
  },
});
</script>

<style scoped lang="scss">
:deep(.q-btn__content) {
  justify-content: flex-start;
}

.fully-centered {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
