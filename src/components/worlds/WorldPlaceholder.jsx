import MagicSymbol from '../library/MagicSymbol.jsx'

function WorldPlaceholder({ book }) {
  return (
    <div className={`world-placeholder ${book.special ? 'world-placeholder--special' : ''}`}>
      <span className="world-placeholder__halo" aria-hidden="true" />
      <MagicSymbol name={book.symbol} className="world-placeholder__symbol" />
      <p className="world-placeholder__label">
        {book.special ? 'Tu siguiente capítulo comienza aquí.' : `Mundo ${book.id} preparado para despertar.`}
      </p>
    </div>
  )
}

export default WorldPlaceholder
