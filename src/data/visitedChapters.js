export const VISITED_KEY = 'blanca.visited-chapters.v1'

export function normalizeVisited(ids) {
  if (!Array.isArray(ids)) return []
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id >= 1 && id <= 23))].sort((a, b) => a - b)
}

export function decodeVisited(value) {
  try {
    const data = JSON.parse(value)
    return data?.version === 1 ? normalizeVisited(data.chapters) : []
  } catch {
    return []
  }
}

export function readVisited(storage) {
  try { return decodeVisited(storage?.getItem(VISITED_KEY)) } catch { return [] }
}

export function saveVisited(storage, chapters) {
  try {
    storage?.setItem(VISITED_KEY, JSON.stringify({ version: 1, chapters: normalizeVisited(chapters) }))
  } catch {
    // A private or full browser can still remember visits during this session.
  }
}
