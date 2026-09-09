import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { ExperienceQualityProvider } from './performance/ExperienceQuality.jsx'
import './styles/global.css'
import './styles/intro.css'
import './styles/library.css'
import './styles/rain-world.css'
import './styles/responsive.css'
import './styles/chapter-portal.css'
import './styles/book-reading.css'
import './styles/galaxy-world.css'
import './styles/performance.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ExperienceQualityProvider>
      <App />
    </ExperienceQualityProvider>
  </StrictMode>,
)
