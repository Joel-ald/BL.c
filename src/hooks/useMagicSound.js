import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortalSound } from './portalSound.js'

const AudioContextClass = () => window.AudioContext || window.webkitAudioContext

function useMagicSound() {
  const contextRef = useRef(null)
  const masterRef = useRef(null)
  const mutedRef = useRef(false)
  const ambienceRef = useRef(null)
  const hoverRef = useRef({ id: null, time: 0 })
  const musicRef = useRef(null)
  const musicFadeRef = useRef(null)
  const musicRequestedRef = useRef(false)
  const resumeMusicRef = useRef(false)
  const [muted, setMuted] = useState(false)
  const portalSoundRef = useRef(null)

  const stopPortalSound = useCallback(() => {
    portalSoundRef.current?.()
    portalSoundRef.current = null
  }, [])

  useEffect(() => () => {
    portalSoundRef.current?.()
    if (ambienceRef.current?.timer) window.clearInterval(ambienceRef.current.timer)
    if (musicFadeRef.current) window.clearInterval(musicFadeRef.current)
    musicRef.current?.pause()
    if (contextRef.current?.state !== 'closed') contextRef.current?.close().catch(() => {})
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      const context = contextRef.current
      const music = musicRef.current
      if (document.hidden) {
        portalSoundRef.current?.()
        resumeMusicRef.current = Boolean(music && !music.paused)
        music?.pause()
        if (context?.state === 'running') context.suspend().catch(() => {})
      } else {
        if (musicRequestedRef.current && context?.state === 'suspended') context.resume().catch(() => {})
        if (resumeMusicRef.current && musicRequestedRef.current && music) music.play().catch(() => {})
        resumeMusicRef.current = false
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const ensureContext = useCallback(() => {
    if (!contextRef.current || contextRef.current.state === 'closed') {
      const Context = AudioContextClass()
      if (!Context) return null

      const context = new Context()
      const master = context.createGain()
      master.gain.value = mutedRef.current ? 0 : 0.34
      master.connect(context.destination)
      contextRef.current = context
      masterRef.current = master
    }

    if (contextRef.current.state === 'suspended' && !document.hidden) {
      contextRef.current.resume().catch(() => {})
    }

    return contextRef.current
  }, [])

  const ensureMusic = useCallback(() => {
    if (!musicRef.current) {
      const music = new Audio()
      music.loop = true
      music.preload = 'none'
      music.src = `${import.meta.env.BASE_URL}audio/interstellar-piano.mp3`
      music.volume = 0.015
      music.muted = mutedRef.current
      musicRef.current = music
    }

    return musicRef.current
  }, [])

  const fadeMusic = useCallback((target = 0.28, duration = 10000) => {
    const music = musicRef.current
    if (!music) return
    if (musicFadeRef.current) window.clearInterval(musicFadeRef.current)

    let lastTick = window.performance.now()
    let elapsed = 0
    const startVolume = music.volume
    musicFadeRef.current = window.setInterval(() => {
      const now = window.performance.now()
      const interval = now - lastTick
      lastTick = now
      if (document.hidden) return
      elapsed += Math.min(interval, 160)
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - (1 - progress) ** 3
      music.volume = startVolume + (target - startVolume) * eased
      if (progress >= 1) {
        window.clearInterval(musicFadeRef.current)
        musicFadeRef.current = null
      }
    }, 80)
  }, [])

  const unlockAudio = useCallback(() => {
    ensureContext()
    if (!musicRequestedRef.current) return
    const music = ensureMusic()
    if (musicRequestedRef.current && music.paused) {
      music.play().then(() => fadeMusic()).catch(() => {})
    }
  }, [ensureContext, ensureMusic, fadeMusic])

  const tone = useCallback(
    ({ frequency, endFrequency, duration, type = 'sine', gain = 0.12, delay = 0 }) => {
      const context = ensureContext()
      const master = masterRef.current
      if (!context || !master || mutedRef.current || document.hidden) return

      const start = context.currentTime + delay
      const oscillator = context.createOscillator()
      const envelope = context.createGain()
      oscillator.type = type
      oscillator.frequency.setValueAtTime(frequency, start)
      if (endFrequency) {
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration)
      }
      envelope.gain.setValueAtTime(0.0001, start)
      envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.04, duration / 3))
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration)
      oscillator.connect(envelope)
      envelope.connect(master)
      oscillator.start(start)
      oscillator.stop(start + duration + 0.02)
    },
    [ensureContext],
  )

  const playCandle = useCallback(() => {
    tone({ frequency: 180, endFrequency: 620, duration: 0.32, type: 'triangle', gain: 0.08 })
    tone({ frequency: 880, endFrequency: 1320, duration: 0.42, gain: 0.05, delay: 0.12 })
  }, [tone])

  const playChime = useCallback(() => {
    const frequencies = [523.25, 659.25, 783.99, 1046.5]
    frequencies.forEach((frequency, index) => {
      tone({ frequency, duration: 0.68, gain: 0.055, delay: index * 0.1 })
    })
  }, [tone])

  const playBook = useCallback(
    (special = false) => {
      const context = ensureContext()
      if (context && masterRef.current && !mutedRef.current && !document.hidden) {
        const source = context.createBufferSource(), filter = context.createBiquadFilter(), gain = context.createGain()
        const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * .24), context.sampleRate)
        const samples = buffer.getChannelData(0)
        for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1
        source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 1600; filter.Q.value = .6
        const at = context.currentTime
        gain.gain.setValueAtTime(.0001, at); gain.gain.exponentialRampToValueAtTime(.04, at + .04); gain.gain.exponentialRampToValueAtTime(.0001, at + .24)
        source.connect(filter); filter.connect(gain); gain.connect(masterRef.current)
        source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect() }
        source.start(); source.stop(at + .25)
      }
      tone({ frequency: special ? 392 : 246.94, endFrequency: special ? 987.77 : 392, duration: special ? 0.65 : 0.28, type: 'triangle', gain: special ? 0.09 : 0.045 })
      if (special) tone({ frequency: 659.25, duration: 0.9, gain: 0.045, delay: 0.14 })
    },
    [tone, ensureContext],
  )

  const playLock = useCallback(() => {
    tone({ frequency: 680, endFrequency: 310, duration: .075, type: 'triangle', gain: .04 })
  }, [tone])

  const playPortal = useCallback((direction) => {
    stopPortalSound()
    if (mutedRef.current || document.hidden) return
    const context = ensureContext()
    if (context && masterRef.current) {
      portalSoundRef.current = createPortalSound(context, masterRef.current, direction)
    }
  }, [ensureContext, stopPortalSound])

  const playBookHover = useCallback((book) => {
    const now = window.performance.now()
    const previous = hoverRef.current
    if (previous.id === book.id && now - previous.time < 900) return
    if (now - previous.time < 180) return

    hoverRef.current = { id: book.id, time: now }
    const base = book.special ? 523.25 : 392 + (book.id % 5) * 38
    tone({
      frequency: base,
      endFrequency: base * 1.22,
      duration: book.special ? 0.32 : 0.18,
      type: 'sine',
      gain: book.special ? 0.035 : 0.021,
    })
  }, [tone])

  const stopLibraryAmbience = useCallback(() => {
    musicRequestedRef.current = false
    resumeMusicRef.current = false
    const music = musicRef.current
    if (musicFadeRef.current) {
      window.clearInterval(musicFadeRef.current)
      musicFadeRef.current = null
    }
    if (music) {
      music.pause()
      music.currentTime = 0
      music.volume = 0.015
    }

    const ambience = ambienceRef.current
    if (!ambience) return

    window.clearInterval(ambience.timer)
    const context = contextRef.current
    if (context && context.state !== 'closed') {
      const now = context.currentTime
      ambience.bus.gain.cancelScheduledValues(now)
      ambience.bus.gain.setValueAtTime(Math.max(0.0001, ambience.bus.gain.value), now)
      ambience.bus.gain.exponentialRampToValueAtTime(0.0001, now + 0.8)
      ambience.sources.forEach((source) => {
        try {
          source.stop(now + 0.82)
        } catch {
          // The source may already have ended while the scene was changing.
        }
      })
    }

    ambienceRef.current = null
  }, [])

  const startLibraryAmbience = useCallback(() => {
    musicRequestedRef.current = true
    const music = ensureMusic()
    music.muted = mutedRef.current
    music.volume = 0.015
    if (!document.hidden) music.play().then(() => fadeMusic()).catch(() => {})

    if (ambienceRef.current) return
    const context = ensureContext()
    const master = masterRef.current
    if (!context || !master) return

    const now = context.currentTime
    const bus = context.createGain()
    bus.gain.setValueAtTime(0.0001, now)
    bus.gain.exponentialRampToValueAtTime(0.045, now + 2.4)
    bus.connect(master)

    const lowFilter = context.createBiquadFilter()
    lowFilter.type = 'lowpass'
    lowFilter.frequency.value = 320
    lowFilter.Q.value = 0.7
    lowFilter.connect(bus)

    const hum = context.createOscillator()
    const humGain = context.createGain()
    hum.type = 'sine'
    hum.frequency.value = 73.42
    humGain.gain.value = 0.035
    hum.connect(humGain)
    humGain.connect(lowFilter)

    const overtone = context.createOscillator()
    const overtoneGain = context.createGain()
    overtone.type = 'triangle'
    overtone.frequency.value = 110
    overtoneGain.gain.value = 0.016
    overtone.connect(overtoneGain)
    overtoneGain.connect(lowFilter)

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let index = 0; index < noiseData.length; index += 1) {
      noiseData[index] = Math.random() * 2 - 1
    }

    const air = context.createBufferSource()
    const airFilter = context.createBiquadFilter()
    const airGain = context.createGain()
    air.buffer = noiseBuffer
    air.loop = true
    airFilter.type = 'bandpass'
    airFilter.frequency.value = 780
    airFilter.Q.value = 0.45
    airGain.gain.value = 0.018
    air.connect(airFilter)
    airFilter.connect(airGain)
    airGain.connect(bus)

    const breath = context.createOscillator()
    const breathDepth = context.createGain()
    breath.type = 'sine'
    breath.frequency.value = 0.085
    breathDepth.gain.value = 0.018
    breath.connect(breathDepth)
    breathDepth.connect(bus.gain)

    const sources = [hum, overtone, air, breath]
    sources.forEach((source) => source.start(now))

    const timer = window.setInterval(() => {
      const root = [659.25, 698.46, 783.99][Math.floor(Math.random() * 3)]
      tone({ frequency: root, duration: 1.4, gain: 0.007 })
      tone({ frequency: root * 1.5, duration: 1.1, gain: 0.0045, delay: 0.16 })
    }, 12000)

    ambienceRef.current = { bus, sources, timer }
  }, [ensureContext, ensureMusic, fadeMusic, tone])

  const toggleMuted = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    if (next) portalSoundRef.current?.()
    setMuted(next)
    const context = ensureContext()
    const master = masterRef.current
    if (context && master) {
      master.gain.cancelScheduledValues(context.currentTime)
      master.gain.setTargetAtTime(next ? 0 : 0.34, context.currentTime, 0.025)
    }
    if (musicRef.current) musicRef.current.muted = next
  }, [ensureContext])

  return {
    muted,
    unlockAudio,
    toggleMuted,
    playCandle,
    playChime,
    playBook,
    playLock,
    playBookHover,
    playPortal,
    stopPortalSound,
    startLibraryAmbience,
    stopLibraryAmbience,
  }
}

export default useMagicSound
