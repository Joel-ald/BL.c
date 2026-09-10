// One entry per imported HTML. Copy the ready-to-fill example from CHAPTERS.md.
import { chapterCopy } from './chapterCopy.js'
const entries = {
  9: {
    title: 'La flor del nueve',
    shortText: 'Un jardín que guardaba una fecha especial.',
    html: 'chapters/09/index.html',
    preview: 'chapters/09/preview.jpg',
    caption: 'La princesa escuchó unos golpecitos. Al otro lado del cristal había una pequeña hada.',
    paragraphs: [
      'Acercó la mano y apareció una puerta de luz. El hada la esperaba junto a un sendero de hojas, como si llevara tiempo preparando aquella visita.',
      'En el jardín dormía una flor. No se abría cualquier día: guardaba nueve pequeños deseos y una fecha que la princesa conocía muy bien.',
    ],
  },
  23: {
    title: 'Misión: cumpleaños',
    shortText: 'Una última sorpresa, solo para ti.',
    html: 'chapters/23/index.html',
    preview: 'chapters/23/preview.jpg',
    caption: 'La princesa encontró una última nota. Esta vez, la aventura llevaba su nombre.',
    paragraphs: [
      'Había recorrido tantos caminos que casi olvidó detenerse a celebrar. Pero alguien había preparado una pequeña misión, de esas que se cumplen sonriendo.',
      'No era el final de su cuento. Era una pausa bonita para recordarle cuánto la quieren, antes de seguir llenando el mundo con su luz.',
    ],
  },
  2: {
    title: 'Pasos de luna',
    shortText: 'Hasta la noche encontraba motivos para sonreír.',
    html: 'chapters/02/index.html',
    preview: 'chapters/02/preview.jpg',
    caption: 'La princesa alzó la mirada. Arriba, la luna cuidaba de una pequeña estrella.',
    paragraphs: [
      'Todavía le quedaba mucho por descubrir. Pero aquella noche entendió algo: hasta una luz pequeñita podía hacer sonreír al cielo.',
      'Y siguió dando sus pasos, despacito, sin saber que ella también iluminaba el mundo de alguien más.',
    ],
  },
  3: {
    title: 'El jardín secreto',
    shortText: 'Había mundos enormes esperando a sus pequeños pasos.',
    html: 'chapters/03/index.html',
    preview: 'chapters/03/preview.jpg',
    caption: 'La princesa apartó unas hojas y encontró un bosque que parecía guardar todos los secretos del tiempo.',
    paragraphs: [
      'Entre árboles altísimos caminaban gigantes. Ella los miró con los ojos muy abiertos: el mundo era mucho más grande de lo que había imaginado.',
      'Y en vez de volver atrás, dio otro pasito. A veces, las aventuras más bonitas empiezan con un poquito de curiosidad.',
    ],
  },
  4: {
    title: 'Cuatro deseos',
    shortText: 'Cuatro pequeños frascos, cuatro maneras de soñar.',
    html: 'chapters/04/index.html',
    preview: 'chapters/04/preview.jpg',
    caption: 'La princesa encontró cuatro deseos suspendidos, esperando a que alguien los dejara volar.',
    paragraphs: [
      'Uno guardaba calma. Otro, un rayito de sol. Había flores que no se marchitaban y estrellas que todavía no tenían nombre.',
      'Los abrió despacito. Y descubrió que desear algo bonito para alguien también era una forma de abrazarlo.',
    ],
  },
  5: {
    title: 'El laboratorio de cristal',
    shortText: 'La curiosidad tenía todos los colores.',
    html: 'chapters/05/index.html',
    preview: 'chapters/05/preview.jpg',
    caption: 'Entre frascos y destellos, la princesa encontró un lugar donde cada pregunta podía cambiar de color.',
    paragraphs: [
      'Mezcló una gotita de curiosidad con otra de paciencia. A veces no pasaba nada; otras, aparecía algo que jamás había visto.',
      'No necesitaba saberlo todo. Le bastaba con conservar esas ganas tan suyas de descubrir un poquito más.',
    ],
  },
  7: {
    title: 'Tu luz',
    shortText: 'Ni los días grises podían apagar tu luz.',
    html: 'chapters/07/index.html',
    preview: 'chapters/07/preview.jpg',
    caption: 'Después de la lluvia, la princesa encontró una luz que parecía reconocerla.',
    paragraphs: [
      'La cuidó entre sus manos. No hacía falta que alumbrara todo el cielo: bastaba con que siguiera allí, acompañando su siguiente paso.',
      'Y cuando volvió a mirar, comprendió que aquella luz también era suya. Incluso en los días difíciles, nunca había dejado de brillar.',
    ],
  },
  8: {
    title: 'El mapa invisible',
    shortText: 'Hay caminos que llevan a quienes te quieren.',
    html: 'chapters/08/index.html',
    preview: 'chapters/08/preview.jpg',
    caption: 'La princesa encontró unas huellitas. No aparecían en ningún mapa, pero parecían conocer el camino.',
    paragraphs: [
      'Las siguió despacito, entre árboles y pequeñas luces. Alguien la esperaba al final, sin reloj y con muchas ganas de verla.',
      'Entonces entendió que no todos los tesoros se guardan en cofres. Algunos corren hacia ti y mueven la colita cuando llegas.',
    ],
  },
  10: {
    title: 'Una bonita reacción',
    shortText: 'Lo bonito también necesita su tiempo.',
    html: 'chapters/10/index.html',
    preview: 'chapters/10/preview.jpg',
    caption: 'La princesa encendió una pequeña llama y se quedó mirando lo que ocurría dentro del cristal.',
    paragraphs: [
      'Al principio parecía que nada cambiaba. Después llegó una burbuja, luego otra, y el silencio empezó a llenarse de sorpresas.',
      'Ella también estaba creciendo así: a su manera, sin tener que parecerse a nadie. Todavía le esperaban cosas muy bonitas.',
    ],
  },
  11: {
    title: 'El viaje de papel',
    shortText: 'Un barquito pequeño también puede llegar lejos.',
    html: 'chapters/11/index.html',
    preview: 'chapters/11/preview.jpg',
    caption: 'La princesa dobló un pedacito de papel, lo acercó al agua y dejó que empezara su viaje.',
    paragraphs: [
      'El barquito no llevaba un camino dibujado. Solo sus pliegues, un poquito de valor y todo un río por conocer.',
      'Ella lo acompañó con la mirada. No sabía qué había después de la curva, pero por primera vez eso también le pareció bonito.',
    ],
  },
  13: {
    title: 'La puerta violeta',
    shortText: 'Dentro de lo pequeño cabía otro universo.',
    html: 'chapters/13/index.html',
    preview: 'chapters/13/preview.jpg',
    caption: 'La princesa abrió una puerta violeta. Detrás, lo más pequeño del mundo parecía bailar entre estrellas.',
    paragraphs: [
      'Acercó una pieza a otra y descubrió que juntas podían convertirse en algo nuevo. Hasta una gotita de agua guardaba su propio secreto.',
      'Nunca había dejado de preguntarse qué había un poquito más allá. Y esa curiosidad suya seguía abriéndole puertas.',
    ],
  },
  17: {
    title: 'Un poquito de abrigo',
    shortText: 'También merecías parar y dejarte cuidar.',
    html: 'chapters/17/index.html',
    preview: 'chapters/17/preview.jpg',
    caption: 'La nieve cayó despacito. La princesa se quedó un momento junto a una compañía que no necesitaba palabras.',
    paragraphs: [
      'No había que llegar a ninguna parte ni demostrar nada. Bastaban una bufanda, una caricia y el silencio suave de aquella tarde.',
      'Después de tanto caminar, también merecía descansar. Que alguien la cuidara un ratito, como ella sabía cuidar a los demás.',
    ],
  },
  19: {
    title: 'Donde siempre hay luz',
    shortText: 'Un hogar para cada uno de tus días.',
    html: 'chapters/19/index.html',
    preview: 'chapters/19/preview.jpg',
    caption: 'Al final del sendero había una casita que guardaba un abrazo para cada hora del día.',
    paragraphs: [
      'La princesa vio cambiar el cielo: primero azul, después rosado, después lleno de estrellas. La casita seguía allí.',
      'Y pensó que sentirse en casa debía de ser eso: poder llegar tal como eres, sabiendo que alguien se alegra de verte.',
    ],
  },
  21: {
    title: 'Entre tinta y flores',
    shortText: 'Que nunca te falten las ganas de jugar.',
    html: 'chapters/21/index.html',
    preview: 'chapters/21/preview.jpg',
    caption: 'La princesa encontró un tablero dibujado a mano y se sentó a jugar, sin mirar la hora.',
    paragraphs: [
      'Una cruz por aquí, un círculo por allá. A veces ganaba; otras, tocaba empezar de nuevo. Lo mejor era poder quedarse un ratito más.',
      'Había crecido mucho, pero seguía siendo ella: curiosa, creativa y con un mundo entero por descubrir. Ojalá nunca le faltaran momentos así.',
    ],
  },
}
export const htmlChapters = Object.fromEntries(Object.entries(entries).map(([id, entry]) => [id, { ...entry, ...chapterCopy[id] }]))
