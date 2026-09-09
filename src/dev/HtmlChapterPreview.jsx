import { createRoot } from 'react-dom/client'
import { useState } from 'react'
import { ExperienceQualityProvider } from '../performance/ExperienceQuality.jsx'
import BookModal from '../components/library/BookModal.jsx'
import Book from '../components/library/Book.jsx'
import books from '../data/books.js'
import { bookChapters } from '../data/bookChapters.js'
import '../styles/global.css'
import '../styles/library.css'
import '../styles/rain-world.css'
import '../styles/chapter-portal.css'
import '../styles/book-reading.css'
import '../styles/performance.css'

const noop = () => {}
export function TestChapter() {
  const [open,setOpen] = useState(true)
  const [visited,setVisited] = useState(false)
  const [muted,setMuted] = useState(true)
  return <main style={{display:'grid',placeItems:'center',height:'100dvh'}} data-visited={visited}>
    <Book book={books[1]} visited={visited} onSelect={()=>setOpen(true)} />
    {open && <BookModal book={books[1]} onClose={()=>setOpen(false)} onVisit={()=>setVisited(true)}
      muted={muted} onToggleMuted={()=>setMuted(v=>!v)} playPortal={noop} stopPortalSound={noop} />}
  </main>
}
if (import.meta.env.DEV) {
  bookChapters[2] = { world:'html', title:'Pasos de luna', htmlSrc:'/dev/fixtures/chapter.html',
    previewSrc:'/images/galaxy-preview.jpg', entryLabel:'Entrar a Pasos de luna',
    caption:'La princesa encontro una estrella.', paragraphs:['Y la llevo consigo.'] }
  const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'))
  if (import.meta.hot) import.meta.hot.data.root = root
  root.render(<ExperienceQualityProvider><TestChapter /></ExperienceQualityProvider>)
}
