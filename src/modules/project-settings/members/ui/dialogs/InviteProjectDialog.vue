<template>
  <q-dialog @show="setUninvitedPeople()" @hide="resetDialog">
    <q-card class="modal-card" v-if="uninvitedPeople !== undefined">
      <q-card-section class="column q-pt-none">
        <h6 class="q-ma-md">Приглашение пользователя</h6>
        <q-select
          dense
          :options="uninvitedPeople"
          :model-value="personToInvite"
          label="Пользователь"
          class="base-selector q-pb-md q-pt-none"
          popup-content-class="inh-popup scrollable-content"
          use-input
          transition-show="scale"
          transition-hide="scale"
          fill-input
          hide-selected
          input-debounce="300"
          @filter="filterUninvitedPeople"
          @update:model-value="(val) => setNewValueUser(val)"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section> Нет пользователей </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select
          dense
          v-model="role"
          class="base-selector"
          :options="ROLES"
          label="Роль"
          :disable="personToInviteSuper"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          no-caps
          label="Отменить"
          class="secondary-btn"
          style="width: 115px"
          v-close-popup
        />
        <q-btn
          no-caps
          label="Пригласить"
          class="primary-btn"
          style="width: 115px"
          :disable="!personToInvite"
          @click="handleInviteToProject"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// core
import { storeToRefs } from 'pinia';
import { ref } from 'vue';

// stores
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';

// constants
import { ROLES } from 'src/constants/constants';

// utils
import { filterAvailableMembers } from 'src/utils/filters';

// interfaces
import {
  DtoProjectMemberLight,
  DtoWorkspaceMember,
} from '@aisa-it/aiplan-api-ts/src/data-contracts';
import { ISelect } from 'src/interfaces/ui';
import { QSelect } from 'quasar';

// services
import { inviteMemberToProject } from '../../services/api';

const props = defineProps<{
  workspaceMembers: DtoWorkspaceMember[];
  projectMembers: DtoProjectMemberLight[];
  isSuperuser: boolean;
  userId?: string;
}>();
const emits = defineEmits<{ success: []; error: [] }>();

// stores
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();

// stores to ref
const { currentProjectID } = storeToRefs(projectStore);
const { currentWorkspaceSlug } = storeToRefs(workspaceStore);

// vars
const role = ref(ROLES[0]);
const personToInvite = ref<ISelect>();
const uninvitedPeople = ref<ISelect[]>();
const originalUninvitedPeople = ref<ISelect[]>([]);
const people = ref<DtoWorkspaceMember[]>([...props.workspaceMembers]);
const project_members = ref<DtoProjectMemberLight[]>([...props.projectMembers]);
const personToInviteSuper = ref(false);

const setNewValueUser = (val: ISelect) => {
  if (props.isSuperuser && val.value === props.userId) {
    personToInviteSuper.value = true;
    role.value = ROLES[2];
  } else {
    personToInviteSuper.value = false;
  }
  personToInvite.value = val;
};

function setUninvitedPeople() {
  let filteredMembers = filterAvailableMembers(props.workspaceMembers);
  originalUninvitedPeople.value = filteredMembers
    ?.filter(
      (person) =>
        !props.projectMembers?.find(
          (member) => member.member?.email === person.member?.email,
        ),
    )
    .map((element) => ({
      label:
        `${element.member?.first_name} ${element.member?.last_name} (${element.member?.email})`.trim(),
      value: element.member_id,
    }));
  personToInvite.value = undefined;
  uninvitedPeople.value = [...originalUninvitedPeople.value];
  people.value = [...props.workspaceMembers];
  project_members.value = [...props.projectMembers];

  if (people.value === undefined) return;

  let notInvitedYet = people.value?.filter((person) => {
    const isInvited = project_members.value?.find(
      (member: DtoProjectMemberLight) =>
        member.member?.email === person.member?.email,
    );
    return !isInvited;
  });

  notInvitedYet.forEach((element: DtoProjectMemberLight) => {
    uninvitedPeople.value?.push({
      label: `${element.member?.first_name} ${element.member?.last_name} ${element.member?.email}`,
      value: element.member_id,
    });
  });
}

const resetDialog = () => {
  personToInvite.value = undefined;
  role.value = ROLES[0];
};

const filterUninvitedPeople = (
  val: string,
  update: (callbackFn: () => void, afterFn?: (ref: QSelect) => void) => void,
) => {
  if (val === '') {
    update(() => {
      uninvitedPeople.value = [...originalUninvitedPeople.value];
    });
  } else {
    const lowerCaseValue = val.toLowerCase();
    update(async () => {
      const data = await workspaceStore
        .getWorkspaceMembersByQuery(currentWorkspaceSlug.value as string, {
          search_query: lowerCaseValue,
        })
        .then((res) => res.result)
        .catch(() => []);

      const projectMembersIds =
        props.projectMembers?.map(
          (members: DtoProjectMemberLight) => members.member_id,
        ) || [];
      let filteredMembers = filterAvailableMembers(data);
      filteredMembers = filteredMembers.filter(
        (member: DtoWorkspaceMember) =>
          !projectMembersIds.includes(member.member_id),
      );

      uninvitedPeople.value = filteredMembers.map(
        (element: DtoWorkspaceMember) => ({
          label:
            `${element.member?.first_name} ${element.member?.last_name} (${element.member?.email})`.trim(),
          value: element.member_id,
        }),
      );
    });
  }
  update(() => true);
};

const handleInviteToProject = async () => {
  await inviteMemberToProject(
    currentWorkspaceSlug.value as string,
    currentProjectID.value,
    {
      role: role.value.value,
      member_id: personToInvite.value?.value as string,
    },
  )
    .then(() => emits('success'))
    .catch(() => emits('error'));
};
</script>

<style lang="scss">
.q-dialog__inner--top,
.q-dialog__inner--bottom {
  bottom: 0 !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  align-items: center !important;
}
</style>
