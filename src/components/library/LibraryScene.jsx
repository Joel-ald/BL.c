import BirthdaySign from '../intro/BirthdaySign.jsx'
import Bookshelf from './Bookshelf.jsx'
import { useExperienceQuality } from '../../performance/useExperienceQuality.js'

const dust = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  left: `${4 + ((index * 37) % 92)}%`,
  top: `${8 + ((index * 53) % 78)}%`,
  delay: `${(index % 8) * -0.7}s`,
  duration: `${5 + (index % 5)}s`,
}))

const hangingStars = [
  { id: 1, left: '7%', length: '8.5rem', size: '1.7rem', color: '#ffd75f', delay: '-1.2s' },
  { id: 2, left: '17%', length: '13rem', size: '1.15rem', color: '#ff8db8', delay: '-3.4s' },
  { id: 3, left: '29%', length: '6.8rem', size: '1.35rem', color: '#65dce7', delay: '-2.1s' },
  { id: 4, left: '71%', length: '7.4rem', size: '1.3rem', color: '#b991ff', delay: '-4.3s' },
  { id: 5, left: '83%', length: '12.2rem', size: '1.1rem', color: '#6de0bc', delay: '-0.8s' },
  { id: 6, left: '94%', length: '9rem', size: '1.75rem', color: '#ffd75f', delay: '-2.8s' },
]

const shelfMagic = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${8 + ((index * 29) % 84)}%`,
  size: `${2 + (index % 4)}px`,
  delay: `${(index % 7) * -0.65}s`,
  duration: `${3.6 + (index % 5) * 0.6}s`,
  drift: `${-18 + ((index * 11) % 36)}px`,
}))

function Bookcase({ label, rows, ready, selectedBookId, onSelectBook, onPreviewBook, visited }) {
  const { profile } = useExperienceQuality()
  return (
    <section className="bookcase-float" aria-label={label}>
      <div className="bookcase">
        <span className="bookcase__crown" aria-hidden="true">
          <i />
        </span>
        <span className="bookcase__finial bookcase__finial--left" aria-hidden="true" />
        <span className="bookcase__finial bookcase__finial--right" aria-hidden="true" />
        <span className="bookcase__cap" aria-hidden="true" />
        {rows.map((row, index) => (
          <Bookshelf
            key={`shelf-${index}`}
            books={row}
            ready={ready}
            selectedBookId={selectedBookId}
            visited={visited}
            onSelectBook={onSelectBook}
            onPreviewBook={onPreviewBook}
          />
        ))}
        <span className="bookcase__base" aria-hidden="true" />
        <span className="bookcase__foot bookcase__foot--left" aria-hidden="true" />
        <span className="bookcase__foot bookcase__foot--right" aria-hidden="true" />
      </div>

      <span className="bookcase__underlight" aria-hidden="true" />
      <div className="bookcase-magic" aria-hidden="true">
        {shelfMagic.slice(0, profile.shelfParticles).map((particle) => (
          <span
            key={particle.id}
            style={{
              '--magic-delay': particle.delay,
              '--magic-drift': particle.drift,
              '--magic-duration': particle.duration,
              '--magic-left': particle.left,
              '--magic-size': particle.size,
            }}
          />
        ))}
      </div>
    </section>
  )
}

function LibraryScene({ books, ready, selectedBookId, onSelectBook, onPreviewBook, visited }) {
  const { profile } = useExperienceQuality()
  const rows = [
    books.slice(0, 6),
    books.slice(6, 12),
    books.slice(12, 17),
    books.slice(17, 22),
    books.slice(22, 23),
  ]

  return (
    <section className={`library-world ${ready ? 'is-ready' : ''}`} aria-label="Biblioteca encantada de Blanca">
      <div className="candle-light-field" aria-hidden="true" />
      <div className="library-architecture" aria-hidden="true">
        <span className="moon-window" />
        <span className="ceiling-arch ceiling-arch--left" />
        <span className="ceiling-arch ceiling-arch--right" />
      </div>

      <div className="ambient-layer" aria-hidden="true">
        {hangingStars.map((star) => (
          <span
            className="hanging-star"
            key={star.id}
            style={{
              '--star-color': star.color,
              '--star-delay': star.delay,
              '--star-left': star.left,
              '--star-length': star.length,
              '--star-size': star.size,
            }}
          >
            <i />
            <b />
          </span>
        ))}
        {dust.slice(0, profile.dust).map((particle) => (
          <span
            className="dust-speck"
            key={particle.id}
            style={{
              '--dust-left': particle.left,
              '--dust-top': particle.top,
              '--dust-delay': particle.delay,
              '--dust-duration': particle.duration,
            }}
          />
        ))}
      </div>

      <div className="library-grid">
        <div className="ceremony-space">
          <BirthdaySign />
        </div>

        <Bookcase
          label="Librero encantado con los libros 1 al 23"
          rows={rows}
          ready={ready}
          selectedBookId={selectedBookId}
          visited={visited}
          onSelectBook={onSelectBook}
          onPreviewBook={onPreviewBook}
        />
      </div>

    </section>
  )
}

export default LibraryScene
