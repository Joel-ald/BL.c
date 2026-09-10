export const FAIRY_KEY = import.meta.env?.DEV ? 'blanca-fairy-nine-local-v4' : 'blanca-fairy-nine-v1'
export function nextFairyLetter(progress, index) {
  if (progress >= 6) return 6
  if (index === progress) return progress + 1
  return index === 0 ? 1 : progress
}
export function readFairyKey(storage) {
  try { return storage.getItem(FAIRY_KEY) === 'open' } catch { return false }
}
export function saveFairyKey(storage) {
  try { storage.setItem(FAIRY_KEY, 'open'); return true } catch { return false }
}
