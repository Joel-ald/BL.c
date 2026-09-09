// The pages tell the story; each world has its own message.
const lines = {
  "1": [
    "Un pequeño comienzo con todo por descubrir.",
    "El 9 de septiembre de 2003 comenzó la historia de una pequeña princesa.",
    "Todavía no sabía cuántas cosas le esperaban. Por ahora bastaba con abrir los ojos y descubrir un mundo que también empezaba a conocerla.",
    "Así llegó Blanca. Pequeñita y con toda una historia por delante. Una que se iría escribiendo poco a poco."
  ],
  "2": [
    "Dos pequeños pasos bajo el mismo cielo.",
    "La princesa levantó la mirada y encontró una luna que parecía sonreír.",
    "A su lado brillaba una estrellita. Era pequeña, pero tenía un lugar en aquel cielo enorme.",
    "La princesa se quedó mirándolas un ratito. Había cosas que todavía no entendía, pero que ya le parecían bonitas."
  ],
  "3": [
    "El mundo era más grande de lo que imaginaba.",
    "Entre unas hojas apareció un bosque lleno de sonidos nuevos.",
    "La princesa se acercó despacio. Detrás de los árboles había criaturas enormes y un camino que no conocía.",
    "Al principio sintió miedo. Después dio un pasito más, con cuidado, y descubrió que lo desconocido también podía despertar asombro."
  ],
  "4": [
    "Cuatro deseos para guardar con ilusión.",
    "La princesa encontró cuatro pequeños frascos. Cada uno guardaba algo distinto.",
    "Había colores y destellos que parecían querer salir a conocer el mundo. Ella los miraba intentando adivinar qué escondían.",
    "Los abrió con cuidado. Y por un momento imaginó todas las cosas bonitas que le gustaría encontrar más adelante."
  ],
  "5": [
    "Una pregunta siempre traía otra.",
    "Unos frascos de colores llamaron la atención de la princesa.",
    "Se acercó para mirar mejor. Quería saber qué había dentro, por qué cambiaban y qué pasaría al juntar unas cosas con otras.",
    "Así empezó otra aventura. Una hecha de preguntas, pequeños intentos y la emoción de descubrir algo por primera vez."
  ],
  "6": [
    "Incluso en la lluvia había un siguiente paso.",
    "En el cuento también había caminos bajo la lluvia.",
    "La princesa caminaba despacio, cuidando una pequeña luz. Cuando necesitaba parar, buscaba un lugar donde descansar.",
    "No podía hacer que las nubes se fueran de inmediato. Pero el camino seguía allí y, más allá de la lluvia, también había cielo."
  ],
  "7": [
    "Un pasito más. Y después otro.",
    "La princesa encontró un pequeño cubo intentando subir.",
    "A veces avanzaba y otras tenía que volver a intentarlo. Ella se quedó a su lado, siguiendo cada pequeño movimiento.",
    "No llegó arriba de una sola vez. Lo consiguió poco a poco, sin que una caída decidiera el final de su historia."
  ],
  "8": [
    "Unas huellitas llevaban a una bonita compañía.",
    "La princesa encontró un camino que no aparecía en ningún mapa.",
    "Lo siguió entre árboles y pequeñas luces. Unas huellitas le indicaban por dónde ir, como si alguien hubiera preparado el recorrido.",
    "Al final había una compañía feliz de verla. Algunos caminos eran bonitos por quien esperaba al otro lado."
  ],
  "10": [
    "La curiosidad seguía creciendo con ella.",
    "La princesa volvió a detenerse frente al cristal.",
    "Una pequeña llama calentaba el frasco. Primero no parecía pasar nada. Después apareció una burbuja y enseguida quiso saber por qué.",
    "Cuanto más descubría, más preguntas tenía. La ciencia se parecía a un cuento al que siempre le quedaba otra página."
  ],
  "11": [
    "El río no se recorría en soledad.",
    "La princesa dejó un barquito de papel sobre el agua.",
    "Lo vio avanzar despacio. Parecía tan pequeño en aquel río que se quedó cerca, acompañándolo con la mirada.",
    "Después aparecieron otros barquitos. Cada uno tenía su forma, pero podían compartir el viaje y hacerse compañía."
  ],
  "13": [
    "Detrás de una puerta cabía todo un mundo.",
    "La princesa abrió una puerta violeta y encontró algo que nunca había visto tan de cerca.",
    "Unas piezas pequeñas giraban frente a ella. Al juntarlas aparecían formas nuevas, como si cada una guardara parte de una respuesta.",
    "Se quedó un rato más. Entender cómo estaban hechas las cosas le gustaba tanto como descubrirlas."
  ],
  "17": [
    "También había lugar para una pausa.",
    "La princesa llegó a un rincón tranquilo mientras caía la nieve.",
    "Allí encontró una pequeña compañía bien abrigada. No hacía falta correr ni resolver nada. Podía quedarse un momento.",
    "Después de tantas páginas, el cuento también tenía espacio para descansar. Y ella decidió disfrutarlo."
  ],
  "19": [
    "Una casita donde poder estar tranquila.",
    "Al final de un sendero apareció una casita.",
    "La princesa vio cómo cambiaba el cielo a su alrededor. Llegaba la tarde, se encendían las ventanas y todo parecía ir un poco más despacio.",
    "Se imaginó un lugar donde sentirse segura. Donde estar con personas que la cuidaran y poder ser ella misma."
  ],
  "21": [
    "Una pausa entre tinta y flores.",
    "La princesa encontró un pequeño tablero dibujado a mano.",
    "Se sentó a jugar. Por un rato no había caminos que recorrer ni preguntas que resolver. Solo una casilla y el siguiente turno.",
    "A veces ganaba y otras empezaba de nuevo. Lo importante era recordar que en su historia también había tiempo para pasarlo bien."
  ],
  "23": [
    "Veintitrés años. Y muchas páginas por delante.",
    "La princesa llegó a una página que tenía una sorpresa esperando.",
    "Era 9 de septiembre otra vez. Habían pasado veintitrés años desde el comienzo de su historia y todavía quedaba muchísimo por vivir.",
    "Pero antes de seguir había algo importante que hacer. Dejar las prisas un momento y celebrar su cumpleaños."
  ]
}
export const chapterCopy = Object.fromEntries(Object.entries(lines).map(([id, [shortText, caption, ...paragraphs]]) => [id, { shortText, caption, paragraphs }]))
