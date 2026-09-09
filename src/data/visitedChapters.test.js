import test from 'node:test'
import assert from 'node:assert/strict'
import { decodeVisited, normalizeVisited, readVisited, saveVisited, VISITED_KEY } from './visitedChapters.js'

test('visits only retain unique valid chapter IDs', () => {
  assert.deepEqual(normalizeVisited([6, 6, 23, 1, 0, 24, '2', null, 2.5]), [1, 6, 23])
})

test('corrupt, missing or unsupported saved data is harmless', () => {
  for (const value of [null, '', '{', 'null', '[]', '{"version":2,"chapters":[6]}', '{"version":1,"chapters":{}}']) {
    assert.deepEqual(decodeVisited(value), [])
  }
})

test('completed visits survive a new read without duplicating markers', () => {
  const data = new Map()
  const storage = { getItem: (key) => data.get(key), setItem: (key, value) => data.set(key, value) }
  saveVisited(storage, [6, 6])
  assert.deepEqual(readVisited(storage), [6])
  assert.equal(JSON.parse(data.get(VISITED_KEY)).version, 1)
})

test('blocked or full storage never prevents opening a world', () => {
  const blocked = { getItem() { throw Error('blocked') }, setItem() { throw Error('full') } }
  assert.deepEqual(readVisited(blocked), [])
  assert.doesNotThrow(() => saveVisited(blocked, [6]))
  assert.doesNotThrow(() => saveVisited(null, [6]))
})
