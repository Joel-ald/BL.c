import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useExperienceQuality } from '../../performance/useExperienceQuality.js'
import { createGalaxyEngine } from './galaxyEngine.js'

export default function GalaxyWorld({ onClose, capture = false, captureAge = 12 }) {
  const { profile, visible, reducedMotion } = useExperienceQuality()
  const canvasRef = useRef(null)
  const engineRef = useRef(null)
  const qualityRef = useRef(profile)
  const clockRef = useRef({ age: capture ? captureAge : 0 })
  const [formed, setFormed] = useState(reducedMotion || capture)
  const [touched, setTouched] = useState(false)
  const [fallback, setFallback] = useState(false)
  useEffect(() => {
    qualityRef.current = profile
    engineRef.current?.configure(profile)
  }, [profile])

  useEffect(() => {
    const canvas = canvasRef.current
    let engine
    try {
      engine = createGalaxyEngine(canvas, qualityRef.current, capture)
    } catch {
      const timer = window.setTimeout(() => { setFallback(true); setFormed(true) }, 0)
      return () => window.clearTimeout(timer)
    }
    engineRef.current = engine
    const observer = new ResizeObserver(() => {
      engine.resize()
      engine.draw(clockRef.current.age, false)
    })
    observer.observe(canvas)
    return () => {
      observer.disconnect()
      engine.dispose()
      engineRef.current = null
    }
  }, [capture])

  useEffect(() => {
    if (!visible || fallback) return undefined
    let frame = 0
    let last = 0
    let renderedAt = 0
    let announced = clockRef.current.age >= 9
    const tick = (now) => {
      if (!last) last = now
      clockRef.current.age += Math.min((now - last) / 1000, 0.08)
      last = now
      if (capture) clockRef.current.age = captureAge
      else if (reducedMotion) clockRef.current.age = Math.max(12, clockRef.current.age)
      if (clockRef.current.age < 9) announced = false
      if (now - renderedAt >= 1000 / profile.flameFps - 1 || reducedMotion) {
        engineRef.current?.draw(clockRef.current.age, !reducedMotion)
        renderedAt = now
      }
      if (!announced && clockRef.current.age >= 9) { announced = true; setFormed(true) }
      if (!reducedMotion && !capture) frame = window.requestAnimationFrame(tick)
    }
    frame = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frame)
  }, [visible, reducedMotion, fallback, profile, capture, captureAge])

  const ignite = (event) => {
    if (!formed) return
    const rect = canvasRef.current.getBoundingClientRect()
    const keyboard = event.type === 'keydown'
    const x = keyboard ? null : event.clientX - rect.left
    const y = keyboard ? null : event.clientY - rect.top
    const lit = engineRef.current?.touch(x, y, clockRef.current.age)
    if (lit || reducedMotion) setTouched(true)
    if (reducedMotion) engineRef.current?.draw(clockRef.current.age + 0.2, false)
  }

  return (
    <section className="galaxy-world" aria-label="La primera luz: el nacimiento de un universo">
      {fallback && <img className="galaxy-world__fallback" src={`${import.meta.env.BASE_URL}images/galaxy-preview.jpg`} alt="Una galaxia de estrellas doradas y azules" />}
      <canvas ref={canvasRef} className="galaxy-canvas" hidden={fallback} role="button" tabIndex={0}
        aria-label="Encender una estrella en la galaxia" aria-disabled={!formed}
        onPointerMove={(event) => {
          if (reducedMotion || event.pointerType !== 'mouse') return
          const rect = event.currentTarget.getBoundingClientRect()
          engineRef.current?.movePointer(event.clientX - rect.left, event.clientY - rect.top)
        }}
        onPointerLeave={() => engineRef.current?.leave()}
        onClick={ignite} onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); ignite(event) }
        }} />
      {!capture && <><button className="rain-world__back" onClick={onClose} aria-label="Volver al libro" title="Volver al libro"><ArrowLeft size={20} aria-hidden="true" /></button>
      <button className="galaxy-replay" aria-label="Volver a ver el Big Bang" title="Volver a ver el Big Bang" onClick={() => {
        engineRef.current?.reset()
        clockRef.current.age = reducedMotion ? 12 : 0
        setFormed(reducedMotion || fallback)
        setTouched(false)
        engineRef.current?.draw(clockRef.current.age, !reducedMotion)
      }}><RotateCcw size={19} aria-hidden="true" /></button>
      <div className={`galaxy-story ${formed ? 'is-formed' : ''}`}>
        <p className="galaxy-story__before">Antes de ti, el cielo guardaba silencio.</p>
        <div className="galaxy-story__after" aria-hidden={!formed}>
          <span className="galaxy-story__chapter">I · La primera luz</span>
          <h2>Y entonces,<br />llegaste tú.</h2>
          <p>No sé cómo empezó el universo.<br />Pero el mío es más bonito<br />desde que estás en él, Blanca.</p>
          <p className={`galaxy-story__secret ${touched ? 'is-visible' : ''}`} aria-live="polite">{touched ? 'Entre tantas estrellas, yo te elegiría a ti.' : ''}</p>
        </div>
      </div>
      </>}
    </section>
  )
}
