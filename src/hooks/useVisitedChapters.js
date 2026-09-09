import { useCallback, useEffect, useRef, useState } from 'react'
import { decodeVisited, normalizeVisited, readVisited, saveVisited, VISITED_KEY } from '../data/visitedChapters.js'

function browserStorage() {
  try { return window.localStorage } catch { return null }
}

export default function useVisitedChapters() {
  const [visited, setVisited] = useState(() => readVisited(browserStorage()))
  const currentRef = useRef(visited)

  const markVisited = useCallback((id) => {
    const storage = browserStorage()
    const next = normalizeVisited([...currentRef.current, ...readVisited(storage), id])
    currentRef.current = next
    setVisited(next)
    saveVisited(storage, next)
  }, [])

  useEffect(() => {
    const sync = (event) => {
      if (event.storageArea !== browserStorage() || (event.key !== VISITED_KEY && event.key !== null)) return
      const next = decodeVisited(event.newValue)
      currentRef.current = next
      setVisited(next)
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  return { visited, markVisited }
}
