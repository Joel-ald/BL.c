// Injected before the imported HTML's scripts, inside an opaque-origin sandbox.
(() => {
  const boot = window.__BLANCA_WORLD__
  let state = boot
  const send = type => parent.postMessage({ type: `blanca:${type}` }, boot.parentOrigin)
  const nativeRaf = window.requestAnimationFrame.bind(window)
  const nativeCancel = window.cancelAnimationFrame.bind(window)
  const callbacks = new Map()
  let handle = 0, serial = 0, lastFrame = 0
  function schedule() {
    if (!handle && state.visible && callbacks.size) handle = nativeRaf(tick)
  }
  function tick(now) {
    handle = 0
    if (!state.visible) return
    if (now - lastFrame >= 1000 / state.fps - 1) {
      lastFrame = now
      const pending = [...callbacks]
      for (const [id, callback] of pending) {
        if (!callbacks.delete(id)) continue
        try { callback(now) } catch (error) { send('error'); console.error(error) }
      }
    }
    schedule()
  }
  window.requestAnimationFrame = callback => {
    const id = ++serial
    callbacks.set(id, callback)
    schedule()
    return id
  }
  window.cancelAnimationFrame = id => { callbacks.delete(id) }

  const contexts = new Set()
  const pausedMedia = new Set()
  const NativeAudio = window.AudioContext || window.webkitAudioContext
  if (NativeAudio) {
    const AdaptedAudio = class extends NativeAudio {
      constructor(...args) {
        super(...args)
        contexts.add(this)
        if (state.muted || !state.visible) super.suspend().catch(() => {})
      }
      resume() { return state.muted || !state.visible ? Promise.resolve() : super.resume() }
      close() { contexts.delete(this); return super.close() }
    }
    window.AudioContext = AdaptedAudio
    if (window.webkitAudioContext) window.webkitAudioContext = AdaptedAudio
  }
  const originalPlay = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function () {
    this.muted = state.muted
    if (!state.visible) { pausedMedia.add(this); return Promise.resolve() }
    return originalPlay.call(this)
  }
  function syncMedia() {
    for (const button of document.querySelectorAll('button[aria-label="Activar sonidos"],button[aria-label="Silenciar sonidos"]')) {
      const enabled = button.getAttribute('aria-label') === 'Silenciar sonidos'
      if (enabled === state.muted) button.click()
    }
    for (const media of document.querySelectorAll('audio,video')) {
      media.muted = state.muted
      if (!state.visible && !media.paused) { pausedMedia.add(media); media.pause() }
    }
    if (state.visible) {
      for (const media of pausedMedia) media.play().catch(() => {})
      pausedMedia.clear()
    }
    for (const context of contexts) {
      if (state.muted || !state.visible) context.suspend().catch(() => {})
      else if (context.state === 'suspended') context.resume().catch(() => {})
    }
  }
  addEventListener('message', event => {
    if (event.source !== parent || event.origin !== boot.parentOrigin || event.data?.type !== 'blanca:state') return
    state = { ...state, ...event.data.state }
    window.__BLANCA_WORLD__ = state
    document.documentElement.dataset.quality = state.tier
    document.documentElement.dataset.paused = String(!state.visible)
    if (!state.visible && handle) { nativeCancel(handle); handle = 0 }
    syncMedia()
    dispatchEvent(new CustomEvent('blanca:state', { detail: state }))
    schedule()
  })
  addEventListener('keydown', event => {
    if (event.defaultPrevented) return
    if (event.key === 'Escape') { event.preventDefault(); send('close') }
    if (event.key === 'Tab') {
      const items = [...document.querySelectorAll('button:not(:disabled),a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')]
        .filter(el => !el.closest('[inert]') && el.getClientRects().length)
      if (!items.length || event.shiftKey && document.activeElement === items[0] || !event.shiftKey && document.activeElement === items.at(-1)) {
        event.preventDefault(); send('focus-return')
      }
    }
  })
  addEventListener('error', event => { if (event instanceof ErrorEvent) send('error') })
  addEventListener('load', () => { syncMedia(); send('ready') }, { once: true })
  const style = document.createElement('style')
  style.textContent = 'html[data-paused="true"] *,html[data-paused="true"] *::before,html[data-paused="true"] *::after{animation-play-state:paused!important}'
  style.textContent += 'button.sound,button[aria-label="Activar sonidos"],button[aria-label="Silenciar sonidos"]{display:none!important}'
  document.head.append(style)
})()
