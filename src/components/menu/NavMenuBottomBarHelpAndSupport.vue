<template>
  <div>
    <ExpansionItem type="help" itemName="help">
      <template v-slot:header>
        <q-item-section avatar>
          <HelpIcon />
        </q-item-section>
        <q-item-section> Помощь и поддержка </q-item-section>
      </template>
      <template v-slot:content>
        <q-list>
          <q-item
            clickable
            v-close-popup
            class="centered-horisontally"
            @click="isHelpOpen = !isHelpOpen"
          >
            <BookIcon class="q-mr-md" />
            Руководство пользователя
          </q-item>
          <q-item
            clickable
            v-close-popup
            class="centered-horisontally"
            @click="isFeedbackOpen = !isFeedbackOpen"
          >
            <EditIcon class="q-mr-md" />
            Оставить отзыв
          </q-item>
          <q-item clickable class="centered-horisontally" v-close-popup>
            <ChatIcon class="q-mr-md" />
            <a
              href="https://t.me/aiplan_faq"
              target="_blank"
              style="text-decoration: none; color: inherit"
            >
              Написать в поддержку
            </a>
          </q-item>
          <q-separator />
          <q-item
            clickable
            v-close-popup
            class="centered-horisontally"
            @click="isReleaseOpen = !isReleaseOpen"
          >
            <span class="sub-text">
              Версия <aiplan-version></aiplan-version>
            </span>
          </q-item>
        </q-list>
      </template>
    </ExpansionItem>

    <AiplanHelpDialog v-model="isHelpOpen" />
    <FeedbackDialog
      v-model="isFeedbackOpen"
      @success="(msg) => onSuccess(msg)"
    />

    <ReleaseNotePreviewDialog v-model="isReleaseOpen" />
  </div>
</template>

<script lang="ts" setup>
// core
import { ref } from 'vue';

// services
import { useNotificationStore } from 'src/stores/notification-store';

// constants
import { SUCCESS_UPDATE_DATA } from 'src/constants/notifications';

//components
import ChatIcon from 'src/components/icons/ChatIcon.vue';
import BookIcon from 'src/components/icons/BookIcon.vue';
import EditIcon from 'src/components/icons/EditIcon.vue';
import HelpIcon from 'src/components/icons/HelpIcon.vue';
import AiplanVersion from 'src/components/AiplanVersion.vue';
import FeedbackDialog from 'src/components/dialogs/FeedbackDialog.vue';
import AiplanHelpDialog from 'src/components/dialogs/AiplanHelp/AiplanHelpDialog.vue';
import ExpansionItem from '../ExpansionItem.vue';
import ReleaseNotePreviewDialog from 'components/dialogs/ReleaseNotePreviewDialog.vue';

// stores
const { setNotificationView } = useNotificationStore();

// dialog vars
const isHelpOpen = ref(false);
const isFeedbackOpen = ref(false);
const isReleaseOpen = ref(false);

// functions
const onSuccess = (msg?: string) => {
  setNotificationView({
    open: true,
    type: 'success',
    customMessage: msg ?? SUCCESS_UPDATE_DATA,
  });
};
</script>
