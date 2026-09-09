import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

const source = readFileSync(new URL('./htmlWorldBridge.js', import.meta.url),'utf8')
function fixture() {
  const listeners = new Map(), scheduled = new Map(), messages = []
  let serial = 0
  class Media { play() { return Promise.resolve() } }
  const parent = { postMessage: data => messages.push(data.type) }
  const world = {
    __BLANCA_WORLD__: { fps: 30, visible: true, muted: true, parentOrigin: 'https://gift.test' },
    parent, HTMLMediaElement: Media, console,
    document: { documentElement: { dataset: {} }, head: { append() {} }, createElement: () => ({}), querySelectorAll: () => [] },
    requestAnimationFrame: cb => { scheduled.set(++serial, cb); return serial },
    cancelAnimationFrame: id => scheduled.delete(id),
    addEventListener: (type, cb) => listeners.set(type, cb), dispatchEvent() {},
    CustomEvent: class {}, ErrorEvent: class {},
  }
  world.window = world
  runInNewContext(source, world)
  return { world, messages, scheduled, listeners, parent, pump(time) {
    for (const [id, callback] of [...scheduled]) { scheduled.delete(id); callback(time) }
  }, state(state, origin = 'https://gift.test', source = parent) {
    listeners.get('message')({ source, origin, data: { type: 'blanca:state', state } })
  } }
}

test('imported rAF loops respect frame limits, cancellation and hidden-page pause', () => {
  const f = fixture()
  let frames = 0
  function draw() { frames++; f.world.requestAnimationFrame(draw) }
  f.world.requestAnimationFrame(draw)
  f.pump(10); assert.equal(frames,0)
  f.pump(34); assert.equal(frames,1)
  f.state({ visible: false }); assert.equal(f.scheduled.size,0)
  f.pump(100); assert.equal(frames,1)
  f.state({ visible: true }); f.pump(140); assert.equal(frames,2)
  const id = f.world.requestAnimationFrame(() => assert.fail('cancelled callback ran'))
  f.world.cancelAnimationFrame(id)
  f.pump(180)
})

test('only the parent origin controls a chapter; load and Escape use the shared protocol', () => {
  const f = fixture()
  f.state({ muted: false }, 'https://other.test')
  f.state({ muted: false }, 'https://gift.test', {})
  assert.equal(f.world.__BLANCA_WORLD__.muted,true)
  f.state({ muted: false })
  assert.equal(f.world.__BLANCA_WORLD__.muted,false)
  f.listeners.get('load')()
  f.listeners.get('keydown')({ key: 'Escape', preventDefault() {} })
  assert.deepEqual(f.messages,['blanca:ready','blanca:close'])
})

test('Escape consumed by an internal dialog does not close the whole chapter', () => {
  const f = fixture()
  f.listeners.get('keydown')({ key: 'Escape', defaultPrevented: true })
  assert.deepEqual(f.messages, [])
})
