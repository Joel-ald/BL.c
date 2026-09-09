// Add each chapter here; the book and portal remain shared across all 23 books.
import { htmlChapters } from './htmlChapters.js'
import { buildHtmlChapters } from './htmlChapterConfig.js'

export const bookChapters = {
  1: {
    world: 'galaxy',
    previewSrc: `${import.meta.env?.BASE_URL ?? '/'}images/galaxy-preview.jpg`,
    entryLabel: 'Entrar al nacimiento de la primera luz',
    caption: 'Antes de su primer paso, una pequeña luz ya había encontrado su lugar entre las estrellas.',
    paragraphs: [
      'Al principio, todo estaba en silencio. Hasta que una chispa se atrevió a brillar y el cielo empezó a llenarse de posibilidades.',
      'Así comenzó la historia de nuestra princesa. Todavía no conocía el camino, pero ya llevaba dentro algo capaz de iluminarlo.',
    ],
  },
  6: {
    world: 'rain',
    entryLabel: 'Entrar al mundo de las seis gotas de lluvia',
    caption: 'La princesa caminaba bajo la lluvia, cuidando una luz diminuta entre sus manos.',
    paragraphs: [
      'Aquel año el cielo parecía no terminar nunca. La princesa avanzó despacio, mientras cada gota golpeaba el camino.',
      'No sabía cuándo volvería el sol; solo sabía que su pequeña luz seguía allí. Y con eso bastó para dar un paso más.',
    ],
  },
  ...buildHtmlChapters(htmlChapters, import.meta.env?.BASE_URL ?? '/'),
}
