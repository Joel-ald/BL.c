import { useCallback, useEffect, useRef, useState } from 'react'
import BookModal from './components/library/BookModal.jsx'
import LibraryScene from './components/library/LibraryScene.jsx'
import IntroScene from './components/intro/IntroScene.jsx'
import BirthdayWaiting from './components/intro/BirthdayWaiting.jsx'
import books from './data/books.js'
import { nextFairyLetter, readFairyKey, saveFairyKey } from './data/fairyKey.js'
import useMagicSound from './hooks/useMagicSound.js'
import useVisitedChapters from './hooks/useVisitedChapters.js'
import { useExperienceQuality } from './performance/useExperienceQuality.js'

function App() {
  const { tier, visible, reducedMotion } = useExperienceQuality()
  const [introKey, setIntroKey] = useState(0)
  const [introVisible, setIntroVisible] = useState(true)
  const [libraryVisible, setLibraryVisible] = useState(false)
  const [libraryReady, setLibraryReady] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const slimeTaps = useRef(0)
  const [slimeOpen, setSlimeOpen] = useState(() => { try { return localStorage.getItem('blanca-slime-22-v1') === 'open' } catch { return false } })
  const [fairyOpen, setFairyOpen] = useState(() => { try { return readFairyKey(window.localStorage) } catch { return false } })
  const [fairyProgress, setFairyProgress] = useState(0)
  const [fairyFlight, setFairyFlight] = useState(null)
  const { visited, markVisited } = useVisitedChapters()
  const {
    muted,
    playBook,
    playLock,
    playBookHover,
    playPortal,
    stopPortalSound,
    startLibraryAmbience,
    stopLibraryAmbience,
    toggleMuted,
    unlockAudio,
  } = useMagicSound()

  useEffect(() => {
    if (!fairyFlight) return
    const timer = setTimeout(() => {
      setFairyOpen(true)
      try { saveFairyKey(window.localStorage) } catch { /* Storage can be unavailable. */ }
      setFairyFlight(null)
      document.querySelector('[data-book-id="9"]')?.focus({ preventScroll: true })
    }, reducedMotion ? 200 : 2800)
    return () => clearTimeout(timer)
  }, [fairyFlight, reducedMotion])

  const pickFairyLetter = (index, element) => {
    if (!libraryReady || selectedBook || fairyOpen || fairyFlight) return
    const next = nextFairyLetter(fairyProgress, index)
    setFairyProgress(next)
    if (next !== fairyProgress) playBookHover({ id: 100 + index, special: false })
    if (next === 6) {
      const from = element.getBoundingClientRect()
      const to = document.querySelector('[data-book-id="9"]')?.getBoundingClientRect() ?? from
      setFairyFlight({ '--from-x': `${from.left - 40}px`, '--from-y': `${from.top - 70}px`, '--to-x': `${Math.max(0, Math.min(innerWidth - 100, to.left - 30))}px`, '--to-y': `${Math.max(80, Math.min(innerHeight - 120, to.top - 70))}px` })
      playPortal('enter')
    }
  }

  useEffect(() => {
    if (!libraryReady) {
      stopLibraryAmbience()
      return undefined
    }

    startLibraryAmbience()
    return stopLibraryAmbience
  }, [libraryReady, startLibraryAmbience, stopLibraryAmbience])

  useEffect(() => {
    document.body.classList.toggle('intro-lock', introVisible)
    return () => document.body.classList.remove('intro-lock')
  }, [introVisible])

  useEffect(() => {
    if (!libraryVisible || !visible || selectedBook || reducedMotion || tier === 'light' || !window.matchMedia('(pointer: fine)').matches) return undefined

    let frame = 0
    let pointerX = 0
    let pointerY = 0
    const updatePointer = () => {
      frame = 0
      const x = (pointerX / window.innerWidth - 0.5) * 10
      const y = (pointerY / window.innerHeight - 0.5) * 7
      document.documentElement.style.setProperty('--pointer-x', x + 'px')
      document.documentElement.style.setProperty('--pointer-y', y + 'px')
      document.documentElement.style.setProperty('--pointer-near-x', x * 0.72 + 'px')
      document.documentElement.style.setProperty('--pointer-near-y', y * 0.58 + 'px')
      document.documentElement.style.setProperty('--pointer-far-x', x * -0.34 + 'px')
      document.documentElement.style.setProperty('--pointer-far-y', y * -0.28 + 'px')
    }
    const handlePointerMove = (event) => {
      pointerX = event.clientX
      pointerY = event.clientY
      if (!frame) frame = window.requestAnimationFrame(updatePointer)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    return () => {
      window.cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.style.setProperty('--pointer-x', '0px')
      document.documentElement.style.setProperty('--pointer-y', '0px')
      document.documentElement.style.setProperty('--pointer-near-x', '0px')
      document.documentElement.style.setProperty('--pointer-near-y', '0px')
      document.documentElement.style.setProperty('--pointer-far-x', '0px')
      document.documentElement.style.setProperty('--pointer-far-y', '0px')
    }
  }, [libraryVisible, visible, selectedBook, reducedMotion, tier])

  const revealLibrary = useCallback(() => {
    setLibraryVisible(true)
  }, [])

  const finishIntro = useCallback(() => {
    setLibraryVisible(true)
    setLibraryReady(true)
    setIntroVisible(false)
  }, [])

  const replayIntro = useCallback(() => {
    setSelectedBook(null)
    setLibraryReady(false)
    setLibraryVisible(false)
    setIntroKey((value) => value + 1)
    setIntroVisible(true)
  }, [])

  const selectBook = useCallback((book) => {
    if (book.id === 22 && !book.unlocked) {
      slimeTaps.current = Math.min(22, slimeTaps.current + 1)
      if (slimeTaps.current === 22) {
        setSlimeOpen(true)
        try { localStorage.setItem('blanca-slime-22-v1', 'open') } catch { /* Keep the unlock in memory. */ }
        playBook(book.special)
        setSelectedBook({ ...book, unlocked: true })
        return
      }
    }
    if (!book.unlocked) { playLock(); return }
    playBook(book.special)
    setSelectedBook(book)
  }, [playBook, playLock])

  const closeBook = useCallback(() => setSelectedBook(null), [])

  if (new URLSearchParams(window.location.search).get('original') !== '1') return <BirthdayWaiting />

  return (
    <main
      className={'magic-shell ' + (introVisible ? 'is-intro-active' : 'is-library-active')}
      onPointerDownCapture={unlockAudio}
    >
      <div
        className={'library-stage ' + (libraryVisible ? 'is-visible' : '')}
        aria-hidden={!libraryVisible}
        data-paused={Boolean(selectedBook)}
      >
        {libraryVisible && <LibraryScene
          books={books.map(book => book.id === 9 ? { ...book, unlocked: fairyOpen } : book.id === 22 ? { ...book, unlocked: slimeOpen } : book)}
          onFairyLetter={pickFairyLetter}
          fairyProgress={fairyOpen ? 6 : fairyProgress}
          ready={libraryReady}
          selectedBookId={selectedBook?.id ?? null}
          visited={visited}
          onSelectBook={selectBook}
          onPreviewBook={playBookHover}
        />}
      </div>

      {introVisible && (
        <IntroScene
          key={introKey}
          onRevealLibrary={revealLibrary}
          onComplete={finishIntro}
        />
      )}

      <div className={'scene-controls ' + (libraryReady ? 'is-visible' : '')}>
        <button
          className="icon-button"
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? 'Activar sonidos' : 'Silenciar sonidos'}
          title={muted ? 'Activar sonidos' : 'Silenciar sonidos'}
        >
          <span className={'sound-glyph ' + (muted ? '' : 'sound-glyph--on')} aria-hidden="true">
            {muted ? '×' : '♪'}
          </span>
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={replayIntro}
          aria-label="Repetir introducción"
          title="Repetir introducción"
        >
          <span className="replay-glyph" aria-hidden="true">↻</span>
        </button>
      </div>

      {selectedBook && (
        <BookModal
          key={selectedBook.id}
          book={selectedBook}
          onClose={closeBook}
          onVisit={markVisited}
          playPortal={playPortal}
          stopPortalSound={stopPortalSound}
          muted={muted}
          onToggleMuted={toggleMuted}
        />
      )}
      {fairyFlight && <div className="fairy-key-flight" style={fairyFlight} aria-hidden="true"><img src={`${import.meta.env.BASE_URL}chapters/09/fairy.svg`} alt="" /><span /></div>}
      <span className="sr-only" role="status">{fairyOpen ? 'El libro IX está abierto.' : fairyProgress ? `${fairyProgress} letras encendidas.` : ''}</span>
    </main>
  )
}

export default App
