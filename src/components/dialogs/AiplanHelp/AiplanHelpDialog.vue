<template>
  <q-dialog
    ref="dialogRef"
    @show="handleOpenDialog()"
    @hide="handleCloseDialog()"
  >
    <q-card class="help-wrapper">
      <q-layout view="hHh Lpr lff" container>
        <q-header>
          <q-toolbar style="padding: 0 6px 0 6px" class="header row">
            <div
              class="flex items-center justify-between no-wrap help-header"
              style="width: 100%"
            >
              <div class="flex items-center no-wrap">
                <q-btn
                  icon="menu"
                  aria-label="Menu"
                  class="btn-only-icon-sm q-mr-sm"
                  @click="leftDrawerOpen = !leftDrawerOpen"
                />
                <q-btn
                  class="btn-only-icon-sm"
                  @click="handleSwitchPage(selectedPage, 'previous')"
                >
                  <ArrowLeft />
                </q-btn>
                <q-btn
                  class="btn-only-icon-sm q-mr-sm"
                  @click="handleSwitchPage(selectedPage, 'next')"
                >
                  <ArrowRight />
                </q-btn>
                <span class="help-title">Руководство пользователя</span>
              </div>
              <q-btn class="btn-only-icon-sm" @click="dialogRef.hide()"
                ><CloseIcon
              /></q-btn>
            </div>
          </q-toolbar>
        </q-header>

        <q-drawer
          v-model="leftDrawerOpen"
          show-if-above
          :width="200"
          :breakpoint="780"
          bordered
          class="flex column no-wrap"
        >
          <SearchInput
            v-model="searchQuery"
            style="width: 200px"
            class="help-search"
          />
          <q-tree
            ref="refHelpPagesTree"
            :nodes="filteredPages"
            node-key="full_path"
            children-key="sub_pages"
            label-key="title"
            style="user-select: none"
            :class="{ 'q-ml-sm': !filteredPages.length }"
            :selected="selectedPage"
            @update:selected="(e) => getSelectedPage(e)"
          >
            <template v-slot:default-header="prop">
              <q-item
                class="q-pa-none"
                style="min-height: 0px"
                :active="prop.node.full_path === selectedPage"
              >
                {{ prop.node.title }}
              </q-item>
            </template>
          </q-tree>
        </q-drawer>

        <q-page-container
          class="row items-center justify-between"
          style="height: 90%"
        >
          <DefaultLoader
            v-if="loading"
            style="margin: auto; height: calc(85vh)"
          />
          <div
            v-else
            v-html="markdownContent"
            style="margin: 14px 20px 10px 20px; width: 100%"
            @click="handleClick"
          ></div>
        </q-page-container>
      </q-layout>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { marked } from 'marked';

import { useUserStore } from 'src/stores/user-store';
import { useUtilsStore } from 'src/stores/utils-store';

import CloseIcon from 'src/components/icons/CloseIcon.vue';
import ArrowLeft from 'src/components/icons/ArrowLeft.vue';
import ArrowRight from 'src/components/icons/ArrowRight.vue';
import DefaultLoader from 'components/loaders/DefaultLoader.vue';
import SearchInput from 'src/components/SearchInput.vue';

import { IHelpPage } from 'src/interfaces/help';
import { useSearchTokens } from './composables/useSearchTokens';

const userStore = useUserStore();
const utilsStore = useUtilsStore();

const loading = ref(true);
const leftDrawerOpen = ref(true);

const dialogRef = ref();
const refHelpPagesTree = ref();

const helpPages = ref<IHelpPage[]>([]);
const selectedPage = ref('');
const markdownContent = ref('');
const flattenNodes = ref<IHelpPage[]>([]);

const { searchQuery, filteredPages, loadIndex } = useSearchTokens(helpPages);

const getSelectedPage = async (url: string) => {
  if (!url) return;
  loading.value = true;
  selectedPage.value = url;
  utilsStore
    .getSelectedPage('/api/' + url.split('/api/')[1])
    .then(({ data }) => {
      let markdown = data;

      markdown = markdown.replace(
        /!\[(.*?)\]\((.*?)\/(.*?)\)/g,
        (match: string, title: string, dir: string, filename: string) => {
          return `![${title}](${
            import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : ''
          }/api/docs/${filename.replace('imgs/', `${userStore.getTheme}/`)})`;
        },
      );

      markdownContent.value = marked(markdown)
        .replace('<pre>', '<p>')
        .replace('<pre/>', '<p/>')
        .replaceAll(
          /(<table[^>]*>)([\s\S]*?)(<\/table>)/g,
          "<div class='help-wrapper__table-wrapper'>$1$2$3</div>",
        );
    })
    .finally(() => {
      loading.value = false;
    });
};

function flattenHelpPages(pages: any, result: any = []) {
  for (const page of pages) {
    const currentPage: any = { ...page };
    result.push(currentPage);

    if (page.sub_pages?.length > 0) {
      flattenHelpPages(page.sub_pages, result);
    }
  }
  return result;
}

