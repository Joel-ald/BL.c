import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react'
import { useExperienceQuality } from '../../performance/useExperienceQuality.js'
import bridge from './htmlWorldBridge.js?raw'
import '../../styles/html-world.css'

export default function HtmlWorld({ chapter, onClose, onReady, muted = true, onToggleMuted }) {
  const { profile, tier, visible, reducedMotion } = useExperienceQuality()
  const frameRef = useRef(null)
  const backRef = useRef(null)
  const [documentState, setDocumentState] = useState({ html: '', failed: false })
  const [attempt, setAttempt] = useState(0)
  const ready = documentState.ready === true
  const stateRef = useRef(null)
  const callbacksRef = useRef({ onClose, onReady })
  useEffect(() => { callbacksRef.current = { onClose, onReady } }, [onClose, onReady])
  useEffect(() => {
    stateRef.current = { tier, visible, muted, reducedMotion, fps: profile.flameFps, pixelRatio: profile.pixelRatio }
    frameRef.current?.contentWindow?.postMessage({ type: 'blanca:state', state: stateRef.current }, '*')
  }, [tier, visible, muted, reducedMotion, profile])

  useEffect(() => {
    if (reducedMotion) return undefined
    const controller = new AbortController()
    let failed = false
    const timeout = window.setTimeout(() => {
      controller.abort()
      setDocumentState({ html: '', failed: true })
    }, 15000)
    const receive = event => {
      if (event.source !== frameRef.current?.contentWindow) return
      if (event.data?.type === 'blanca:ready') {
        if (failed || controller.signal.aborted) return
        window.clearTimeout(timeout)
        frameRef.current.contentWindow.postMessage({ type: 'blanca:state', state: stateRef.current }, '*')
        setDocumentState(previous => ({ ...previous, ready: true }))
        callbacksRef.current.onReady()
      } else if (event.data?.type === 'blanca:close') callbacksRef.current.onClose()
      else if (event.data?.type === 'blanca:focus-return') backRef.current?.focus()
      else if (event.data?.type === 'blanca:error') {
        failed = true
        window.clearTimeout(timeout)
        setDocumentState({ html: '', failed: true })
      }
    }
    window.addEventListener('message', receive)
    async function load() {
      try {
        const url = new URL(chapter.htmlSrc, window.location.href)
        if (url.origin !== window.location.origin) throw new Error('Only local chapter HTML is supported')
        const response = await fetch(url, { signal: controller.signal })
        if (!response.ok) throw new Error('Chapter HTML unavailable')
        const doc = new DOMParser().parseFromString(await response.text(), 'text/html')
        doc.querySelectorAll('base').forEach(node => node.remove())
        const base = doc.createElement('base')
        base.href = new URL('.', url).href
        const script = doc.createElement('script')
        const config = JSON.stringify({ ...stateRef.current, parentOrigin: window.location.origin }).replaceAll('<', '\\u003c')
        script.textContent = `window.__BLANCA_WORLD__=${config};\n${bridge}`
        doc.head.prepend(base, script)
        if (!controller.signal.aborted) setDocumentState(previous => ({ html: `<!doctype html>${doc.documentElement.outerHTML}`, failed: false,
          ready: false, version: (previous.version ?? 0) + 1 }))
      } catch {
        if (!controller.signal.aborted) {
          window.clearTimeout(timeout)
          setDocumentState({ html: '', failed: true })
        }
      }
    }
    load()
    return () => { controller.abort(); window.clearTimeout(timeout); window.removeEventListener('message', receive) }
  }, [chapter.htmlSrc, reducedMotion, attempt])

  return <section className="html-world" aria-label={chapter.title}>
    {reducedMotion ? <img className="chapter-snapshot" src={chapter.previewSrc} alt={chapter.title} onLoad={onReady} />
      : documentState.failed ? <div className="html-world__error" role="alert">
        <p>No se pudo cargar este mundo. Comprueba la conexión.</p>
        <button onClick={() => { setDocumentState({ html: '', failed: false }); setAttempt(value => value + 1) }}>Reintentar</button>
      </div>
        : <>
          {!ready && <img className="chapter-snapshot" src={chapter.previewSrc} alt="" />}
          {documentState.html && <iframe key={documentState.version} ref={frameRef} className="html-world__frame" title={chapter.title}
            sandbox="allow-scripts" allow="camera 'none'; microphone 'none'; geolocation 'none'"
            referrerPolicy="no-referrer" srcDoc={documentState.html} aria-busy={!ready} />}
        </>}
    <button ref={backRef} className="rain-world__back" onClick={onClose} aria-label="Volver al libro" title="Volver al libro"><ArrowLeft size={20} aria-hidden="true" /></button>
    {onToggleMuted && <button className="rain-world__back html-world__sound" onClick={onToggleMuted} aria-label={muted ? 'Activar sonidos del mundo' : 'Silenciar sonidos del mundo'} title={muted ? 'Activar sonidos' : 'Silenciar sonidos'}>
      {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
    </button>}
  </section>
}
