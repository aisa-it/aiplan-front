<template>
  <div>
    <h6>Авторизация</h6>
    <q-form
      v-if="!loading"
      class="jira-auth-wrapper"
      @submit="handleGetInfo"
      ref="formRef"
    >
      <div class="jira-auth">
        <div style="width: 100%" class="q-mr-sm">
          <q-input
            v-model="authForm.jira_url"
            class="base-input q-mb-sm"
            label="Домен Jira"
            :rules="[
              (val) =>
                (val && val.length > 0) ||
                'Введите домен, например: https://domain.com/',
            ]"
            :hint="`Например: 'https://domain.com/'`"
            dense
          >
          </q-input>
          <q-input
            v-model="authForm.username"
            class="base-input q-mb-sm"
            label="Логин"
            :rules="[(val) => (val && val.length > 0) || 'Введите логин']"
            dense
          >
          </q-input>
          <q-input
            v-model="authForm.token"
            class="base-input q-mb-sm"
            label="API токен или пароль"
            :type="!isTokenShown ? 'password' : 'text'"
            :rules="[
              (val) => (val && val.length > 0) || 'Введите пароль или токен',
            ]"
            dense
          >
            <template v-slot:append>
              <q-icon
                :name="!isTokenShown ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isTokenShown = !isTokenShown"
              />
            </template>
          </q-input>
        </div>
        <ImportJiraHistory />
      </div>
      <q-btn no-caps class="primary-btn self-end" type="submit"> Далее </q-btn>
    </q-form>
    <q-inner-loading v-else showing color="primary" />
  </div>
</template>

<script lang="ts" setup>
// core
import { storeToRefs } from 'pinia';
import { ref, onMounted, onUnmounted } from 'vue';
// stores
import { useImportStore } from 'src/modules/import-jira/stores/import-store';
// components
import ImportJiraHistory from '../import-jira-history/ImportJiraHistory.vue';
// interfaces
import { AiplanJiraInfoRequest } from '@aisa-it/aiplan-api-ts/src/data-contracts';

// emits
const emits = defineEmits(['next']);

//stores
const importStore = useImportStore();

//storesToRefs
const { userImports } = storeToRefs(importStore);

//state
const refreshInterval = ref();
const formRef = ref();
const loading = ref(true);
const isTokenShown = ref(false);
const authForm = ref<
  Pick<AiplanJiraInfoRequest, 'jira_url' | 'username' | 'token'>
>({
  jira_url: importStore.userInfo?.jira_url ?? '',
  username: importStore.userInfo?.username ?? '',
  token: importStore.userInfo?.token ?? '',
});

//methods
const intervalRefresh = () => {
  clearInterval(refreshInterval.value);

  refreshInterval.value = setInterval(() => {
    importStore.getImportsInfo();

    if (!userImports.value?.find((i: any) => i?.finished === false))
      clearInterval(refreshInterval.value);
  }, 1000);
};

const handleGetInfo = async () => {
  loading.value = true;
  await importStore
    .getJiraInfo(authForm.value)
    .then(() => {
      emits('next');
    })

    .finally(() => {
      loading.value = false;
    });
};

//lyfecycle hooks
onMounted(async () => {
  await importStore.getImportsInfo().then(() => {
    loading.value = false;
  });
  if (userImports.value?.find((i: any) => i?.finished === false))
    intervalRefresh();
});

onUnmounted(() => clearInterval(refreshInterval.value));
</script>

<style scoped lang="scss">
.jira-auth-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.jira-auth {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

@media screen and (max-width: 1010px) {
  .jira-auth {
    flex-direction: column;
  }
}
</style>
