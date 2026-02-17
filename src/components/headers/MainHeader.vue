<template>
  <q-header
    style="z-index: 1000"
    :style="utilsStore.ny === true ? 'background-color: transparent' : ''"
  >
    <q-toolbar
      :style="utilsStore.ny === true ? 'margin-bottom: 20px' : ''"
      class="header text-grey-9 main-toolbar"
    >
      <q-btn flat dense round aria-label="Menu" @click="$emit('toggle')">
        <MenuIcon />
      </q-btn>
      <template v-if="workspaceInfo">
        <q-breadcrumbs
          active-color="grey-9"
          style="font-size: 14px; font-weight: 800; overflow-x: auto"
          class="q-ml-md"
        >
          <div
            v-if="Screen.width < 600 && breadCrumbsHistory.length >= 2"
            style="cursor: pointer"
            @click="
              breadCrumbsHistory[breadCrumbsHistory.length - 2]?.type !==
              'workspace'
                ? $router.push(
                    breadCrumbsHistory[breadCrumbsHistory.length - 2]?.url,
                  )
                : ''
            "
          >
            ... /
          </div>
          <q-breadcrumbs-el
            v-for="(crumb, index) in Screen.width > 600
              ? breadCrumbsHistory
              : [breadCrumbsHistory[breadCrumbsHistory.length - 1]]"
            :key="index"
            :to="crumb?.url"
          >
            <HomeIcon
              v-if="!workspaceInfo?.logo && crumb?.type === 'workspace'"
              class="q-mr-xs"
              :width="20"
              :height="20"
            />

            <q-icon
              v-if="crumb?.icon === 'settings'"
              name="settings"
              class="q-mr-xs"
            ></q-icon>

            <UserIcon
              v-else-if="!crumb?.icon && crumb?.type === 'profile'"
              class="q-mr-xs"
              :width="20"
              :height="20"
            />

            <AIDocIcon
              class="q-mr-xs"
              :width="18"
              :height="18"
              v-else-if="!crumb?.icon && crumb?.type === 'aidoc'"
            />

            <div
              v-else-if="crumb?.icon && crumb?.type === 'project'"
              class="q-mr-xs"
            >
              <q-img
                v-if="crumb?.logo"
                :src="getUrlFile(crumb?.logo)"
                :style="`width: 20px; height: 20px; border-radius: 4px; color: white;`"
              />
              <div v-else>{{ crumb?.icon }}</div>
            </div>
            <q-img
              v-else-if="crumb?.icon"
              :src="crumb?.icon"
              :style="'width: 18px; height: 18px; margin: 0 4px 0 0; border-radius: 4px; color: white'"
              spinner-size="18px"
            ></q-img>

            <span
              v-show="crumb?.name"
              :style="`max-width: calc((100vw - ${
                Screen.width > 1019 ? 670 : Screen.width > 600 ? 400 : 250
              }px) / ${
                Screen.width > 600 ? breadCrumbsHistory.length : 1
              }) !important`"
              class="breadcrumbs-title"
            >
              {{ crumb?.name }}
            </span>
          </q-breadcrumbs-el>
        </q-breadcrumbs>

        <q-space />
      </template>

      <q-toolbar-title v-else>АИПлан</q-toolbar-title>
      <SearchPanel />
    </q-toolbar>
  </q-header>
</template>

<script lang="ts" setup>
// core
import { Screen } from 'quasar';
import { storeToRefs } from 'pinia';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

// stores
import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';
import { useProjectStore } from 'src/stores/project-store';
import { useWorkspaceStore } from 'src/stores/workspace-store';
import { useSingleIssueStore } from 'src/stores/single-issue-store';
import { useAiDocStore } from 'src/stores/aidoc-store';
import { useSprintStore } from 'src/modules/sprints/stores/sprint-store';

import { getUrlFile } from 'src/utils/helpers';

// components
import UserIcon from 'src/components/icons/UserIcon.vue';
import SearchPanel from 'src/components/search-panel/SearchPanel.vue';
import HomeIcon from 'src/components/icons/HomeIcon.vue';
import MenuIcon from 'src/components/icons/MenuIcon.vue';
import AIDocIcon from 'src/components/icons/AIDocIcon.vue';

// stores
const userStore = useUserStore();
const utilsStore = useUtilsStore();
const projectStore = useProjectStore();
const workspaceStore = useWorkspaceStore();
const singleIssueStore = useSingleIssueStore();
const aidocStore = useAiDocStore();
const sprintStore = useSprintStore();

// store to refs
const { issueData, currentIssueID } = storeToRefs(singleIssueStore);
const { user } = storeToRefs(userStore);
const { project } = storeToRefs(projectStore);
const { workspaceInfo } = storeToRefs(workspaceStore);
const { selectedDocTitle } = storeToRefs(aidocStore);
const { sprint } = storeToRefs(sprintStore);

// vars
const route = useRoute();

const breadCrumbsHistory = computed(() => {
  let currentPath = route?.fullPath
    .split('/')
    .filter((path) => !['', 'projects', 'issues'].includes(path));
  let existPath = [];
  existPath[0] = {
    icon: workspaceInfo.value?.logo
      ? `/api/auth/file/${workspaceInfo.value?.logo}`
      : '',
    name: workspaceInfo.value?.name,
    url: `/${workspaceInfo.value?.slug}`,
    type: 'workspace',
  };

  if (currentPath[1] === 'settings')
    existPath[1] = {
      icon: 'settings',
      name: 'Настройки',
      url: `/${workspaceInfo.value.slug}/settings`,
      type: 'settings',
    };
  else if (currentPath[1] === 'aidoc')
    existPath[1] = {
      name: 'АИДок',
      url: `/${workspaceInfo.value.slug}/aidoc`,
      type: 'aidoc',
    };
  else if (currentPath[1] === 'sprints') {
    existPath[1] = {
      name: `${sprint.value?.name || ''}`,
      url: `/${workspaceInfo.value?.slug}/sprints/${sprint.value?.id}`,
      type: 'sprint',
    };
  } else if (project.value)
    existPath[1] = {
      icon: `${
        project.value?.emoji
          ? String.fromCodePoint(
              parseInt(project.value?.emoji?.value ?? project.value?.emoji),
            )
          : ''
      }`,
      logo: project.value?.logo,
      name: ` ${project.value?.name ?? ''}`,
      url: `/${workspaceInfo.value?.slug}/projects/${project.value?.identifier || project.value?.id}/issues`,
      type: 'project',
    };
  else if (user.value && currentPath.includes('profile'))
    existPath[1] = {
      icon: user.value?.avatar,
      name: 'Профиль',
      type: 'profile',
    };

  if (currentPath[2] === 'settings')
    existPath[2] = {
      icon: 'settings',
      name: 'Настройки',
      url: `/${workspaceInfo.value.slug}/projects/${project.value?.id}/settings`,
      type: 'settings',
    };
  else if (currentIssueID.value) {
    if (issueData.value?.parent_detail) {
      existPath[2] = {
        name: `${
          issueData.value?.project_detail.identifier && currentIssueID.value
            ? issueData.value?.project_detail.identifier +
              '-' +
              issueData.value?.parent_detail.sequence_id
            : ''
        } `,
        url: `/${workspaceInfo.value.slug}/projects/${project.value?.identifier || project.value?.id}/issues/${issueData.value?.parent_detail.sequence_id}`,

        type: 'issue',
      };
      existPath[3] = {
        name: `${
          issueData.value?.project_detail.identifier && currentIssueID.value
            ? issueData.value?.project_detail.identifier +
              '-' +
              issueData.value?.sequence_id
            : ''
        } `,

        type: 'issue',
      };
    } else
      existPath[2] = {
        name: `${
          issueData.value?.project_detail.identifier && currentIssueID.value
            ? issueData.value?.project_detail.identifier +
              '-' +
              issueData.value?.sequence_id
            : ''
        } `,
        type: 'issue',
      };
  } else if (currentPath[1] === 'aidoc' && currentPath[2]) {
    existPath[2] = {
      name: `${selectedDocTitle.value || 'Документ'}`,
      type: 'document',
    };
  }
  return existPath;
});
</script>

<style lang="scss">
.breadcrumbs-title {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}
</style>
