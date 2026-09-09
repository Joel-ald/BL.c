import RainWorld from '../library/RainWorld.jsx'
import RainSnapshot from './RainSnapshot.jsx'
import GalaxyWorld from './GalaxyWorld.jsx'
import HtmlWorld from './HtmlWorld.jsx'

// A scene provides onClose and accepts managedEntry; screenshots can use previewSrc.
export const chapterWorlds = {
  rain: { Scene: RainWorld, Snapshot: RainSnapshot },
  galaxy: { Scene: GalaxyWorld },
  html: { Scene: HtmlWorld, deferredReady: true },
}