const handleSwitchPage = async (fileUrl: string, direction: string) => {
  let currentIndex = flattenNodes.value.findIndex(
    (page: any) => page.full_path === fileUrl,
  );
  if (direction === 'next' && flattenNodes.value[currentIndex + 1]) {
    selectedPage.value = flattenNodes.value[currentIndex + 1]?.full_path;
  }
  if (direction === 'previous' && flattenNodes.value[currentIndex - 1]) {
    selectedPage.value = flattenNodes.value[currentIndex - 1].full_path;
  }
  refHelpPagesTree.value.setExpanded(selectedPage.value, true);
  await getSelectedPage(selectedPage.value);
};

const handleOpenDialog = async () => {
  const { data } = await utilsStore.getHelpPages();
  helpPages.value = data;
  flattenNodes.value = flattenHelpPages(data);

  await getSelectedPage(flattenNodes.value[0]?.full_path);

  loadIndex();
};

const handleCloseDialog = async () => {
  await getSelectedPage(flattenNodes.value[0]?.full_path);
};

const handleClick = (event: any) => {
  const target = event.target;
  if (target.tagName === 'A' && target.href.endsWith('.md')) {
    handleRouteToLink(event, target);
  } else if (
    target.tagName === 'STRONG' &&
    target.parentNode.tagName === 'A' &&
    target.parentNode.href.endsWith('.md')
  ) {
    handleRouteToLink(event, target.parentNode);
  }
};

const handleRouteToLink = async (event: any, target: any) => {
  event.preventDefault();
  let splittedLinkUrl = target.href?.split('/');
  let nextPage = findHelpPageByFileUrl(
    splittedLinkUrl[splittedLinkUrl?.length - 1],
    flattenNodes.value,
  );

  await getSelectedPage(nextPage?.full_path);
};

const findHelpPageByFileUrl = (
  fileName: string,
  pagesToSearch: IHelpPage[],
): any => {
  for (let i = 0; i < pagesToSearch?.length; i++) {
    const page = pagesToSearch[i];
    if (page.full_path.includes(fileName)) {
      return page;
    }
    if (page.sub_pages?.length > 0) {
      let childPage = findHelpPageByFileUrl(fileName, page.sub_pages);
      if (childPage) {
        return childPage;
      }
    }
  }
  return null;
};
</script>

<style scoped lang="scss">
.help-search {
  :deep(svg) {
    margin-left: 6px;
  }
}

.help-wrapper {
  min-width: calc(100vw - 425px) !important;
  max-width: 70vw;
  height: 90vh;
  display: flex;
  border-radius: $radius;

  :deep(code) {
    padding: 2px 4px;
    background-color: #ececef;
    border-radius: 0.25rem;
    line-height: 1.25rem;
  }

  :deep(table) {
    width: 100%;
    max-width: 100%;
    border-collapse: collapse;

    td,
    th {
      padding: 5px 8px;
      word-break: break-word;
      min-width: 100px;

      &:first-child {
        width: 10px;
        min-width: 10px;
        word-break: normal;
      }
    }
  }
}

.body--dark {
  .help-wrapper {
    :deep(code) {
      background-color: #4c4b51;
    }
  }
}

:deep(.active-class) {
  color: blue;
}

:deep(h1) {
  font-size: 32px;
  margin: 0;
  line-height: 1.5 !important;
}
:deep(h2) {
  font-size: 26px;
  margin: 0;
  line-height: 1.5 !important;
}
:deep(h3) {
  font-size: 22px;
  margin: 0;
  line-height: 1.5 !important;
}
:deep(h4) {
  font-size: 20px;
  margin: 0;
  line-height: 1.5 !important;
}
:deep(h5) {
  font-size: 18px;
  margin: 0;
  line-height: 1.5 !important;
}
:deep(h6) {
  font-size: 18px;
  margin: 0;
  line-height: 1.5 !important;
}

:deep(img) {
  max-width: 100%;
  height: auto;
}

.help-title {
  font-size: 24px;
}
@media screen and (max-width: 1000px) {
  .help-wrapper {
    min-width: calc(100vw - 125px) !important;
  }
  .help-title {
    font-size: 18px;
  }
}
@media screen and (max-width: 600px) {
  .help-wrapper {
    min-width: calc(100vw - 25px) !important;
  }
  .help-title {
    font-size: 18px;
  }

  @media screen and (max-width: 600px) {
    .help-title {
      font-size: 16px;
    }
    :deep(h1) {
      font-size: 22px;
      margin: 0;
      line-height: 1.5 !important;
    }
    :deep(h2) {
      font-size: 20px;
      margin: 0;
      line-height: 1.5 !important;
    }
    :deep(h3) {
      font-size: 18px;
      margin: 0;
      line-height: 1.5 !important;
    }
    :deep(h4) {
      font-size: 16px;
      margin: 0;
      line-height: 1.5 !important;
    }
    :deep(h5) {
      font-size: 16px;
      margin: 0;
      line-height: 1.5 !important;
    }
    :deep(h6) {
      font-size: 16px;
      margin: 0;
      line-height: 1.5 !important;
    }
  }
}

:deep(.q-layout-container > div > div) {
  scrollbar-width: none;
}
:deep(.absolute-full) {
  right: 0 !important;
}
::-webkit-scrollbar {
  display: none;
}
</style>
