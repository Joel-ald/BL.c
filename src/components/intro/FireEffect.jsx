function FireEffect({ className = 'intro-fire' }) {
  return (
    <span className={className} aria-hidden="true">
      <span className="fire-lobe fire-lobe--left">
        <i className="fire-shape" />
        <i className="fire-particle" />
      </span>
      <span className="fire-lobe fire-lobe--center">
        <i className="fire-shape" />
        <i className="fire-particle" />
      </span>
      <span className="fire-lobe fire-lobe--right">
        <i className="fire-shape" />
        <i className="fire-particle" />
      </span>
      <span className="fire-lobe fire-lobe--base">
        <i className="fire-shape" />
      </span>
    </span>
  )
}

export default FireEffect
