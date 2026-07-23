<template>
  <q-list>
    <q-item
      clickable
      v-close-popup
      class="centered-horisontally"
      @click="emit('open-help')"
    >
      <q-item-section avatar>
        <BookIcon />
      </q-item-section>

      <q-item-section> Руководство </q-item-section>
    </q-item>
    <q-item
      clickable
      v-close-popup
      class="centered-horisontally"
      @click="emit('open-feedback')"
    >
      <q-item-section avatar>
        <EditIcon />
      </q-item-section>
      <q-item-section> Оставить отзыв </q-item-section>
    </q-item>
    <q-item clickable class="centered-horisontally" v-close-popup>
      <q-item-section avatar>
        <ChatIcon />
      </q-item-section>
      <q-item-section>
        <a
          href="https://t.me/aiplan_faq"
          target="_blank"
          style="text-decoration: none; color: inherit"
        >
          Поддержка
        </a>
      </q-item-section>
    </q-item>
    <q-separator />
    <q-item
      clickable
      v-close-popup
      class="centered-horisontally"
      @click="emit('open-release')"
    >
      <span class="sub-text"> Версия <AiplanVersion></AiplanVersion> </span>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import ChatIcon from '../icons/ChatIcon.vue';
import BookIcon from '../icons/BookIcon.vue';
import EditIcon from '../icons/EditIcon.vue';
import AiplanVersion from 'src/components/AiplanVersion.vue';

const emit = defineEmits(['open-help', 'open-feedback', 'open-release']);
</script>
