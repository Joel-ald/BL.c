export function createPortalSound(context, destination, direction) {
  const entering = direction === 'enter'
  const duration = entering ? 0.92 : 0.6
  const start = context.currentTime
  const nodes = []
  const sources = []
  let stopped = false
  const bus = context.createGain()
  bus.gain.value = 0.65
  bus.connect(destination)
  nodes.push(bus)

  const notes = entering ? [523.25, 783.99] : [587.33, 392]
  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const at = start + index * 0.12
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, at)
    gain.gain.exponentialRampToValueAtTime(index ? 0.065 : 0.095, at + 0.045)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(gain)
    gain.connect(bus)
    oscillator.start(at)
    oscillator.stop(start + duration + 0.02)
    sources.push(oscillator)
    nodes.push(oscillator, gain)
  })

  const air = context.createBufferSource()
  const filter = context.createBiquadFilter()
  const breath = context.createGain()
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate)
  const samples = buffer.getChannelData(0)
  let previous = 0
  for (let i = 0; i < samples.length; i += 1) {
    previous = previous * 0.8 + (Math.random() * 2 - 1) * 0.2
    samples[i] = previous
  }
  air.buffer = buffer
  filter.type = 'bandpass'
  filter.Q.value = 0.6
  filter.frequency.setValueAtTime(entering ? 650 : 1400, start)
  filter.frequency.exponentialRampToValueAtTime(entering ? 1800 : 500, start + duration)
  breath.gain.setValueAtTime(0.0001, start)
  breath.gain.exponentialRampToValueAtTime(0.28, start + duration * 0.35)
  breath.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  air.connect(filter)
  filter.connect(breath)
  breath.connect(bus)
  nodes.push(air, filter, breath)
  sources.push(air)

  const stop = () => {
    if (stopped) return
    stopped = true
    sources.forEach((source) => { try { source.stop() } catch { /* Already ended. */ } })
    nodes.forEach((node) => node.disconnect())
  }
  air.onended = stop
  air.start(start)
  return stop
}
