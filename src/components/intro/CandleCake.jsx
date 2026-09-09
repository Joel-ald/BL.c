import ProceduralFlame from './ProceduralFlame.jsx'

function CandleCake() {
  return (
    <div className="birthday-cake" role="img" aria-label="Pastel de cumpleaños iluminado por una vela blanca">
      <span className="candle-aura" aria-hidden="true" />

      <div className="flame-anchor" aria-hidden="true">
        <ProceduralFlame className="candle-fire" />
        <span className="heat-haze">
          <i className="heat-wave heat-wave--one" />
          <i className="heat-wave heat-wave--two" />
          <i className="heat-wave heat-wave--three" />
        </span>
        <span className="candle-smoke">
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className="cake-art" aria-hidden="true">
        <span className="cake-shadow" />
        <div className="flat-candle">
          <span className="flat-candle__wick" />
          <span className="flat-candle__body" />
          <span className="flat-candle__rim" />
          <span className="flat-candle__drip flat-candle__drip--one" />
          <span className="flat-candle__drip flat-candle__drip--two" />
        </div>

        <div className="flat-cake__tier flat-cake__tier--top">
          <span className="flat-cake__top-face flat-cake__top-face--top" />
          <span className="flat-cake__side-light" />
          <span className="flat-cake__side-shadow" />
          <span className="flat-cake__icing flat-cake__icing--top" />
          <span className="flat-cake__piping flat-cake__piping--top" />
          <span className="flat-cake__dot flat-cake__dot--one" />
          <span className="flat-cake__dot flat-cake__dot--two" />
          <span className="flat-cake__dot flat-cake__dot--three" />
        </div>

        <div className="flat-cake__tier flat-cake__tier--bottom">
          <span className="flat-cake__top-face flat-cake__top-face--bottom" />
          <span className="flat-cake__side-light" />
          <span className="flat-cake__side-shadow" />
          <span className="flat-cake__icing flat-cake__icing--bottom" />
          <span className="flat-cake__piping flat-cake__piping--bottom" />
          <span className="flat-cake__sprinkle flat-cake__sprinkle--one" />
          <span className="flat-cake__sprinkle flat-cake__sprinkle--two" />
          <span className="flat-cake__sprinkle flat-cake__sprinkle--three" />
          <span className="flat-cake__sprinkle flat-cake__sprinkle--four" />
        </div>

        <span className="flat-cake__plate" />
      </div>
    </div>
  )
}

export default CandleCake
