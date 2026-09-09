import test from 'node:test'
import assert from 'node:assert/strict'
import { createPortalSound } from './portalSound.js'

function audioFixture() {
  const nodes = []
  const param = () => ({ value: 0, setValueAtTime() {}, exponentialRampToValueAtTime() {} })
  const node = (kind) => {
    const result = { kind, gain: param(), frequency: param(), Q: param(), disconnected: false,
      connect() {}, disconnect() { this.disconnected = true },
      start(at) { this.startedAt = at }, stop(at) { this.stoppedAt = at ?? 0 },
    }
    nodes.push(result)
    return result
  }
  return { nodes, context: { currentTime: 10, sampleRate: 8000,
    createGain: () => node('gain'), createOscillator: () => node('oscillator'),
    createBiquadFilter: () => node('filter'), createBufferSource: () => node('air'),
    createBuffer: (_, length) => ({ getChannelData: () => new Float32Array(length) }),
  } }
}

test('entry rises and return falls, with short bounded voices', () => {
  for (const direction of ['enter', 'return']) {
    const { context, nodes } = audioFixture()
    createPortalSound(context, {}, direction)
    const notes = nodes.filter((node) => node.kind === 'oscillator')
    assert.equal(notes.length, 2)
    assert.equal(notes[1].frequency.value > notes[0].frequency.value, direction === 'enter')
    assert.ok(notes.every((note) => note.stoppedAt - context.currentTime <= 1))
  }
})

test('cancelling or finishing a portal disconnects every audio node', () => {
  const { context, nodes } = audioFixture()
  const stop = createPortalSound(context, {}, 'enter')
  nodes.find((node) => node.kind === 'air').onended()
  assert.ok(nodes.every((node) => node.disconnected))
  assert.doesNotThrow(stop)
})
