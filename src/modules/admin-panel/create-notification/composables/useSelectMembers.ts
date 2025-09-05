import { ref } from 'vue';
import { debounce } from 'quasar';

import { api } from '../../services/api';

import { useAsyncDataWithLoadOnMounted } from '../../composables/useAsyncDataWithLoadOnMounted';

const LIMIT = 10;

export function useSelectMembers() {
  const searchQuery = ref('');

  const {
    loading,
    data: users,
    execute,
  } = useAsyncDataWithLoadOnMounted(api.getAllUsers, { result: [] }, [
    {
      limit: LIMIT,
      search_query: searchQuery.value,
    },
  ]);

  const getMembers = () => {
    execute([{ limit: LIMIT, search_query: searchQuery.value }]);
  };

  const handleSearchMembers = debounce(async (search?: string) => {
    console.log(search);
    users.value.result = [];
    searchQuery.value = search ?? '';
    getMembers();
  }, 800);

  const resetPagination = () => {
    console.log('вызвался reset');
    searchQuery.value = '';
    users.value.result = [];
    getMembers();
  };

  return {
    loading,
    users,
    getMembers,
    handleSearchMembers,
    resetPagination,
  };
}
