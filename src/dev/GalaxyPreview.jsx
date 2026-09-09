import { createRoot } from 'react-dom/client'
import { ExperienceQualityProvider } from '../performance/ExperienceQuality.jsx'
import GalaxyWorld from '../components/worlds/GalaxyWorld.jsx'
import '../styles/global.css'
import '../styles/rain-world.css'
import '../styles/galaxy-world.css'
import '../styles/performance.css'

if (import.meta.env.DEV) {
  const params = new URLSearchParams(window.location.search)
  const time = Number(params.get('time') ?? 12)
  createRoot(document.getElementById('root')).render(
    <ExperienceQualityProvider>
      <GalaxyWorld capture={params.has('capture')} captureAge={Number.isFinite(time) ? Math.max(0, Math.min(time,60)) : 12}
        onClose={() => { window.location.href = '/' }} />
    </ExperienceQualityProvider>,
  )
}
