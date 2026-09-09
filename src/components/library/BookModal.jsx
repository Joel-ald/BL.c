import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import MagicSymbol from './MagicSymbol.jsx'
import { bookChapters } from '../../data/bookChapters.js'
import { toRoman } from '../../data/toRoman.js'
import { chapterWorlds } from '../worlds/chapterWorlds.js'
import { ChapterPortal, ChapterPreview } from '../worlds/ChapterPortal.jsx'
import { ArrowLeft, ArrowRight, BookOpen, ZoomIn } from 'lucide-react'

const focusableSelector = 'button:not([disabled]), [href], input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])'

function BookModal({ book, onClose, onVisit, playPortal, stopPortalSound, muted, onToggleMuted }) {
  const [isOpen, setIsOpen] = useState(false)
  const [transition, setTransition] = useState(null)
  const [readingPage, setReadingPage] = useState(null)
  const worldOpen = Boolean(transition)
  const panelRef = useRef(null)
  const closeRef = useRef(null)
  const previewRef = useRef(null)
  const worldOpenRef = useRef(false)
  const previousWorldOpenRef = useRef(false)
  const pageNavigationRef = useRef(false)
  const chapter = bookChapters[book.id]
  const world = chapterWorlds[chapter?.world]
  const hasWorld = Boolean(chapter && world)
  const reading = hasWorld && readingPage !== null

  useEffect(() => {
    world?.preload?.().catch(() => {})
  }, [world])

  useEffect(() => stopPortalSound, [stopPortalSound])

  const returnToBook = () => {
    worldOpenRef.current = false
    setTransition(null)
  }

  useEffect(() => {
    worldOpenRef.current = worldOpen
  }, [worldOpen])

  useLayoutEffect(() => {
    if (!worldOpen && previousWorldOpenRef.current) previewRef.current?.focus()
    previousWorldOpenRef.current = worldOpen
  }, [worldOpen])

  useLayoutEffect(() => {
    if (pageNavigationRef.current) panelRef.current?.querySelector('.reading-navigation button:not(:disabled)')?.focus()
    pageNavigationRef.current = false
  }, [readingPage])

  useEffect(() => {
    const openTimer = window.setTimeout(() => setIsOpen(true), 420)
    return () => window.clearTimeout(openTimer)
  }, [book.id])

  useEffect(() => {
    const previousFocus = document.activeElement
    document.body.classList.add('modal-open')
    closeRef.current?.focus()

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (worldOpenRef.current) {
          playPortal('return')
          worldOpenRef.current = false
          setTransition(null)
          return
        }
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusRoot = worldOpenRef.current
        ? document.querySelector('.chapter-world-layer')
        : panelRef.current
      const focusable = Array.from(focusRoot?.querySelectorAll(focusableSelector) ?? [])
        .filter((element) => !element.closest('[inert]'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
      previousFocus?.focus()
    }
  }, [onClose, playPortal])

  return (
    <div
      className={`book-modal ${reading ? 'book-modal--reading' : ''}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <article
        ref={panelRef}
        className={`book-modal__panel ${reading ? 'is-reading' : ''} ${book.special ? 'book-modal__panel--special' : ''}`}
        data-reading-page={reading ? readingPage : undefined}
        style={{ '--open-book-color': book.color }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-modal-title"
        aria-describedby="book-modal-description"
        inert={worldOpen}
        aria-hidden={worldOpen || undefined}
      >
        <button
          ref={closeRef}
          className="modal-close"
          type="button"
          onClick={onClose}
          aria-label="Cerrar libro"
          title="Cerrar"
        >
          <span aria-hidden="true">×</span>
        </button>
        {hasWorld && <button className="reading-toggle" type="button"
          aria-label={reading ? 'Ver libro completo' : 'Ampliar lectura'}
          title={reading ? 'Ver libro completo' : 'Ampliar lectura'}
          aria-pressed={reading}
          onClick={() => setReadingPage(reading ? null : 0)}>
          {reading ? <BookOpen size={20} aria-hidden="true" /> : <ZoomIn size={20} aria-hidden="true" />}
        </button>}

        <div className="flip-book-stage">
          <div className={`flip-book ${isOpen ? 'is-open' : ''}`} aria-hidden={hasWorld ? undefined : true}>
            <div className="flip-book__layer flip-book__back" />
            <div className="flip-book__layer flip-book__page flip-book__page2" />
            <div className="flip-book__layer flip-book__page flip-book__page1" />
            <div className="flip-book__layer flip-book__page flip-book__page4" />
            <div className="flip-book__layer flip-book__page flip-book__page3" />
            <div className="flip-book__layer flip-book__page flip-book__page6">
              {hasWorld && (
                <section className="rain-book-page rain-book-page--right" inert={reading && readingPage === 0} aria-hidden={reading && readingPage === 0 || undefined}>
                  <span className="story-page__number">{toRoman(book.id)}</span>
                  <span className="story-divider" aria-hidden="true"><i>✦</i></span>
                  {chapter.paragraphs.map((paragraph, index) => (
                    <p key={paragraph} className={`story-prose ${index === 0 ? 'story-prose--dropcap' : ''}`}>
                      {index === 0 ? <><span>{paragraph[0]}</span>{paragraph.slice(1)}</> : paragraph}
                    </p>
                  ))}
                  <span className="story-divider story-divider--bottom" aria-hidden="true"><i>◆</i></span>
                </section>
              )}
            </div>
            <div className="flip-book__layer flip-book__page flip-book__page5">
              {hasWorld && (
                <section className="rain-book-page rain-book-page--left" inert={reading && readingPage === 1} aria-hidden={reading && readingPage === 1 || undefined}>
                  <span className="story-flourish story-flourish--top" aria-hidden="true">✦</span>
                  <ChapterPreview chapter={chapter} world={world} previewRef={previewRef}
                    disabled={!isOpen || worldOpen || reading && readingPage === 1}
                    onEnter={(origin) => {
                      if (worldOpenRef.current) return
                      worldOpenRef.current = true
                      playPortal('enter')
                      setTransition({ phase: 'entering', origin })
                    }} />
                  <p className="story-script story-script--small">
                    {chapter.caption}
                  </p>
                  <span className="story-flourish story-flourish--bottom" aria-hidden="true">◆</span>
                </section>
              )}
            </div>
            <div className="flip-book__layer flip-book__front" aria-hidden="true">
              <span className="flip-book__frame" />
              <MagicSymbol name={book.symbol} className="flip-book__symbol" />
              <span className="flip-book__title">
                {book.special ? 'El libro de Blanca' : book.title}
              </span>
              <span className="flip-book__spark">✦</span>
            </div>
          </div>

          {reading && <nav className="reading-navigation" aria-label="Páginas del libro">
            <button type="button" aria-label="Página anterior" title="Página anterior"
              disabled={readingPage === 0} onClick={() => { pageNavigationRef.current = true; setReadingPage(0) }}><ArrowLeft size={20} aria-hidden="true" /></button>
            <span aria-live="polite" aria-atomic="true">{readingPage + 1} / 2</span>
            <button type="button" aria-label="Página siguiente" title="Página siguiente"
              disabled={readingPage === 1} onClick={() => { pageNavigationRef.current = true; setReadingPage(1) }}><ArrowRight size={20} aria-hidden="true" /></button>
          </nav>}

          <div className={`flip-book-caption ${isOpen ? 'is-visible' : ''}`}>
            <h2 id="book-modal-title">{book.title}</h2>
            <p id="book-modal-description">{book.shortText}</p>
          </div>
        </div>

      </article>

      {worldOpen && hasWorld && (
        <ChapterPortal chapter={chapter} world={world} transition={transition}
          muted={muted} onToggleMuted={onToggleMuted}
          onEntered={() => {
            setTransition((current) => current ? { ...current, phase: 'open' } : null)
          }}
          onReady={() => onVisit(book.id)}
          onClose={() => {
            playPortal('return')
            setTransition((current) => current ? { ...current, phase: 'leaving', origin: previewRef.current?.getBoundingClientRect() ?? current.origin } : null)
          }}
          onExited={() => {
            if (transition.phase !== 'leaving') playPortal('return')
            returnToBook()
          }} />
      )}
    </div>
  )
}

export default BookModal
