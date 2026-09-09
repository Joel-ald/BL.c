import { useEffect, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import useIntroSoundscape from '../../hooks/useIntroSoundscape.js'
import CandleCake from './CandleCake.jsx'
import HangingBirthday from './HangingBirthday.jsx'
import { useExperienceQuality } from '../../performance/useExperienceQuality.js'

function IntroScene({ onComplete, onRevealLibrary }) {
  const { visible, reducedMotion } = useExperienceQuality()
  const rootRef = useRef(null)
  const timelineRef = useRef(null)
  const {
    playBlow,
    playLetterDrops,
    playTrace,
    startAmbient,
    stopAmbient,
  } = useIntroSoundscape()

  useLayoutEffect(() => {
    const root = rootRef.current
    const pace = reducedMotion ? 0.42 : 1
    const rigs = [...root.querySelectorAll('.hanging-rig')]
    const birthdayRigs = [...root.querySelectorAll('.hanging-line--birthday .hanging-rig')]
    const nameRigs = [...root.querySelectorAll('.hanging-line--name .hanging-rig')]
    const pendulums = rigs.map((rig) => rig.querySelector('.physics-pendulum'))
    const swings = rigs.map((rig) => rig.querySelector('.letter-swing'))
    const whiteLetters = nameRigs.map((rig) => rig.querySelector('.neon-letter'))

    const context = gsap.context(() => {
      gsap.set(root, { opacity: 1 })
      gsap.set('.intro-content', { opacity: 1 })
      gsap.set('.candle-fire', {
        opacity: 1,
        scale: reducedMotion ? 1.55 : 2.9,
        y: reducedMotion ? 0 : -5,
        filter: reducedMotion
          ? 'blur(0px) brightness(1.05) saturate(1)'
          : 'blur(1.35px) brightness(1.38) saturate(1.2)',
        transformOrigin: '50% 50%',
      })
      gsap.set('.cake-art', {
        opacity: 0,
        y: reducedMotion ? 0 : 10,
        scale: reducedMotion ? 1 : 0.93,
      })
      gsap.set('.candle-aura', {
        opacity: 0.15,
        scale: reducedMotion ? 0.32 : 0.18,
        transformOrigin: '50% 50%',
      })
      gsap.set('.heat-haze', { opacity: 0 })
      gsap.set('.candle-smoke i', { opacity: 0, x: 0, y: 0, rotation: 0, scale: 0.55 })
      gsap.set(rigs, {
        opacity: 0,
        y: () => -window.innerHeight * 0.62,
      })
      gsap.set(pendulums, { rotation: 0 })
      gsap.set(swings, { rotation: 0 })
      gsap.set('.letter-string', { opacity: 0.72 })
      gsap.set('.neon-letter', { opacity: 1 })
      gsap.set('.neon-letter__fill', { opacity: 1 })
      gsap.set('.neon-letter__trace', { opacity: 0 })

      const timeline = gsap.timeline({
        paused: true,
        defaults: { ease: 'power2.out' },
        onComplete: () => {
          root.dataset.finished = 'true'
          onComplete?.()
        },
      })

      timeline
        .call(startAmbient)
        .to({}, { duration: 2.55 })
        .to('.candle-fire', {
          scale: 1,
          y: 0,
          filter: 'blur(0px) brightness(1.05) saturate(1)',
          duration: 1.72 * pace,
          ease: 'power3.inOut',
        })
        .to('.candle-aura', {
          opacity: 0.92,
          scale: 1,
          duration: 1.86 * pace,
          ease: 'sine.out',
        }, '<')
        .to('.cake-art', {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.86 * pace,
          ease: 'power2.inOut',
        }, '<10%')
        .to('.heat-haze', { opacity: 0.48, duration: 0.52 * pace }, '<48%')
        .set('.cake-art', { clearProps: 'transform' })

      const dropStart = timeline.duration() + 0.46
      const dropGap = reducedMotion ? 0.05 : 0.15
      const directions = [-1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, -1, -1, 1, 1, -1, 1]
      timeline.call(() => playLetterDrops(
        rigs.length,
        dropGap,
        reducedMotion ? 0.24 : 1.07,
      ), [], dropStart)

      rigs.forEach((rig, index) => {
        const fallDuration = reducedMotion ? 0.28 : 1.02 + ((index * 5) % 4) * 0.045
        const arrival = dropStart + index * dropGap + fallDuration
        const direction = directions[index % directions.length]
        const ropeAngle = direction * (2.15 + ((index * 7) % 5) * 0.26)
        const letterLag = -direction * (1.3 + ((index * 3) % 4) * 0.22)
        const beat = 0.36 + (index % 4) * 0.022

        timeline.to(rig, {
          opacity: 1,
          y: reducedMotion ? 0 : 8,
          duration: fallDuration,
          ease: reducedMotion ? 'power2.out' : 'power3.in',
        }, dropStart + index * dropGap)

        if (!reducedMotion) {
          timeline
            .to(rig, {
              y: -3,
              duration: 0.22,
              ease: 'power2.out',
            }, arrival)
            .to(rig, {
              y: 0,
              duration: 0.34,
              ease: 'sine.out',
            }, arrival + 0.22)

          const catchTime = arrival - 0.04
          const returnOne = arrival + 0.13
          const returnTwo = returnOne + beat
          const returnThree = returnTwo + beat * 0.92
          const settle = returnThree + beat * 0.84

          timeline
            .to(pendulums[index], {
              rotation: ropeAngle,
              duration: 0.15,
              ease: 'power2.out',
            }, catchTime)
            .to(pendulums[index], {
              rotation: ropeAngle * -0.46,
              duration: beat,
              ease: 'sine.inOut',
            }, returnOne)
            .to(pendulums[index], {
              rotation: ropeAngle * 0.2,
              duration: beat * 0.92,
              ease: 'sine.inOut',
            }, returnTwo)
            .to(pendulums[index], {
              rotation: ropeAngle * -0.07,
              duration: beat * 0.84,
              ease: 'sine.inOut',
            }, returnThree)
            .to(pendulums[index], {
              rotation: 0,
              duration: beat * 0.72,
              ease: 'sine.out',
            }, settle)

          timeline
            .to(swings[index], {
              rotation: letterLag,
              duration: 0.18,
              ease: 'power2.out',
            }, arrival + 0.015)
            .to(swings[index], {
              rotation: letterLag * -0.62,
              duration: beat * 0.82,
              ease: 'sine.inOut',
            }, arrival + 0.19)
            .to(swings[index], {
              rotation: letterLag * 0.24,
              duration: beat * 0.78,
              ease: 'sine.inOut',
            }, arrival + 0.19 + beat * 0.82)
            .to(swings[index], {
              rotation: 0,
              duration: beat * 0.7,
              ease: 'sine.out',
            }, arrival + 0.19 + beat * 1.6)
        }
      })

      timeline
        .to({}, { duration: 0.38 })
        .to(whiteLetters, { opacity: 0, duration: 0.06, ease: 'none' })
        .to({}, { duration: 0.08 })
        .call(() => playTrace(false))
        .to(whiteLetters, { opacity: 0.94, duration: 0.045, ease: 'none' })
        .to(whiteLetters, { opacity: 0, duration: 0.07, ease: 'none' })
        .to({}, { duration: 0.065 })
        .call(() => playTrace(false))
        .to(whiteLetters, { opacity: 0.98, duration: 0.05, ease: 'none' })
        .to(whiteLetters, { opacity: 0, duration: 0.075, ease: 'none' })
        .to({}, { duration: 0.08 })
        .call(() => playTrace(true))
        .to(whiteLetters, { opacity: 1, duration: 0.24, ease: 'power2.out' })
        .to({}, { duration: 2.25 })
        .addLabel('firstBlackout')
        .call(playBlow, [], 'firstBlackout')
        .call(stopAmbient, [], 'firstBlackout')
        .to('.candle-fire', {
          x: 8,
          skewX: -17,
          scaleY: 0.78,
          duration: 0.22 * pace,
          transformOrigin: '50% 100%',
          ease: 'power2.out',
        }, 'firstBlackout')
        .to('.candle-fire', {
          x: -4,
          skewX: 11,
          opacity: 0,
          scaleX: 0.22,
          scaleY: 0.035,
          duration: 0.28 * pace,
          ease: 'power3.in',
        })
        .to('.heat-haze', { opacity: 0, duration: 0.2 * pace }, 'firstBlackout+=0.08')
        .to('.candle-aura', { opacity: 0, scale: 0.42, duration: 0.55 * pace }, 'firstBlackout+=0.08')
        .to('.cake-art', { opacity: 0, duration: 0.46 * pace }, 'firstBlackout+=0.16')
        .to('.hanging-message', { opacity: 0, duration: 0.32 * pace }, 'firstBlackout+=0.2')
        .to('.candle-smoke i', {
          opacity: (index) => 0.48 - index * 0.08,
          x: (index) => [-11, 9, -4][index],
          y: (index) => -44 - index * 12,
          rotation: (index) => [-15, 14, -8][index],
          scale: (index) => 0.95 + index * 0.16,
          duration: 0.82 * pace,
          stagger: 0.08 * pace,
          ease: 'sine.out',
        }, 'firstBlackout+=0.2')
        .to('.candle-smoke i', {
          opacity: 0,
          y: (index) => -68 - index * 15,
          duration: 0.48 * pace,
          stagger: 0.06 * pace,
        }, '-=0.24')
        .to({}, { duration: 1.05 })
        .addLabel('secondIgnition')
        .set(birthdayRigs, { opacity: 0 })
        .set(nameRigs, { opacity: 1 })
        .set(whiteLetters, { opacity: 0 })
        .set('.hanging-message', { opacity: 1 })
        .to({}, { duration: 0.08 })
        .call(() => playTrace(false))
        .to(whiteLetters, { opacity: 0.94, duration: 0.045, ease: 'none' })
        .to(whiteLetters, { opacity: 0, duration: 0.07, ease: 'none' })
        .to({}, { duration: 0.065 })
        .call(() => playTrace(false))
        .to(whiteLetters, { opacity: 0.98, duration: 0.05, ease: 'none' })
        .to(whiteLetters, { opacity: 0, duration: 0.075, ease: 'none' })
        .to({}, { duration: 0.08 })
        .call(() => playTrace(true))
        .to(whiteLetters, { opacity: 1, duration: 0.24, ease: 'power2.out' })
        .to({}, { duration: 0.72 })
        .to(birthdayRigs, {
          opacity: 1,
          duration: 0.28,
          stagger: 0.1,
          ease: 'power2.out',
        })
        .to({}, { duration: 1.9 })
        .addLabel('libraryReveal')
        .call(() => onRevealLibrary?.())
        .to([root, '.intro-content'], {
          backgroundColor: 'rgba(0, 0, 0, 0)',
          duration: 1.45,
          ease: 'sine.inOut',
        }, '<')
        .to('.hanging-message', {
          scale: 0.7,
          y: 0,
          filter: 'blur(0.15px) brightness(0.92)',
          transformOrigin: '50% 0%',
          duration: 1.75,
          ease: 'power2.inOut',
        }, '<')
        .to(root, {
          opacity: 0,
          duration: 0.3,
          ease: 'sine.inOut',
        }, '>-0.22')

      timelineRef.current = timeline
    }, root)

    const startFrame = window.requestAnimationFrame(() => {
      if (!document.hidden) timelineRef.current?.play(0)
    })

    return () => {
      window.cancelAnimationFrame(startFrame)
      stopAmbient()
      timelineRef.current?.kill()
      context.revert()
    }
  }, [
    onComplete,
    onRevealLibrary,
    playBlow,
    playLetterDrops,
    playTrace,
    startAmbient,
    stopAmbient,
    reducedMotion,
  ])

  useEffect(() => {
    timelineRef.current?.paused(!visible)
  }, [visible])

  return (
    <section ref={rootRef} className="intro-scene" aria-label="Celebración de cumpleaños para Blanca">
      <div className="intro-content">
        <HangingBirthday />
        <CandleCake />
      </div>
    </section>
  )
}

export default IntroScene
