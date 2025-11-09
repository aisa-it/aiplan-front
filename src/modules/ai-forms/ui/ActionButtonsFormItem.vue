<template>
  <q-btn
    class="menu-link__btn"
    flat
    icon="more_horiz"
    :style="'min-height: 18px !important; min-width: 18px; font-size: 12px; padding: 0; color: gray;'"
    @click.stop
  >
    <q-menu>
      <q-list :style="'min-width: 225px; !important'">
        <q-item v-for="action in actions" :key="action.label">
          <q-btn
            flat
            dense
            no-caps
            v-close-popup
            class="full-w menu-link__settings-btn"
            :style="'font-size: 12px; line-height: 1;'"
            @click.stop="action.onClick"
          >
            <component
              :is="action.icon"
              :width="16"
              :height="16"
              class="q-mr-sm"
            />
            <span>{{ action.label }}</span>
          </q-btn>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import EditIcon from 'src/components/icons/EditIcon.vue';
import LinkIcon from 'src/components/icons/LinkIcon.vue';
import BinIcon from 'src/components/icons/BinIcon.vue';

const emit = defineEmits(['edit', 'copy', 'delete']);

const actions = [
  {
    label: 'Редактировать форму',
    icon: EditIcon,
    onClick: () => emit('edit'),
  },
  {
    label: 'Скопировать ссылку',
    icon: LinkIcon,
    onClick: () => emit('copy'),
  },
  {
    label: 'Удалить форму',
    icon: BinIcon,
    onClick: () => emit('delete'),
  },
];
</script>
