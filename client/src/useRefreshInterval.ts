import { ref, watch } from 'vue'

const STORAGE_KEY = 'g-tools-refresh-interval'
const DEFAULT_INTERVAL = 30

const saved = localStorage.getItem(STORAGE_KEY)
const interval = ref(saved ? Number(saved) : DEFAULT_INTERVAL)

watch(interval, (val) => {
  localStorage.setItem(STORAGE_KEY, String(val))
})

export function useRefreshInterval() {
  return interval
}
