const drops = Array.from({ length: 42 }, (_, index) => ({
  height: `${8 + ((index * 11) % 28)}%`,
  left: `${3 + ((index * 37) % 94)}%`,
  opacity: `${0.22 + ((index * 13) % 60) / 100}`,
  top: `${-6 + ((index * 29) % 104)}%`,
}))

export default function RainSnapshot() {
  return (
    <span className="rain-preview__snapshot" aria-hidden="true">
      <i className="rain-preview__mist" />
      {drops.map((drop, index) => (
        <i className="rain-preview__streak" key={index} style={{
          '--snapshot-height': drop.height,
          '--snapshot-left': drop.left,
          '--snapshot-opacity': drop.opacity,
          '--snapshot-top': drop.top,
        }} />
      ))}
      <i className="rain-preview__reflection" />
    </span>
  )
}
