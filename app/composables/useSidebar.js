import { ref } from 'vue';

const isCollapsed = ref(false);

export function useSidebar() {
  return { isCollapsed };
}
