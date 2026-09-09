import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useExperienceQuality } from '../../performance/useExperienceQuality.js'

const mainMessage = 'A veces toca caminar bajo la lluvia. Pero el cielo no se queda gris para siempre.'
const supportMessage = 'Mientras vuelve el sol, puedes ir despacio, descansar y dejar que te acompañen. No tienes que poder con todo a la vez.'

const rainDrops = Array.from({ length: 500 }, (_, index) => ({
  id: index,
  depth: index % 3,
  delay: `${-((index * 47) % 180) / 10}s`,
  duration: `${1.25 + ((index * 29) % 190) / 100}s`,
  left: `${((index * 73) % 1200) / 12}%`,
  opacity: `${0.16 + ((index * 11) % 74) / 100}`,
  span: `${0.3 + ((index * 17) % 48) / 10}vmin`,
}))

const rainRipples = Array.from({ length: 14 }, (_, index) => ({
  id: index,
  bottom: `${4 + ((index * 17) % 21)}%`,
  delay: `${-((index * 23) % 48) / 10}s`,
  left: `${3 + ((index * 41) % 92)}%`,
  width: `${1.8 + (index % 5) * 0.72}rem`,
}))

const WrittenLine = memo(function WrittenLine({ text, startIndex = 0 }) {
  const words = text.split(' ')

  return (
    <span className="rain-written" aria-label={text}>
      {words.map((word, wordIndex) => {
        const firstCharacter = startIndex + words
          .slice(0, wordIndex)
          .reduce((total, previousWord) => total + previousWord.length + 1, 0)

        return (
          <span key={`${word}-${wordIndex}`}>
            <span className="rain-written__word" aria-hidden="true">
              {Array.from(word).map((character, index) => (
                <span
                  className="rain-written__character"
                  key={`${character}-${index}`}
                  style={{ '--character-index': firstCharacter + index }}
                >
                  {character}
                </span>
              ))}
            </span>
            {wordIndex < words.length - 1 ? ' ' : null}
          </span>
        )
      })}
    </span>
  )
})

const RainField = memo(function RainField({ count }) {
  return (
    <div className="rain-field" aria-hidden="true">
      {rainDrops.slice(0, count).map((drop) => (
        <i
          className={`rain-drop rain-drop--${drop.depth}`}
          key={drop.id}
          style={{
            '--drop-delay': drop.delay,
            '--drop-duration': drop.duration,
            '--drop-left': drop.left,
            '--drop-opacity': drop.opacity,
            '--drop-span': drop.span,
          }}
        />
      ))}
    </div>
  )
})

function RainWorld({ onClose, managedEntry = false }) {
  const { profile, visible, reducedMotion } = useExperienceQuality()
  const [entered, setEntered] = useState(false)
  const [windAngle, setWindAngle] = useState(91)
  const [lightning, setLightning] = useState({ active: false, x: 50 })
  const closeTimerRef = useRef(null)
  const lightningTimerRef = useRef(null)
  const flashTimerRef = useRef(null)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!visible || reducedMotion) return undefined
    const changeWind = () => setWindAngle(89.8 + Math.random() * 2.2)
    changeWind()
    const timer = window.setInterval(changeWind, 5600)
    return () => window.clearInterval(timer)
  }, [visible, reducedMotion])

  useEffect(() => {
    if (!visible || reducedMotion) return undefined
    flashTimerRef.current = window.setTimeout(() => {
      setLightning((current) => current.active ? { ...current, active: false } : current)
    }, 0)
    const triggerLightning = () => {
      setLightning({ active: true, x: 18 + Math.random() * 64 })
      flashTimerRef.current = window.setTimeout(() => {
        setLightning((current) => ({ ...current, active: false }))
      }, 460)
      lightningTimerRef.current = window.setTimeout(triggerLightning, 3600 + Math.random() * 5200)
    }

    lightningTimerRef.current = window.setTimeout(triggerLightning, 1600 + Math.random() * 1800)
    return () => {
      window.clearTimeout(lightningTimerRef.current)
      window.clearTimeout(flashTimerRef.current)
    }
  }, [visible, reducedMotion])

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), [])

  const sceneStyle = useMemo(() => ({
    '--flash-x': `${lightning.x}%`,
    '--rain-angle': `${windAngle}deg`,
  }), [lightning.x, windAngle])

  const closeWorld = useCallback(() => {
    if (managedEntry) {
      onClose()
      return
    }
    setEntered(false)
    closeTimerRef.current = window.setTimeout(onClose, 680)
  }, [onClose, managedEntry])

  return (
    <section
      className={`rain-world ${entered || managedEntry ? 'is-entered' : ''} ${lightning.active && visible && !reducedMotion ? 'is-flashing' : ''}`}
      style={sceneStyle}
      aria-label="El mundo de las seis gotas de lluvia"
    >
      <button className="rain-world__back" type="button" onClick={closeWorld} aria-label="Volver al libro" title="Volver al libro">
        <span aria-hidden="true">←</span>
      </button>

      <div className="storm-sky" aria-hidden="true">
        <span className="storm-haze storm-haze--one" />
        <span className="storm-haze storm-haze--two" />
        <span className="storm-haze storm-haze--three" />
      </div>

      <RainField count={profile.rainDrops} />

      <div className="rain-ripples" aria-hidden="true">
        {rainRipples.slice(0, profile.ripples).map((ripple) => (
          <i
            key={ripple.id}
            style={{
              '--ripple-bottom': ripple.bottom,
              '--ripple-delay': ripple.delay,
              '--ripple-left': ripple.left,
              '--ripple-width': ripple.width,
            }}
          />
        ))}
      </div>

      <div className="rain-message">
        <span className="rain-message__number">VI</span>
        <h2>
          <WrittenLine text={mainMessage} />
        </h2>
        <p>
          <WrittenLine text={supportMessage} startIndex={mainMessage.length + 14} />
          <span className="rain-message__caret" aria-hidden="true" />
        </p>
      </div>
    </section>
  )
}

export default RainWorld
