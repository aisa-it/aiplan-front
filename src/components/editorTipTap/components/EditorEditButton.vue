<template>
  <transition name="fade">
    <span
      :class="[
        'html-editor__btn-edit',
        classPrevent,
        { 'html-editor__btn-edit--force': visible || isTocPopupOpen },
      ]"
      title="Нажмите для редактирования"
      @click="emits('enableEditing')"
    >
      <v-icon icon="mdi-pencil" size="22" />

      <v-menu
        v-if="showHeadings && tocLinks.length"
        v-model="isTocPopupOpen"
        :close-on-content-click="true"
        location="start"
        offset="10"
      >
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            icon
            variant="text"
            size="small"
            density="compact"
            :class="`html-editor__btn-toc ${classPrevent}`"
            title="Оглавление"
            @click.stop
          >
            <component :is="ICONS.headingsIcon" />
          </v-btn>
        </template>

        <v-card
          style="max-width: 360px; max-height: 300px"
          class="overflow-y-auto"
        >
          <v-card-title class="text-subtitle-2 pb-2">Оглавление</v-card-title>
          <v-divider />
          <v-card-text class="pt-2 pb-2">
            <div v-for="link in tocLinks" :key="link.id">
              <a
                href="#"
                class="html-editor__toc-link"
                :style="{ paddingLeft: `${30 * (link.originalLevel - 1)}px` }"
                @click.prevent="emits('toc-click', link)"
              >
                {{ !hasOwnNumeration(link.text) ? `${link.index} ` : ''
                }}{{ link.text }}
              </a>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </span>
  </transition>
</template>

<script setup lang="ts">
import { ICONS } from '@/utils/icons';
import { hasOwnNumeration, type TocLink } from '../composables/useEditorToc';

defineProps<{
  visible: boolean;
  showHeadings?: boolean;
  tocLinks: TocLink[];
  classPrevent?: string;
}>();

const emits = defineEmits<{
  enableEditing: [];
  'toc-click': [link: TocLink];
}>();

const isTocPopupOpen = defineModel<boolean>('isTocPopupOpen', { default: false });
</script>
