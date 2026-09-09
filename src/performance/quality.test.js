import assert from 'node:assert/strict'
import test from 'node:test'
import { assessFrameRate, chooseQuality, createQualityTracker } from './quality.js'

function sample(state, rates, start = 10000) {
  return rates.reduce((current, fps, index) => assessFrameRate(current, fps, start + index * 6000), state)
}

test('a 2 GB / eight-core phone stays light even with a high frame rate', () => {
  const policy = chooseQuality({ memory: 2, cores: 8, coarsePointer: true })
  assert.equal(policy.initial, 'light')
  assert.equal(sample(createQualityTracker(policy), Array(20).fill(60)).tier, 'light')
})

test('memory, small CPU counts and data-saving are independent budget limits', () => {
  assert.equal(chooseQuality({ memory: 8, cores: 2 }).ceiling, 'light')
  assert.equal(chooseQuality({ memory: 4, cores: 8 }).ceiling, 'balanced')
  assert.equal(chooseQuality({ memory: 16, cores: 16, saveData: true }).ceiling, 'light')
})

test('unknown mobile hardware starts light and can earn more detail', () => {
  const policy = chooseQuality({ coarsePointer: true })
  assert.equal(policy.initial, 'light')
  assert.equal(policy.ceiling, 'high')
  const balanced = sample(createQualityTracker(policy), [60, 60, 60, 60])
  assert.equal(balanced.tier, 'balanced')
  assert.equal(sample(balanced, [60, 60, 60, 60], 50000).tier, 'high')
})

test('capable desktops start high, while missing signals are not mistaken for zero RAM', () => {
  assert.equal(chooseQuality({ memory: 8, cores: 12 }).initial, 'high')
  assert.equal(chooseQuality().ceiling, 'high')
  assert.equal(chooseQuality().initial, 'balanced')
})

test('an isolated stall does not change quality', () => {
  const state = createQualityTracker({ initial: 'high', ceiling: 'high' })
  assert.equal(sample(state, [20, 60, 20, 60]).tier, 'high')
})

test('sustained slow frames step down; continued overload can step down again', () => {
  const state = createQualityTracker({ initial: 'high', ceiling: 'high' })
  const balanced = sample(state, [30, 30])
  assert.equal(balanced.tier, 'balanced')
  assert.equal(sample(balanced, [25, 25], 22000).tier, 'light')
})

test('recovery must wait after a downgrade to prevent oscillation', () => {
  const state = createQualityTracker({ initial: 'high', ceiling: 'high' })
  const downgraded = sample(state, [30, 30])
  const held = sample(downgraded, [60, 60, 60, 60], 22000)
  assert.equal(held.tier, 'balanced')
  assert.equal(assessFrameRate(held, 60, 80000).tier, 'high')
})

test('invalid timing data does not cause a quality change', () => {
  const state = createQualityTracker({ initial: 'balanced', ceiling: 'high' })
  assert.equal(sample(state, [NaN, Infinity, 0, -1]), state)
})
