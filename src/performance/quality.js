export const QUALITY_LEVELS = ['light', 'balanced', 'high']

export const QUALITY_PROFILES = {
  light: { rainDrops: 120, ripples: 6, dust: 14, shelfParticles: 8, flameSparks: 3, flameFps: 30, pixelRatio: 1, galaxyStars: 1400 },
  balanced: { rainDrops: 240, ripples: 10, dust: 24, shelfParticles: 12, flameSparks: 5, flameFps: 45, pixelRatio: 1.5, galaxyStars: 3400 },
  high: { rainDrops: 500, ripples: 14, dust: 34, shelfParticles: 18, flameSparks: 7, flameFps: 60, pixelRatio: 2, galaxyStars: 6500 },
}

export function chooseQuality({ memory, cores, coarsePointer = false, saveData = false } = {}) {
  const limited = (memory > 0 && memory <= 2) || (cores > 0 && cores <= 2)
  const modest = (memory > 0 && memory <= 4) || (cores > 0 && cores <= 4)
  const ceiling = limited || saveData ? 'light' : modest ? 'balanced' : 'high'
  const initial = ceiling === 'light' ? 'light'
    : coarsePointer && !memory ? 'light'
      : ceiling === 'high' && memory >= 8 && cores >= 8 && !coarsePointer ? 'high' : 'balanced'
  return { initial, ceiling }
}

export function createQualityTracker({ initial, ceiling }) {
  return { tier: initial, ceiling, slowSamples: 0, fastSamples: 0, cooldownUntil: 0 }
}

// Several windows of evidence and a cooldown prevent visible quality oscillation.
export function assessFrameRate(state, fps, now) {
  if (!Number.isFinite(fps) || fps <= 0) return state
  const index = QUALITY_LEVELS.indexOf(state.tier)
  const ceiling = QUALITY_LEVELS.indexOf(state.ceiling)
  const slow = fps < (state.tier === 'high' ? 48 : 38)
  const fast = fps >= 57
  const next = {
    ...state,
    slowSamples: slow ? Math.min(2, state.slowSamples + 1) : 0,
    fastSamples: fast ? Math.min(4, state.fastSamples + 1) : 0,
  }
  if (next.slowSamples >= 2 && index > 0) {
    return { ...next, tier: QUALITY_LEVELS[index - 1], slowSamples: 0, fastSamples: 0, cooldownUntil: now + 60000 }
  }
  if (next.fastSamples >= 4 && index < ceiling && now >= state.cooldownUntil) {
    return { ...next, tier: QUALITY_LEVELS[index + 1], slowSamples: 0, fastSamples: 0, cooldownUntil: now + 12000 }
  }
  return next
}
