import MagicSymbol from './MagicSymbol.jsx'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { LockKeyhole, Sparkles } from 'lucide-react'
import { toRoman } from '../../data/toRoman.js'

const materials = ['storybook']
const accents = ['#f3b947', '#ffd66d', '#e9a83a', '#f7c85a']
function Book({ book, disabled, selected, visited, onSelect, onPreview, presentation = 'spine' }) {
  const [secret, setSecret] = useState(0)
  const [notice, setNotice] = useState(null)
  const bookRef = useRef(null)
  const wasSelected = useRef(selected)
  useEffect(() => {
    if (wasSelected.current && !selected && visited && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bookRef.current?.querySelector('.book__face')?.animate([
        { filter: 'brightness(1)' }, { filter: 'brightness(1.45)', offset: .3 }, { filter: 'brightness(1)' },
      ], { duration: 1600, easing: 'ease-out' })
    }
    wasSelected.current = selected
  }, [selected, visited])
  useEffect(() => {
    const dismiss = event => { if (event.type !== 'book-secret' || event.detail !== book.id) setNotice(null) }
    window.addEventListener('book-secret', dismiss)
    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', dismiss, true)
    return () => { window.removeEventListener('book-secret', dismiss); window.removeEventListener('resize', dismiss); window.removeEventListener('scroll', dismiss, true) }
  }, [book.id])
  useEffect(() => {
    if (!notice) return
    const timer = setTimeout(() => setNotice(null), 4200)
    return () => clearTimeout(timer)
  }, [notice])
  const select = event => {
    window.dispatchEvent(new CustomEvent('book-secret', { detail: book.id }))
    onSelect(book)
    if (book.unlocked) return
    const rect = event.currentTarget.getBoundingClientRect()
    const width = Math.min(264, window.innerWidth - 32)
    setSecret(value => value + 1)
    setNotice({ left: Math.max(16, Math.min(window.innerWidth - width - 16, rect.left + rect.width / 2 - width / 2)), top: rect.top > 125 ? rect.top - 110 : Math.min(window.innerHeight - 115, rect.bottom + 12), width })
  }
  const material = materials[(book.id - 1) % materials.length]
  const lightCover = book.color.toLowerCase().startsWith('#f')
  const style = {
    '--book-color': book.color,
    '--book-accent': accents[(book.id - 1) % accents.length],
    '--book-height': `${book.height}px`,
    '--book-width': `${book.width}px`,
    '--book-tilt': `${book.tilt}deg`,
  }

  return (
    <button
      ref={bookRef}
      className={`book book--${material} ${lightCover ? 'book--light' : ''} ${book.special ? 'book--special book--special-spine' : ''} ${presentation === 'flat' ? 'book--flat' : ''} ${presentation === 'horizontal' ? 'book--horizontal' : ''} ${selected ? 'book--selected' : ''}`}
      type="button"
      style={style}
      onClick={select}
      onFocus={() => !disabled && onPreview?.(book)}
      onPointerEnter={() => !disabled && onPreview?.(book)}
      disabled={disabled}
      aria-label={`${book.unlocked ? 'Abrir' : 'Sellado'} libro ${book.id}: ${book.title}`}
      aria-pressed={selected}
      aria-describedby={visited ? `visited-book-${book.id}` : undefined}
      title={!book.unlocked ? `${book.title} · Hay que encontrar la llave de este secreto.` : visited ? `${book.title} · Mundo visitado` : book.title}
    >
      <span className="book__pages" aria-hidden="true">
        <i />
      </span>
      {!book.unlocked && notice && createPortal(<span key={secret} className="book-secret-note" style={notice} role="status"><LockKeyhole size={19} aria-hidden="true" /><span>Este libro guarda un secreto. Hay que encontrar su llave.</span></span>, document.body)}
      <span className="book__face">
        <span className="book__headband" aria-hidden="true" />
        <span className="book__rib book__rib--one" aria-hidden="true" />
        <span className="book__rib book__rib--two" aria-hidden="true" />
        <span className="book__rib book__rib--three" aria-hidden="true" />
        <span className="book__ornament book__ornament--top" aria-hidden="true" />
        <span className="book__medallion">
          <span className="book__medallion-content">
            {book.unlocked ? <MagicSymbol name={book.symbol} className="book__symbol" /> : <LockKeyhole key={secret} size={18} strokeWidth={1.5} className={`book__symbol ${notice ? 'lock-awake' : ''}`} aria-hidden="true" />}
            {!book.special && <span className="book__number">{toRoman(book.id)}</span>}
          </span>
        </span>
        <span className="book__ornament book__ornament--bottom" aria-hidden="true" />
        <span className="book__footband" aria-hidden="true" />
        {visited && book.unlocked && <span className="book-visit-stamp" aria-hidden="true"><Sparkles size={11} strokeWidth={1.5} /></span>}
      </span>
      {visited && <span className="sr-only" id={`visited-book-${book.id}`}>Mundo visitado</span>}
      <span className="book__sparkles" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  )
}

export default Book
