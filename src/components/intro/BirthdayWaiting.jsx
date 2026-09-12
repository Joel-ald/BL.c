import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import CountdownIntro from './CountdownIntro.jsx'
import '../../styles/birthday-waiting.css'

const target = Date.parse('2027-09-09T00:00:00-04:00')
function remaining() {
  const seconds = Math.max(0, Math.floor((target - Date.now()) / 1000))
  return [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60]
}

export default function BirthdayWaiting() {
  const [frozen, setFrozen] = useState(false)
  const [time, setTime] = useState(remaining)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const mutedRef = useRef(false)
  const freeze = useCallback(() => setFrozen(true), [])

  useEffect(() => {
    if (!frozen) return
    const id = setInterval(() => { if (!document.hidden) setTime(remaining()) }, 1000)
    return () => clearInterval(id)
  }, [frozen])

  useEffect(() => {
    const audio = audioRef.current
    audio.volume = .45
    const play = (event) => {
      if (event?.target?.closest?.('.waiting-sound')) return
      if (!document.hidden && !mutedRef.current) audio.play().catch(() => setPlaying(false))
    }
    const visibility = () => { if (document.hidden) audio.pause(); else { setTime(remaining()); play() } }
    play()
    window.addEventListener('pointerdown', play)
    window.addEventListener('keydown', play)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      audio.pause()
      window.removeEventListener('pointerdown', play)
      window.removeEventListener('keydown', play)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    mutedRef.current = !audio.paused
    if (mutedRef.current) audio.pause()
    else audio.play().catch(() => setPlaying(false))
  }

  return <div className={`birthday-waiting ${frozen ? 'is-frozen' : ''}`}>
    <CountdownIntro onFreeze={freeze} />
    <audio ref={audioRef} src={`${import.meta.env.BASE_URL}music/the-reason.mp3`} preload="none" loop onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
    {frozen && <div className="waiting-ribbons" aria-hidden="true"><i /><i /><i /><i /></div>}
    {frozen && <section className="waiting-content" aria-label="Hasta el próximo cumpleaños">
      <p className="waiting-note waiting-note--left">Gracias por los ratitos<br />que se hicieron bonitos.</p>
      <div className="waiting-center">
        <p className="waiting-date">9 de septiembre de 2027</p>
        <h1>Bueno... todavía falta un poquito.<br /><em>Pero el próximo también se celebra.</em></h1>
        <div className="waiting-clock" role="timer" aria-label="Tiempo hasta el próximo cumpleaños">
          {time.map((value, i) => <div key={i}><strong>{String(value).padStart(2, '0')}</strong><span>{['Días', 'Horas', 'Minutos', 'Segundos'][i]}</span></div>)}
        </div>
      </div>
      <p className="waiting-note waiting-note--right">Y por esas risas<br />que aparecen al recordarlos.</p>
    </section>}
    <button className="waiting-sound" onClick={toggle} aria-label={playing ? 'Pausar música' : 'Escuchar música'} title={playing ? 'Pausar música' : 'Escuchar música'}>{playing ? <Volume2 size={23} /> : <VolumeX size={23} />}</button>
  </div>
}
