const symbols = {
  star: '✦',
  moon: '☾',
  leaf: '❧',
  spark: '✧',
  key: '⚿',
  firefly: '·',
  rain: '⋮',
  map: '⌁',
  diamond: '◇',
  constellation: '⁙',
  clock: '◷',
  tree: '♧',
  comet: '✣',
  door: '▯',
  wave: '≈',
  flame: '♢',
  letter: '✉',
  compass: '⌖',
  bell: '♢',
  bridge: '⌒',
  house: '⌂',
  path: '⋰',
  crown: '♕',
  blanca: 'B',
}

function MagicSymbol({ name, className = '' }) {
  return (
    <span className={`magic-symbol ${className}`} aria-hidden="true">
      {symbols[name] ?? '✦'}
    </span>
  )
}

export default MagicSymbol
