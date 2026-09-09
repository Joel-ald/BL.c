import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { assessFrameRate, chooseQuality, createQualityTracker, QUALITY_LEVELS, QUALITY_PROFILES } from './quality.js'
import { QualityContext } from './useExperienceQuality.js'

export function ExperienceQualityProvider({ children }) {
  const [policy] = useState(() => {
    const previewTier = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('quality') : null
    if (QUALITY_LEVELS.includes(previewTier)) return { initial: previewTier, ceiling: previewTier, preview: true }
    return chooseQuality({
      memory: navigator.deviceMemory,
      cores: navigator.hardwareConcurrency,
      coarsePointer: window.matchMedia('(pointer: coarse)').matches,
      saveData: navigator.connection?.saveData,
    })
  })
  const [tier, setTier] = useState(policy.initial)
  const [visible, setVisible] = useState(() => !document.hidden)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(preference.matches)
    const updateVisibility = () => setVisible(!document.hidden)
    preference.addEventListener('change', updatePreference)
    document.addEventListener('visibilitychange', updateVisibility)
    return () => {
      preference.removeEventListener('change', updatePreference)
      document.removeEventListener('visibilitychange', updateVisibility)
    }
  }, [])

  useLayoutEffect(() => {
    document.documentElement.dataset.quality = tier
    document.documentElement.dataset.pageVisibility = visible ? 'visible' : 'hidden'
  }, [tier, visible])

  useEffect(() => {
    if (policy.preview || policy.ceiling === 'light') return undefined
    let tracker = createQualityTracker(policy)
    let frame = 0
    let timer = 0
    let previous = 0
    let elapsed = 0
    let intervals = 0
    let cancelled = false

    const sample = (now) => {
      if (cancelled || document.hidden) return
      if (previous) {
        elapsed += now - previous
        intervals += 1
      }
      previous = now
      if (elapsed >= 2400) {
        tracker = assessFrameRate(tracker, intervals * 1000 / elapsed, now)
        setTier(tracker.tier)
        // Sleep between short samples; the monitor itself should remain inexpensive.
        timer = window.setTimeout(begin, 3000)
        return
      }
      frame = window.requestAnimationFrame(sample)
    }
    const begin = () => {
      if (cancelled || document.hidden) return
      previous = 0
      elapsed = 0
      intervals = 0
      frame = window.requestAnimationFrame(sample)
    }
    const visibilityChanged = () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      tracker = { ...tracker, slowSamples: 0, fastSamples: 0 }
      if (!document.hidden) timer = window.setTimeout(begin, 2000)
    }
    timer = window.setTimeout(begin, 3000)
    document.addEventListener('visibilitychange', visibilityChanged)
    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      document.removeEventListener('visibilitychange', visibilityChanged)
    }
  }, [policy])

  const value = useMemo(() => ({ tier, profile: QUALITY_PROFILES[tier], visible, reducedMotion }), [tier, visible, reducedMotion])
  return <QualityContext value={value}>{children}</QualityContext>
}
