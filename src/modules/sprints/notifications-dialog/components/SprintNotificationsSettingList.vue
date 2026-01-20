<template>
  <q-card class="setting-card">
    <div class="sub-text q-ml-sm q-my-sm"><slot name="subtitle" /></div>

    <div class="notification-header">
      <div style="font-size: 14px; font-weight: 600">Название</div>
      <span style="text-align: center">Автор</span>
      <span style="text-align: center">Наблюдатель</span>
    </div>

    <div class="notification-list">
      <div class="notification-setting">
        <span class="centered-horisontally">Все</span>
        <q-checkbox
          class="justify-center"
          :model-value="isAllEnabled(authorSettings)"
          @update:model-value="(v) => setAll(authorSettings, v)"
        />
        <q-checkbox
          class="justify-center"
          :model-value="isAllEnabled(memberSettings)"
          @update:model-value="(v) => setAll(memberSettings, v)"
        />
      </div>

      <div
        class="notification-setting"
        v-for="s in settingsList"
        :key="s.field"
      >
        <span>{{ s.title }}</span>
        <q-checkbox
          class="justify-center"
          :model-value="!authorSettings?.[s.field]"
          @update:model-value="(v) => (authorSettings[s.field] = !v)"
        />
        <q-checkbox
          class="justify-center"
          :model-value="!memberSettings?.[s.field]"
          @update:model-value="(v) => (memberSettings[s.field] = !v)"
        />
      </div>
    </div>
  </q-card>
</template>

<script setup lang="ts">
const props = defineProps<{
  settingsList: any[];
  authorSettings: any;
  memberSettings: any;
}>();

const isAllEnabled = (channelSettings: any) =>
  props.settingsList.every((s) => !channelSettings?.[s.field]);

const setAll = (channelSettings: any, enabled: boolean) => {
  props.settingsList.forEach((s) => {
    channelSettings[s.field] = !enabled;
  });
};
</script>

<style scoped lang="scss">
.notification-list {
  max-height: calc(100vh - 420px);
  overflow-y: auto;
  padding: 0px 8px;
  @media screen and (max-width: 480px) {
    max-height: 30vh;
  }
}

.setting-card {
  box-shadow: none;
}

.notification-header {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  padding: 0px 8px;
}

.notification-setting {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr;
  align-items: center;
  margin-bottom: 8px;
}
</style>

