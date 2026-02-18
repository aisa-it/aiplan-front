<template>
  <div class="analytics-card sub-text">
    <div v-if="card.title" class="analytics-card__head abbriviated-text">{{ card.title }}</div>
    <div class="analytics-card__info">
      <div v-for="item in card.data">
        <span class="analytics-card__info-count">{{ item.count }}</span>
        <span>{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ card: IAnalyticsCard }>();
</script>

<style scoped lang="scss">
.analytics-card {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: 8px;
  width: 260px;
  max-height: 72px;
  height: 100%;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid var(--dark-border-color);
  color: var(--text-color);

  &__head {
    font-weight: 600;
  }

  &__info {
    display: flex;
    gap: 8px;

    &-count {
      font-weight: 600;
      margin-right: 4px;
    }
  }
}
</style>
