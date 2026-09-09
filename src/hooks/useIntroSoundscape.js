import { useCallback, useEffect, useRef } from 'react'

const AudioContextClass = () => window.AudioContext || window.webkitAudioContext

function useIntroSoundscape() {
  const audioRef = useRef({
    ambient: null,
    compressor: null,
    context: null,
    master: null,
    pendingAmbient: false,
  })

  const ensureContext = useCallback(() => {
    const state = audioRef.current
    if (state.context && state.context.state !== 'closed') return state.context

    state.ambient = null
    state.compressor = null
    state.context = null
    state.master = null

    const Context = AudioContextClass()
    if (!Context) return null

    try {
      const context = new Context()
      const master = context.createGain()
      const compressor = context.createDynamicsCompressor()
      master.gain.value = 0.5
      compressor.threshold.value = -20
      compressor.knee.value = 12
      compressor.ratio.value = 4
      compressor.attack.value = 0.004
      compressor.release.value = 0.18
      master.connect(compressor)
      compressor.connect(context.destination)
      state.context = context
      state.master = master
      state.compressor = compressor
      return context
    } catch {
      return null
    }
  }, [])

  const startAmbient = useCallback(() => {
    const state = audioRef.current
    const context = ensureContext()
    if (!context) return

    if (context.state !== 'running') {
      state.pendingAmbient = true
      context.resume().catch(() => {})
      return
    }

    if (state.ambient) return
    state.pendingAmbient = false

    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const samples = buffer.getChannelData(0)
    let last = 0
    for (let index = 0; index < samples.length; index += 1) {
      const white = Math.random() * 2 - 1
      last = last * 0.965 + white * 0.035
      samples[index] = last
    }

    const noise = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    noise.buffer = buffer
    noise.loop = true
    filter.type = 'bandpass'
    filter.frequency.value = 620
    filter.Q.value = 0.58
    gain.gain.value = 0.016
    noise.connect(filter)
    filter.connect(gain)
    gain.connect(state.master)
    noise.start()
    state.ambient = { gain, noise }
  }, [ensureContext])

  const stopAmbient = useCallback(() => {
    const state = audioRef.current
    state.pendingAmbient = false
    if (!state.ambient || !state.context) return

    const { gain, noise } = state.ambient
    const now = state.context.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
    noise.stop(now + 0.5)
    state.ambient = null
  }, [])

  const scheduleTone = useCallback(({
    delay = 0,
    duration,
    endFrequency,
    frequency,
    gain = 0.03,
    type = 'sine',
  }) => {
    const state = audioRef.current
    const context = ensureContext()
    if (!context || !state.master || context.state !== 'running') return

    const start = context.currentTime + delay
    const oscillator = context.createOscillator()
    const envelope = context.createGain()
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, start)
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)
    }
    envelope.gain.setValueAtTime(0.0001, start)
    envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.025, duration * 0.25))
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    oscillator.connect(envelope)
    envelope.connect(state.master)
    oscillator.start(start)
    oscillator.stop(start + duration + 0.03)
  }, [ensureContext])

  const scheduleNoiseBurst = useCallback(({
    delay = 0,
    duration = 0.1,
    frequency = 700,
    gain = 0.02,
    q = 1,
    type = 'bandpass',
  }) => {
    const state = audioRef.current
    const context = ensureContext()
    if (!context || !state.master || context.state !== 'running') return

    const start = context.currentTime + delay
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate)
    const samples = buffer.getChannelData(0)
    let smoothed = 0

    for (let index = 0; index < samples.length; index += 1) {
      const noise = Math.random() * 2 - 1
      smoothed = smoothed * 0.72 + noise * 0.28
      samples[index] = smoothed
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const envelope = context.createGain()
    source.buffer = buffer
    filter.type = type
    filter.frequency.value = frequency
    filter.Q.value = q
    envelope.gain.setValueAtTime(0.0001, start)
    envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.008, duration * 0.2))
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
    source.connect(filter)
    filter.connect(envelope)
    envelope.connect(state.master)
    source.start(start)
    source.stop(start + duration)
  }, [ensureContext])

  const playLetterDrops = useCallback((count, interval, impactDelay) => {
    startAmbient()
    for (let index = 0; index < count; index += 1) {
      const delay = impactDelay + index * interval + ((index * 5) % 4) * 0.045

      scheduleNoiseBurst({
        delay,
        duration: 0.105,
        frequency: 150 + (index % 4) * 19,
        gain: 0.052,
        q: 0.72,
        type: 'lowpass',
      })
      scheduleTone({
        delay,
        duration: 0.12,
        endFrequency: 58 + (index % 4) * 4,
        frequency: 104 + (index % 5) * 8,
        gain: 0.027,
        type: 'sine',
      })
      scheduleTone({
        delay: delay + 0.018,
        duration: 0.26,
        endFrequency: 240 + (index % 5) * 18,
        frequency: 410 + (index % 6) * 24,
        gain: 0.011,
        type: 'triangle',
      })
    }
  }, [scheduleNoiseBurst, scheduleTone, startAmbient])

  const playTension = useCallback(() => {
    ;[0, 0.12, 0.25].forEach((delay, index) => {
      scheduleTone({
        delay,
        duration: 0.22,
        endFrequency: 410 + index * 46,
        frequency: 290 + index * 38,
        gain: 0.011,
        type: 'triangle',
      })
    })
  }, [scheduleTone])

  const playTrace = useCallback((success) => {
    scheduleNoiseBurst({
      duration: success ? 0.055 : 0.035,
      frequency: success ? 1250 : 1850,
      gain: success ? 0.028 : 0.024,
      q: success ? 1.4 : 2.4,
    })

    if (!success) {
      scheduleTone({
        duration: 0.085,
        endFrequency: 720,
        frequency: 980,
        gain: 0.022,
        type: 'triangle',
      })
      return
    }

    scheduleTone({
      delay: 0.025,
      duration: 0.74,
      endFrequency: 980,
      frequency: 610,
      gain: 0.018,
      type: 'sine',
    })
    scheduleTone({
      delay: 0.04,
      duration: 0.72,
      endFrequency: 124,
      frequency: 116,
      gain: 0.011,
      type: 'sine',
    })
  }, [scheduleNoiseBurst, scheduleTone])

  const playBlow = useCallback(() => {
    const state = audioRef.current
    const context = ensureContext()
    if (!context || !state.master || context.state !== 'running') return

    const duration = 0.9
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate)
    const samples = buffer.getChannelData(0)
    for (let index = 0; index < samples.length; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length)
    }

    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const now = context.currentTime
    source.buffer = buffer
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(420, now)
    filter.frequency.exponentialRampToValueAtTime(1100, now + duration)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.045, now + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    source.connect(filter)
    filter.connect(gain)
    gain.connect(state.master)
    source.start(now)
    source.stop(now + duration)
  }, [ensureContext])

  useEffect(() => {
    const audioState = audioRef.current
    const resume = () => {
      if (document.hidden) return
      const context = ensureContext()
      if (!context) return
      context.resume().then(() => {
        if (audioState.pendingAmbient) startAmbient()
      }).catch(() => {})
    }

    window.addEventListener('pointerdown', resume, { once: true })
    window.addEventListener('keydown', resume, { once: true })
    const handleVisibility = () => {
      const context = audioState.context
      if (!context) return
      if (document.hidden && context.state === 'running') context.suspend().catch(() => {})
      else if (!document.hidden && context.state === 'suspended') resume()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('pointerdown', resume)
      window.removeEventListener('keydown', resume)
      document.removeEventListener('visibilitychange', handleVisibility)
      try {
        audioState.ambient?.noise.stop()
      } catch {
        // The source may already have completed its scheduled fade.
      }
      audioState.context?.close()
    }
  }, [ensureContext, startAmbient])

  return {
    playBlow,
    playLetterDrops,
    playTension,
    playTrace,
    startAmbient,
    stopAmbient,
  }
}

export default useIntroSoundscape
