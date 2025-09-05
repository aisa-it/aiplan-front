<template>
  <div>
    <div class="relative q-px-sm">
      <div class="q-mt-sm">
        <div class="ring">
          <AvatarImage
            style="padding: 0 !important; border-radius: 30px !important"
            :border="false"
            :member="actor_detail"
            :text="
              [
                aiplan.UserName(actor_detail)[0]?.at(0),
                aiplan.UserName(actor_detail)[1]?.at(0),
              ].join(' ')
            "
            :image="actor_detail.avatar_id ?? undefined"
            size="32px"
            @click="$emit('clickOnAvatar')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import aiplan from 'src/utils/aiplan';
import AvatarImage from 'src/components/AvatarImage.vue';
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';

defineProps<{ actor_detail: DtoUserLight }>();
defineEmits<{ clickOnAvatar: [] }>();
</script>

<style scoped lang="scss">
.ring {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 9999px;
  --ring-color: #ffffff;
}
</style>
