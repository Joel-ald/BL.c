import Matter from 'matter-js'

const {
  Bodies,
  Body,
  Composite,
  Constraint,
  Engine,
  Vector,
} = Matter

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value))

function createLetterPhysics(root) {
  const engine = Engine.create()
  engine.gravity.x = 0
  engine.gravity.y = 0.64
  engine.gravity.scale = 0.001

  const entries = [...root.querySelectorAll('.hanging-rig')].map((rig, index) => {
    const pendulum = rig.querySelector('.physics-pendulum')
    const swing = rig.querySelector('.letter-swing')
    const string = rig.querySelector('.letter-string')
    const letter = rig.querySelector('.neon-letter')
    const letterRect = letter.getBoundingClientRect()
    const stringLength = Math.max(Number.parseFloat(getComputedStyle(string).height), 32)
    const bodyWidth = Math.max(letterRect.width * 0.82, 11)
    const bodyHeight = Math.max(letterRect.height * 0.8, 18)
    const anchor = {
      x: letterRect.left + letterRect.width / 2,
      y: letterRect.top - stringLength,
    }
    const direction = index % 2 === 0 ? -1 : 1
    const bodyPoint = { x: 0, y: -bodyHeight / 2 + 1 }
    const body = Bodies.rectangle(
      letterRect.left + letterRect.width / 2 + direction * 0.8,
      letterRect.top + letterRect.height / 2,
      bodyWidth,
      bodyHeight,
      {
        chamfer: { radius: Math.min(5, bodyWidth * 0.15) },
        density: 0.00085 + (index % 5) * 0.00016,
        friction: 0.22,
        frictionAir: 0.035 + (index % 4) * 0.006,
        restitution: 0.13 + (index % 3) * 0.035,
        slop: 0.02,
      },
    )
    const constraint = Constraint.create({
      pointA: anchor,
      bodyB: body,
      pointB: bodyPoint,
      length: stringLength,
      stiffness: 0.84 + (index % 4) * 0.018,
      damping: 0.05 + (index % 3) * 0.014,
    })

    Body.setAngle(body, direction * (0.036 + (index % 4) * 0.008))
    Body.setVelocity(body, {
      x: direction * (0.38 + (index % 5) * 0.055),
      y: 0,
    })
    Body.setAngularVelocity(body, -direction * (0.007 + (index % 3) * 0.002))
    Body.applyForce(body, body.position, {
      x: direction * body.mass * (0.000055 + (index % 3) * 0.000009),
      y: 0,
    })
    Composite.add(engine.world, [body, constraint])

    return {
      anchor,
      body,
      bodyPoint,
      pendulum,
      stringLength,
      swing,
    }
  })

  let frameId
  let previous = performance.now()
  let running = true

  const render = (timestamp) => {
    if (!running) return
    const delta = Math.min(timestamp - previous, 1000 / 60)
    previous = timestamp
    Engine.update(engine, delta)

    entries.forEach(({
      anchor,
      body,
      bodyPoint,
      pendulum,
      stringLength,
      swing,
    }) => {
      const attachment = Vector.add(body.position, Vector.rotate(bodyPoint, body.angle))
      const rawLineAngle = Math.atan2(
        attachment.x - anchor.x,
        attachment.y - anchor.y,
      )
      const maxLineAngle = Math.min(0.052, 9 / stringLength)
      const lineAngle = clamp(rawLineAngle, -maxLineAngle, maxLineAngle)
      const letterAngle = clamp(body.angle - lineAngle, -0.105, 0.105)

      pendulum.style.transform = 'rotate(' + lineAngle + 'rad)'
      swing.style.transform = 'rotate(' + letterAngle + 'rad)'
    })

    frameId = window.requestAnimationFrame(render)
  }

  frameId = window.requestAnimationFrame(render)

  return {
    stop() {
      running = false
      window.cancelAnimationFrame(frameId)
    },
    destroy() {
      running = false
      window.cancelAnimationFrame(frameId)
      entries.forEach(({ pendulum, swing }) => {
        pendulum.style.removeProperty('transform')
        swing.style.removeProperty('transform')
      })
      Composite.clear(engine.world, false)
      Engine.clear(engine)
    },
  }
}

export default createLetterPhysics
