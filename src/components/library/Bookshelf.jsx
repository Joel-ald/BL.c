import Book from './Book.jsx'

function Bookshelf({ books, ready, selectedBookId, onSelectBook, onPreviewBook, visited = [] }) {
  const isFinalShelf = books.length === 1 && books[0]?.id === 23

  return (
    <div className={`bookshelf ${isFinalShelf ? 'bookshelf--final' : ''}`}>
      <div className="bookshelf__back" aria-hidden="true" />
      <div className="bookshelf__books">
        {books.map((book) => {
          const horizontal = book.id === 17 || book.id === 22
          const slotWidth = book.special ? '4.7rem' : horizontal ? '7.55rem' : `${book.width}px`

          return (
            <span
              className={`book-slot ${horizontal ? 'book-slot--horizontal' : ''} ${book.special ? 'book-slot--special' : ''}`}
              key={book.id}
              style={{
                '--book-delay': `${book.id * -90}ms`,
                '--book-index': book.id,
                '--book-reveal-delay': `${1050 + book.id * 42}ms`,
                '--moon-delay': `${book.id * -170}ms`,
                '--slot-width': slotWidth,
              }}
            >
              <Book
                book={book}
                disabled={!ready}
                selected={selectedBookId === book.id}
                visited={visited.includes(book.id)}
                onSelect={onSelectBook}
                onPreview={onPreviewBook}
                presentation={horizontal ? 'horizontal' : 'spine'}
              />
            </span>
          )
        })}
      </div>
      <div className="bookshelf__board" aria-hidden="true" />
    </div>
  )
}

export default Bookshelf
