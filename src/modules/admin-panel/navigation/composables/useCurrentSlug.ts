import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import { BASE_PATH, INIT_SLUG } from '../config';

export function useCurrentSlug() {
  const router = useRouter();
  const route = useRoute();
  const currentSlug = computed(() => route.path.split('/').pop() || '');

  if (!currentSlug.value || `/${currentSlug.value}` === BASE_PATH)
    router.push(`${BASE_PATH}/${INIT_SLUG}`);

  return { currentSlug };
}
