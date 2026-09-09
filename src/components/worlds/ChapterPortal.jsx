import { Component, Suspense, useCallback, useEffect, useRef } from 'react'
import { useExperienceQuality } from '../../performance/useExperienceQuality.js'

class WorldErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    return this.state.failed ? <div className="chapter-load-error" role="alert">
      <p>Este cielo no pudo abrirse.</p>
      <button onClick={this.props.onClose}>Volver al libro</button>
    </div> : this.props.children
  }
}

function ReadyWorld({ Scene, onReady, onClose, chapter, deferredReady, muted, onToggleMuted }) {
  const notified = useRef(false)
  const contentRef = useRef(null)
  const notifyReady = useCallback(() => {
    if (!notified.current) {
      notified.current = true
      contentRef.current?.querySelector('button')?.focus()
      onReady()
    }
  }, [onReady])
  useEffect(() => { if (!deferredReady) notifyReady() }, [deferredReady, notifyReady])
  return <div ref={contentRef}><Scene onClose={onClose} onReady={notifyReady} chapter={chapter} muted={muted} onToggleMuted={onToggleMuted} managedEntry /></div>
}

export function ChapterSnapshot({ chapter, world }) {
  const Snapshot = world.Snapshot
  return chapter.previewSrc
    ? <img className="chapter-snapshot" src={chapter.previewSrc} alt="" />
    : <Snapshot />
}

export function ChapterPreview({ chapter, world, previewRef, onEnter, disabled }) {
  const { visible, reducedMotion } = useExperienceQuality()
  return (
    <button
      ref={previewRef}
      className="rain-preview chapter-preview"
      data-shimmer={visible && !reducedMotion && !disabled}
      type="button"
      disabled={disabled}
      onClick={(event) => onEnter(event.currentTarget.getBoundingClientRect())}
      aria-label={chapter.entryLabel}
      title={chapter.entryLabel}
    >
      <ChapterSnapshot chapter={chapter} world={world} />
      <span className="rain-preview__frame" aria-hidden="true" />
      <span className="chapter-preview__light" aria-hidden="true" />
      <span className="chapter-preview__glint" aria-hidden="true" />
    </button>
  )
}

export function ChapterPortal({ chapter, world, transition, onEntered, onReady, onClose, onExited, muted, onToggleMuted }) {
  const { profile, visible, reducedMotion } = useExperienceQuality()
  const rootRef = useRef(null)
  const { phase, origin } = transition
  const Scene = world.Scene
  const moving = phase !== 'open'

  useEffect(() => {
    rootRef.current?.querySelector('button')?.focus()
  }, [phase])

  // FLIP starts at the clicked frame, not an unrelated rectangle in screen center.
  const style = {
    '--portal-x': `${origin.left}px`,
    '--portal-y': `${origin.top}px`,
    '--portal-sx': origin.width / window.innerWidth,
    '--portal-sy': origin.height / window.innerHeight,
    '--portal-center-x': `${origin.left + origin.width / 2}px`,
    '--portal-center-y': `${origin.top + origin.height / 2}px`,
  }

  return (
    <section ref={rootRef} className="chapter-world-layer" data-phase={phase}
      data-reduced={reducedMotion} style={style} role="dialog" aria-modal="true"
      aria-label={chapter.entryLabel}>
      {phase === 'open' ? <div className="chapter-world-scene">
        <WorldErrorBoundary onClose={onClose}>
          <Suspense fallback={<div className="chapter-loading" aria-busy="true" aria-label="Abriendo el mundo">
            <ChapterSnapshot chapter={chapter} world={world} />
            <button className="rain-world__back" onClick={onClose} aria-label="Volver al libro">←</button>
          </div>}>
            <ReadyWorld Scene={Scene} onReady={onReady} onClose={onClose} chapter={chapter} deferredReady={world.deferredReady} muted={muted} onToggleMuted={onToggleMuted} />
          </Suspense>
        </WorldErrorBoundary>
      </div> : (
        <>
          <div className="chapter-portal-flight" aria-hidden="true"
            onAnimationEnd={(event) => {
              if (event.target !== event.currentTarget) return
              if (phase === 'entering') onEntered()
              else onExited()
            }}>
            <ChapterSnapshot chapter={chapter} world={world} />
          </div>
          {visible && !reducedMotion && phase === 'entering' && (
            <div className="chapter-portal-sparks" aria-hidden="true">
              {Array.from({ length: profile.flameSparks * 2 }, (_, index) => (
                <i key={index} style={{ '--spark-angle': `${index * 137.5}deg`, '--spark-distance': `${45 + index % 4 * 24}px` }} />
              ))}
            </div>
          )}
        </>
      )}
      {moving && <button className="rain-world__back" onClick={onExited} aria-label="Volver al libro" title="Volver al libro"><span aria-hidden="true">←</span></button>}
    </section>
  )
}
