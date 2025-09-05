import { computed, Ref, ref } from 'vue';
import lunr from 'lunr';
import type { Index } from 'lunr';
import stemmerSupport from 'lunr-languages/lunr.stemmer.support';
import ru from 'lunr-languages/lunr.ru';

stemmerSupport(lunr);
ru(lunr);

import { useUtilsStore } from 'src/stores/utils-store';
import { IHelpPage } from 'src/interfaces/help';

const utilsStore = useUtilsStore();

export const useSearchTokens = (helpPages: Ref<IHelpPage[]>) => {
  const searchQuery = ref('');
  const idx = ref<Index | null>(null);

  async function loadIndex() {
    if (idx.value) return;

    const data = await fetch(
      `/api/docs/tokens.json?v=${utilsStore.version}`,
    ).then((res) => res.json());

    idx.value = lunr.Index.load(data);
  }

  const findedPages = computed(() => {
    if (!idx.value || !searchQuery.value.trim()) return [];
    return idx.value.search(searchQuery.value);
  });

  const filteredPages = computed(() => {
    if (!idx.value || !searchQuery.value.trim()) return helpPages.value;

    const result: IHelpPage[] = [];

    const collectMatches = (pages: IHelpPage[]) => {
      for (const page of pages) {
        const findedPage = findedPages.value.find(
          (r) => r.ref === page.full_path.split('/api/docs/')[1],
        );

        if (findedPage) {
          result.push({ ...page, sub_pages: [], score: findedPage.score });
        }

        if (page.sub_pages && page.sub_pages.length) {
          collectMatches(page.sub_pages);
        }
      }
    };

    collectMatches(helpPages.value);

    result.sort((a, b) =>
      b.score !== a.score
        ? (b.score ?? 0) - (a.score ?? 0)
        : a.title.localeCompare(b.title, 'ru'),
    );

    return result;
  });

  return {
    searchQuery,
    filteredPages,
    loadIndex,
  };
};
