import { htmlChapters } from './htmlChapters.js'
import { bookChapters } from './bookChapters.js'

const books = [
  { id: 1, age: 1, title: 'La primera luz', shortText: 'El comienzo de una historia que ya brillaba.', color: '#b51f4f', symbol: 'star', unlocked: true, special: false, height: 118, width: 38, tilt: -3 },
  { id: 2, age: 2, title: 'Pasos de luna', shortText: 'Curiosidad, asombro y dos pequeños pasos.', color: '#086b70', symbol: 'moon', unlocked: true, special: false, height: 132, width: 42, tilt: 1 },
  { id: 3, age: 3, title: 'El jardín secreto', shortText: 'Donde cada juego podía abrir una puerta.', color: '#f4ead8', symbol: 'leaf', unlocked: true, special: false, height: 124, width: 36, tilt: -1 },
  { id: 4, age: 4, title: 'Cuatro deseos', shortText: 'Una chispa distinta para cada estación.', color: '#643b91', symbol: 'spark', unlocked: true, special: false, height: 138, width: 44, tilt: 2 },
  { id: 5, age: 5, title: 'La llave dorada', shortText: 'La imaginación aprendió a girar cerraduras.', color: '#1d5da7', symbol: 'key', unlocked: true, special: false, height: 128, width: 39, tilt: -2 },
  { id: 6, age: 6, title: 'Seis gotas de lluvia', shortText: 'La princesa siguió caminando mientras la lluvia guardaba su pequeña luz.', color: '#08766d', symbol: 'rain', unlocked: true, special: false, height: 143, width: 41, tilt: 1 },
  { id: 7, age: 7, title: 'El mapa invisible', shortText: 'Los caminos aparecían al atreverse.', color: '#f6ecdc', symbol: 'map', unlocked: true, special: false, height: 127, width: 43, tilt: 3 },
  { id: 8, age: 8, title: 'La torre de cristal', shortText: 'Una ventana abierta a todos los quizá.', color: '#235fa5', symbol: 'diamond', unlocked: true, special: false, height: 139, width: 38, tilt: -2 },
  { id: 9, age: 9, title: 'Nueve constelaciones', shortText: 'El cielo empezó a guardar sus nombres.', color: '#aa204d', symbol: 'constellation', unlocked: true, special: false, height: 135, width: 45, tilt: 1 },
  { id: 10, age: 10, title: 'El reloj de cobre', shortText: 'El tiempo dejó un secreto entre sus agujas.', color: '#5e398d', symbol: 'clock', unlocked: true, special: false, height: 146, width: 40, tilt: 0 },
  { id: 11, age: 11, title: 'Bosque de voces', shortText: 'Las risas hicieron eco entre los árboles.', color: '#087267', symbol: 'tree', unlocked: true, special: false, height: 130, width: 42, tilt: -2 },
  { id: 12, age: 12, title: 'El año del cometa', shortText: 'Una estela valiente cruzó el horizonte.', color: '#f3e7d3', symbol: 'comet', unlocked: true, special: false, height: 142, width: 39, tilt: 2 },
  { id: 13, age: 13, title: 'La puerta violeta', shortText: 'Detrás esperaba una versión más libre.', color: '#613b91', symbol: 'door', unlocked: true, special: false, height: 136, width: 44, tilt: -1 },
  { id: 14, age: 14, title: 'Catorce mareas', shortText: 'Aprender a volver también fue avanzar.', color: '#1e62aa', symbol: 'wave', unlocked: true, special: false, height: 148, width: 41, tilt: 2 },
  { id: 15, age: 15, title: 'El baile del fuego', shortText: 'La alegría descubrió su propio ritmo.', color: '#b02248', symbol: 'flame', unlocked: true, special: false, height: 133, width: 38, tilt: 0 },
  { id: 16, age: 16, title: 'Cartas al futuro', shortText: 'Promesas escritas para la Blanca de mañana.', color: '#0a716d', symbol: 'letter', unlocked: true, special: false, height: 145, width: 45, tilt: -3 },
  { id: 17, age: 17, title: 'La brújula valiente', shortText: 'El norte apareció al confiar en el corazón.', color: '#f5ead7', symbol: 'compass', unlocked: true, special: false, height: 138, width: 40, tilt: 2 },
  { id: 18, age: 18, title: 'Dieciocho campanas', shortText: 'Cada elección sonó como un nuevo comienzo.', color: '#673b97', symbol: 'bell', unlocked: true, special: false, height: 149, width: 43, tilt: -1 },
  { id: 19, age: 19, title: 'El puente azul', shortText: 'Entre lo conocido y todo lo posible.', color: '#205ca3', symbol: 'bridge', unlocked: true, special: false, height: 137, width: 39, tilt: 2 },
  { id: 20, age: 20, title: 'La casa de las estrellas', shortText: 'Un refugio para sueños de cielo abierto.', color: '#ad214c', symbol: 'house', unlocked: true, special: false, height: 146, width: 44, tilt: 0 },
  { id: 21, age: 21, title: 'El sendero ámbar', shortText: 'La luz propia marcó el siguiente paso.', color: '#08736a', symbol: 'path', unlocked: true, special: false, height: 140, width: 41, tilt: -2 },
  { id: 22, age: 22, title: 'La víspera encantada', shortText: 'Todo el bosque contuvo la respiración.', color: '#f4e7d2', symbol: 'crown', unlocked: true, special: false, height: 150, width: 45, tilt: 1 },
  { id: 23, age: 23, title: 'El capítulo que sigue', shortText: 'La historia que solo tú puedes continuar.', color: '#65409a', symbol: 'star', unlocked: true, special: false, height: 151, width: 46, tilt: -2 },
]

export default books.map(book => htmlChapters[book.id]
  ? { ...book, title: htmlChapters[book.id].title, shortText: htmlChapters[book.id].shortText }
  : book).map(book => ({ ...book, shortText: bookChapters[book.id]?.shortText ?? book.shortText, unlocked: Boolean(bookChapters[book.id]) }))
