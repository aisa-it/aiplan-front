<template>
  <div
    ref="root"
    class="week-grid__event"
    :class="{
      darken: issueIdHighlight && issueIdHighlight !== event.issueData.id,
    }"
    :style="{ backgroundColor: event.color }"
    @mouseenter="open"
    @mouseleave="scheduleClose"
    @dblclick="openIssue"
  >
    {{ event.issueData.identifier }}-{{ event.issueData.sequence_id }}
    {{ event.issueData.title }}

    <q-menu
      ref="menu"
      anchor="bottom left"
      self="top left"
      :offset="[0, 15]"
      no-parent-event
      persistent
    >
      <EventCard
        :event="event"
        @mouseenter="cancelClose"
        @mouseleave="close"
        @status-popup="(val) => (isStatusPopupOpen = val)"
      />
    </q-menu>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { CalendarEvent } from '../../types/calendar';
import EventCard from './EventCard.vue';

import { useCalendarEventStore } from '../../store/calendar-event-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useUserStore } from 'src/stores/user-store';
import { storeToRefs } from 'pinia';

const props = defineProps<{ event: CalendarEvent }>();

const root = ref<HTMLElement | null>(null);

const { issueIdHighlight } = storeToRefs(useCalendarEventStore());
const { user } = storeToRefs(useUserStore());
const singleIssueStore = useSingleIssueStore();

defineExpose({
  el: root,
});

const menu = ref<any>();
const isStatusPopupOpen = ref(false);
let closeTimer: number | null = null;

function open() {
  cancelClose();
  menu.value?.show(root.value);
  issueIdHighlight.value = props.event.issueData.id;
}

function scheduleClose() {
  if (isStatusPopupOpen.value) return;
  issueIdHighlight.value = null;
  closeTimer = window.setTimeout(() => {
    menu.value?.hide();
  }, 120);
}

function cancelClose() {
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
}

function close() {
  if (isStatusPopupOpen.value) return;
  issueIdHighlight.value = null;
  cancelClose();
  menu.value?.hide();
}

async function openIssue() {
  singleIssueStore.openIssue(
    props.event.issueData.id,
    user.value.theme?.open_in_new ? '_blank' : '_self',
    props.event.issueData.identifier,
  );
}
</script>

<style lang="scss" scoped>
.week-grid__event {
  padding: 5px 4px;
  border-radius: 16px;
  color: white;
  line-height: 22px;
  word-wrap: break-word;
  min-width: 0;
  overflow-wrap: anywhere;
  user-select: none;
}

.week-grid__event:hover {
  cursor: pointer;
}

.darken {
  filter: brightness(0.6);
  transition: 0.3s ease;
}
</style>
