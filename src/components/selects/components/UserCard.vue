<template>
  <q-item style="padding: 0px !important">
    <q-item-section class="q-pa-xs q-pr-none" avatar>
      <AvatarImage
        :tooltip="memberFullName(member)"
        :text="memberAbbreviation(member)"
        :image="member?.avatar_id"
        :member="member"
      ></AvatarImage>
    </q-item-section>
    <q-item-section class="q-py-xs q-pl-none q-pr-xs">
      <q-item-label>{{ memberFullName(member) }}</q-item-label>
    </q-item-section>
  </q-item>
</template>

<script setup lang="ts">
import AvatarImage from 'src/components/AvatarImage.vue';
import aiplan from 'src/utils/aiplan';
import { DtoUserLight } from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { memberFullName } from '../helpers/helpers';

defineProps<{
  member: DtoUserLight;
}>();

const memberAbbreviation = (member: DtoUserLight) => {
  return [
    aiplan.UserName(member)[0]?.at(0),
    aiplan.UserName(member)[1]?.at(0),
  ].join(' ');
};
</script>
