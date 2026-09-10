import test from 'node:test'
import assert from 'node:assert/strict'
import { nextFairyLetter, readFairyKey, saveFairyKey } from './fairyKey.js'
test('the six positions include both distinct As', () => {
  let progress = 0
  for (const index of [0, 1, 2, 3, 4]) progress = nextFairyLetter(progress, index)
  assert.equal(progress, 5)
  assert.equal(nextFairyLetter(progress, 2), 5)
  assert.equal(nextFairyLetter(progress, 5), 6)
  assert.equal(nextFairyLetter(6, 0), 6)
  assert.equal(nextFairyLetter(2, 4), 2)
})
test('unlock persists and denied storage does not throw', () => {
  let value = null
  const storage = { getItem: () => value, setItem: (_key, v) => { value = v } }
  assert.equal(readFairyKey(storage), false)
  assert.equal(saveFairyKey(storage), true)
  assert.equal(readFairyKey(storage), true)
  assert.equal(saveFairyKey(null), false)
  assert.equal(readFairyKey(null), false)
})
