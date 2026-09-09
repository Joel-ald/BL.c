import MagicSymbol from './MagicSymbol.jsx'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { LockKeyhole } from 'lucide-react'
import { toRoman } from '../../data/toRoman.js'

const materials = ['storybook']
const accents = ['#f3b947', '#ffd66d', '#e9a83a', '#f7c85a']
function Book({ book, disabled, selected, visited, onSelect, onPreview, presentation = 'spine' }) {
  const [secret, setSecret] = useState(0)
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
      className={`book book--${material} ${lightCover ? 'book--light' : ''} ${book.special ? 'book--special book--special-spine' : ''} ${presentation === 'flat' ? 'book--flat' : ''} ${presentation === 'horizontal' ? 'book--horizontal' : ''} ${selected ? 'book--selected' : ''}`}
      type="button"
      style={style}
      onClick={() => book.unlocked ? onSelect(book) : setSecret(value => value + 1)}
      onFocus={() => !disabled && onPreview?.(book)}
      onPointerEnter={() => !disabled && onPreview?.(book)}
      disabled={disabled}
      aria-label={`${book.unlocked ? 'Abrir' : 'Sellado'} libro ${book.id}: ${book.title}`}
      aria-pressed={selected}
      aria-describedby={visited ? `visited-book-${book.id}` : undefined}
      title={!book.unlocked ? `${book.title} · La llave de este secreto aún está por llegar` : visited ? `${book.title} · Mundo visitado` : book.title}
    >
      <span className="book__pages" aria-hidden="true">
        <i />
      </span>
      {!book.unlocked && secret > 0 && createPortal(<span key={secret} className="book__secret" role="status">Descubre el secreto</span>, document.body)}
      <span className="book__face">
        <span className="book__headband" aria-hidden="true" />
        <span className="book__rib book__rib--one" aria-hidden="true" />
        <span className="book__rib book__rib--two" aria-hidden="true" />
        <span className="book__rib book__rib--three" aria-hidden="true" />
        <span className="book__ornament book__ornament--top" aria-hidden="true" />
        <span className="book__medallion">
          <span className="book__medallion-content">
            {book.unlocked ? <MagicSymbol name={book.symbol} className="book__symbol" /> : <LockKeyhole size={18} strokeWidth={1.5} className="book__symbol" aria-hidden="true" />}
            {!book.special && <span className="book__number">{toRoman(book.id)}</span>}
          </span>
        </span>
        <span className="book__ornament book__ornament--bottom" aria-hidden="true" />
        <span className="book__footband" aria-hidden="true" />
        {visited && <span className="book__visited" aria-hidden="true"><i className="book__visited-thread" /><i className="book__visited-seal" /></span>}
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
