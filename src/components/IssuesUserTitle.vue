<template>
  <div class="row col no-wrap full-w items-center">
    <div v-if="user !== undefined && user !== null">
      <AvatarImage
        :key="user?.name"
        :tooltip="avatarText(user).join(' ')"
        :text="
          [avatarText(user)[0].at(0), avatarText(user)[1]?.at(0)].join(' ')
        "
        :image="user?.avatar_id"
        :size="'26px'"
        :btnsize="'10px'"
        :member="user"
      />
    </div>
    <div
      v-if="user !== undefined && user !== null"
      style="max-width: calc(100% - 60px); text-align: left"
    >
      <div
        class="col-2 q-table-sub-title word-wrap"
        :style="{ paddingLeft: '10px' }"
      >
        {{ user?.first_name }} {{ user?.last_name }}
      </div>
    </div>
    <div v-else style="max-width: calc(100% - 60px); text-align: left">
      <div class="col-2 q-table-sub-title word-wrap">
        {{ placeholder }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import AvatarImage from './AvatarImage.vue';
import aiplan from 'src/utils/aiplan';

export default defineComponent({
  name: 'IssuesUserTitle',
  props: ['user', 'count', 'placeholder'],
  emits: ['click'],
  setup() {
    return {
      avatarText: aiplan.UserName,
    };
  },
  components: {
    AvatarImage,
  },
});
</script>
