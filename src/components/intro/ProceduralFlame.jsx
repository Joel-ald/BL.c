import { useEffect, useRef } from 'react'
import { useExperienceQuality } from '../../performance/useExperienceQuality.js'

const TAU = Math.PI * 2

function ProceduralFlame({ className = 'candle-fire' }) {
  const { profile, visible, reducedMotion } = useExperienceQuality()
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')
    if (!context || !visible) return undefined
    const sparks = Array.from({ length: profile.flameSparks }, (_, index) => ({
      phase: index / profile.flameSparks,
      drift: ((index * 17) % 9) / 9 - 0.5,
      size: 0.8 + (index % 3) * 0.45,
    }))
    let frameId
    let width = 1
    let height = 1
    let lastFrame = 0
    const interval = 1000 / profile.flameFps

    const resize = () => {
      const pixelRatio = Math.min(window.devicePixelRatio || 1, profile.pixelRatio)
      // Use layout size, not the animated close-up scale, to bound the canvas cost.
      width = Math.max(canvas.clientWidth, 1)
      height = Math.max(canvas.clientHeight, 1)
      canvas.width = Math.round(width * pixelRatio)
      canvas.height = Math.round(height * pixelRatio)
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    }

    const drawLayer = ({
      time,
      heightRatio,
      widthRatio,
      yOffset = 0,
      colors,
      alpha = 1,
      phase = 0,
    }) => {
      const baseY = height * 0.89 + yOffset
      const flameHeight = height * heightRatio
      const flameWidth = width * widthRatio
      const sway = Math.sin(time * 2.15 + phase) * width * 0.055
        + Math.sin(time * 4.8 + phase * 1.7) * width * 0.022
      const pulse = 1 + Math.sin(time * 3.35 + phase) * 0.035
      const tipX = width * 0.5 + sway
      const tipY = baseY - flameHeight * pulse
      const leftWave = Math.sin(time * 3.8 + phase + 1.2) * width * 0.035
      const rightWave = Math.sin(time * 4.25 + phase + 2.4) * width * 0.032
      const gradient = context.createLinearGradient(0, tipY, 0, baseY)
      gradient.addColorStop(0, colors[0])
      gradient.addColorStop(0.48, colors[1])
      gradient.addColorStop(1, colors[2])

      context.save()
      context.globalAlpha = alpha
      context.fillStyle = gradient
      context.beginPath()
      context.moveTo(width * 0.5, baseY)
      context.bezierCurveTo(
        width * 0.5 - flameWidth * 0.72 + leftWave,
        baseY - flameHeight * 0.2,
        tipX - flameWidth * 0.34,
        tipY + flameHeight * 0.3,
        tipX,
        tipY,
      )
      context.bezierCurveTo(
        tipX + flameWidth * 0.24,
        tipY + flameHeight * 0.28,
        width * 0.5 + flameWidth * 0.76 + rightWave,
        baseY - flameHeight * 0.22,
        width * 0.5,
        baseY,
      )
      context.closePath()
      context.fill()
      context.restore()
    }

    const draw = (timestamp) => {
      const frozen = Boolean(canvas.closest('[data-frozen="true"]'))
      if (frozen) timestamp = 1000
      if (!lastFrame || timestamp - lastFrame >= interval - 0.5) {
        lastFrame = timestamp - ((timestamp - lastFrame) % interval)
        const time = timestamp / 1000
        context.clearRect(0, 0, width, height)
        context.globalCompositeOperation = 'source-over'

        context.save()
        context.globalCompositeOperation = 'lighter'
        context.shadowColor = 'rgba(255, 93, 8, 0.72)'
        context.shadowBlur = width * 0.2
        drawLayer({
          time,
          heightRatio: 0.78,
          widthRatio: 0.52,
          colors: ['rgba(255, 179, 38, 0.92)', '#ff7611', '#df3108'],
        })
        context.restore()

        context.globalCompositeOperation = 'lighter'
        drawLayer({
          time,
          heightRatio: 0.59,
          widthRatio: 0.35,
          yOffset: -height * 0.005,
          colors: ['#fff6aa', '#ffd33d', '#ff8b13'],
          alpha: 0.98,
          phase: 1.7,
        })
        drawLayer({
          time,
          heightRatio: 0.34,
          widthRatio: 0.19,
          yOffset: -height * 0.012,
          colors: ['#ffffff', '#fff8b7', '#ffd84c'],
          alpha: 0.92,
          phase: 2.9,
        })

        sparks.forEach((spark, index) => {
          const cycle = (time * (0.34 + index * 0.012) + spark.phase) % 1
          const alpha = Math.sin(cycle * Math.PI) * 0.72
          const x = width * 0.5
            + Math.sin(cycle * TAU + index) * width * 0.12
            + spark.drift * width * cycle * 0.22
          const y = height * 0.48 - cycle * height * 0.38
          context.beginPath()
          context.fillStyle = 'rgba(255, 151, 30, ' + alpha + ')'
          context.arc(x, y, spark.size * (1 - cycle * 0.52), 0, TAU)
          context.fill()
        })

        context.globalCompositeOperation = 'source-over'
      }

      if (!reducedMotion && !frozen) frameId = window.requestAnimationFrame(draw)
    }

    const redraw = () => {
      window.cancelAnimationFrame(frameId)
      resize()
      lastFrame = 0
      frameId = window.requestAnimationFrame(draw)
    }
    const observer = new ResizeObserver(redraw)
    observer.observe(canvas)
    redraw()

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(frameId)
    }
  }, [profile, visible, reducedMotion])

  return (
    <span className={className + ' procedural-flame'} aria-hidden="true">
      <canvas ref={canvasRef} className="procedural-flame__canvas" />
    </span>
  )
}

export default ProceduralFlame
