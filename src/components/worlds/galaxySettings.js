export function galaxyBudget(starBudget) {
  if (starBudget <= 1400) return { stars: 180, galaxy: 1000, dust: 160, core: 60, birth: 180, novae: 2, effects: 0.7 }
  if (starBudget <= 3400) return { stars: 420, galaxy: 1800, dust: 350, core: 100, birth: 360, novae: 3, effects: 0.85 }
  return { stars: 850, galaxy: 2650, dust: 620, core: 180, birth: 640, novae: 4, effects: 1 }
}

// A single pixel-space radius keeps the halo circular at every aspect ratio.
export function galaxyLayout(width, height, capture = false) {
  const w = Math.max(1, width), h = Math.max(1, height)
  if (capture) return { cx: w * 0.5, cy: h * 0.5, radius: Math.min(w * 0.44, h * 0.48) }
  const landscape = h <= 540 && w >= 600
  return {
    cx: w * (landscape ? 0.29 : 0.5),
    cy: h * (landscape ? 0.5 : 0.34),
    radius: landscape ? Math.min(w * 0.25, h * 0.44) : Math.min(w * 0.43, h * 0.37),
  }
}
