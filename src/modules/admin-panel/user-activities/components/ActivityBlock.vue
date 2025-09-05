<template>
  <li class="q-my-sm">
    <div class="relative q-pb-xs">
      <div class="activity-string">
        <UserAvatar :actor_detail="activity.actor_detail" />

        <UserNameAndCreatedAt :activity="activity">
          {{ verb[activity.verb] }} пространство
          <span v-if="isDeleted">
            "{{
              activity.verb === 'deleted'
                ? activity.old_value
                : activity.new_value
            }}"
          </span>
          <router-link v-else :to="`/${activity?.new_entity_detail?.slug}`">
            "{{ activity?.new_entity_detail?.name }}"
          </router-link>
        </UserNameAndCreatedAt>
      </div>
    </div>
  </li>
</template>

<script setup lang="ts">
import { IActivity } from '../interfaces/type';
import UserAvatar from '../ui/UserAvatar.vue';
import UserNameAndCreatedAt from '../ui/UserNameAndCreatedAt.vue';

const props = defineProps<{ activity: IActivity }>();

const verb = { created: 'создал(-а)', deleted: 'удалил(-а)' };

const isDeleted =
  props.activity.verb === 'deleted' || !props.activity.new_entity_detail;
</script>

<style scoped lang="scss">
.activity-string {
  display: flex;
  position: relative;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
  align-items: center;
}

ul,
li {
  list-style-type: none;
}

a {
  color: #3f76ff;
  text-decoration: none;
  font-weight: 400;
}
</style>
