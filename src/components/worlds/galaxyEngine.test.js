import test from 'node:test'
import assert from 'node:assert/strict'
import { galaxyBudget, galaxyLayout } from './galaxySettings.js'
import { createGalaxyEngine } from './galaxyEngine.js'
import { QUALITY_PROFILES } from '../../performance/quality.js'

test('galaxy budgets preserve all effects at bounded light and high costs', () => {
  const tiers = Object.values(QUALITY_PROFILES).map(p => galaxyBudget(p.galaxyStars))
  for (const field of ['stars', 'galaxy', 'dust', 'core', 'birth', 'novae', 'effects']) {
    assert.ok(tiers[0][field] > 0)
    assert.ok(tiers[0][field] <= tiers[1][field])
    assert.ok(tiers[1][field] <= tiers[2][field])
  }
  assert.ok(tiers[0].stars + tiers[0].galaxy + tiers[0].dust + tiers[0].core <= 1400)
  assert.equal(tiers[0].novae, 2)
})

test('halo stays within the viewport with one radius, including ultrawide and portrait', () => {
  for (const [width, height] of [[360,800], [320,568], [1440,900], [2560,1080], [800,360]]) {
    const layout = galaxyLayout(width,height)
    assert.ok(layout.radius > 0)
    assert.ok(layout.cx - layout.radius >= 0)
    assert.ok(layout.cx + layout.radius <= width)
    assert.ok(layout.cy - layout.radius * .82 >= 0)
    assert.ok(layout.cy + layout.radius * .82 <= height)
  }
  const capture = galaxyLayout(900,740,true)
  assert.equal(capture.cx,450)
  assert.equal(capture.cy,370)
})

function mockCanvasEnvironment(t) {
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document')
  const oldDpr = Object.getOwnPropertyDescriptor(globalThis, 'devicePixelRatio')
  const stats = { arcs: 0, images: 0, gradients: 0, fullFlash: false }
  const context = new Proxy({}, { get(target,key) {
    if (key in target) return target[key]
    if (key === 'createRadialGradient' || key === 'createLinearGradient') return () => {
      stats.gradients++
      return { addColorStop() {} }
    }
    if (key === 'arc') return (...args) => {
      stats.arcs++
      assert.ok(args.every(Number.isFinite))
      assert.ok(args[2] >= 0)
    }
    if (key === 'drawImage') return () => { stats.images++ }
    if (key === 'fillRect') return () => { if (String(target.fillStyle).startsWith('rgba(255,250,235')) stats.fullFlash = true }
    return () => {}
  } })
  const canvas = { clientWidth: 360, clientHeight: 800, style: {}, getContext: () => context }
  globalThis.document = { createElement: () => ({ getContext: () => context }) }
  globalThis.devicePixelRatio = 3
  t.after(() => {
    if (oldDocument) Object.defineProperty(globalThis,'document',oldDocument)
    else delete globalThis.document
    if (oldDpr) Object.defineProperty(globalThis,'devicePixelRatio',oldDpr)
    else delete globalThis.devicePixelRatio
  })
  return { canvas, stats }
}

test('creation, star explosions, replay, quality changes and resize render without invalid geometry', t => {
  const { canvas, stats } = mockCanvasEnvironment(t)
  const engine = createGalaxyEngine(canvas,QUALITY_PROFILES.light)
  assert.equal(canvas.width,360)
  assert.equal(engine.touch(180,272,1),false)
  for (const age of [0,1,2.4,3,4,6,9,12]) engine.draw(age)
  assert.equal(engine.touch(180,272,12),true)
  for (const age of [12.2,12.8,13.8,15,18]) engine.draw(age)
  assert.ok(stats.arcs > 1000)
  assert.ok(stats.images > 0)
  assert.equal(stats.fullFlash,false)
  engine.configure(QUALITY_PROFILES.high)
  assert.equal(canvas.width,720)
  canvas.clientWidth=1440; canvas.clientHeight=900
  engine.resize()
  assert.equal(canvas.width,2880)
  assert.equal(canvas.height,1800)
  assert.equal(canvas.style.width,undefined)
  engine.reset()
  engine.draw(0)
  engine.draw(12,false)
  assert.equal(engine.touch(720,306,12),false)
  engine.dispose()
})

test('nebula and glow caches are reused after initial render', t => {
  const { canvas, stats } = mockCanvasEnvironment(t)
  const engine = createGalaxyEngine(canvas,QUALITY_PROFILES.light,true)
  engine.draw(12,false)
  const first = stats.gradients
  engine.draw(12,false)
  const second = stats.gradients-first
  assert.ok(first > 30)
  assert.ok(second < 10)
  engine.dispose()
})
