<template>
  <q-btn
    class="menu-link__btn menu-link__btn--hiding1 q-ml-sm"
    flat
    icon="more_horiz"
    :style="'min-height: 18px !important; min-width: 18px; font-size: 12px; padding: 0; color: gray;'"
    @click.prevent.stop
  >
    <q-menu>
      <q-list :style="'min-width: 225px; !important'">
        <q-item>
          <q-btn
            class="menu-link__settings-btn full-w"
            flat
            dense
            no-caps
            v-close-popup
            :style="'font-size: 12px;'"
            @click="emits('openRulesDialog', props.id)"
          >
            <q-icon name="manage_accounts" class="q-mr-sm" dense size="16px" />
            <span>Права доступа</span>
          </q-btn>
        </q-item>
        <q-item>
          <q-btn
            flat
            dense
            no-caps
            v-close-popup
            class="menu-link__settings-btn full-w"
            :style="'font-size: 12px;'"
            @click="emits('openWatchersDialog', props.id)"
          >
            <q-icon name="visibility" class="q-mr-sm" dense size="16px" />
            <span class="row justify-start">Наблюдатели</span>
          </q-btn>
        </q-item>
        <q-item>
          <q-btn
            flat
            dense
            no-caps
            class="menu-link__settings-btn full-w"
            v-close-popup
            :style="'font-size: 12px;'"
            @click="emits('copyLink')"
          >
            <LinkIcon :width="16" :height="16" class="q-mr-sm" /><span>
              Скопировать ссылку
            </span>
          </q-btn>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import LinkIcon from '../icons/LinkIcon.vue';

const props = defineProps<{
  id: string;
}>();

const emits = defineEmits<{
  openRulesDialog: [value: string];
  openWatchersDialog: [value: string];
  copyLink: [];
}>();
</script>
