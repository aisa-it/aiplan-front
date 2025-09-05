<template>
  <div :style="'flex: 1 1 0%; margin-top: 8px '">
    <div class="pre-wrap">
      <span style="font-weight: 600">
        {{ activity.actor_detail.last_name }}
        {{ ' ' + activity.actor_detail.first_name + ' ' }}
      </span>

      <slot />

      <br />
      <span
        :style="'white-space: nowrap; font-size: 0.75rem; line-height: 1rem;'"
        >{{ ' ' }}
        {{
          formatDate(new Date()) === formatDate(activity.created_at)
            ? timeAgo(activity.created_at).toLowerCase()
            : formatDateTime(activity.created_at)
        }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { timeAgo, formatDate, formatDateTime } from 'src/utils/time';
import { IActivity } from '../interfaces/type';

//TODO обновить тип, когда будет контракт
defineProps<{ activity: IActivity }>();
</script>

<style scoped lang="scss">
.pre-wrap {
  word-break: break-all;
}
</style>
