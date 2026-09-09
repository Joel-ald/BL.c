import birthdayColors from './birthdayColors.js'

function HangingLetter({ character, color, index, white = false }) {
  const offset = `${((index * 7) % 13) - 6}px`

  return (
    <span
      className={`hanging-rig${white ? ' hanging-rig--white' : ''}`}
      style={{
        '--letter-color': color,
        '--string-offset': offset,
      }}
    >
      <span className="physics-pendulum">
        <i className="letter-string" aria-hidden="true" />
        <span className="letter-swing">
          <span className="neon-letter">
            {character}
            <span className="neon-letter__trace" aria-hidden="true">{character}</span>
            <span className="neon-letter__fill" aria-hidden="true">{character}</span>
          </span>
        </span>
      </span>
    </span>
  )
}

function ColoredWord({ word, startIndex }) {
  return (
    <span className="hanging-word">
      {[...word].map((character, index) => (
        <HangingLetter
          key={`${character}-${index}`}
          character={character}
          color={birthdayColors[(startIndex + index) % birthdayColors.length]}
          index={startIndex + index}
        />
      ))}
    </span>
  )
}

function HangingBirthday() {
  return (
    <div className="hanging-message">
      <span className="sr-only">Happy Birthday Blanca</span>

      <div className="hanging-line hanging-line--birthday" aria-hidden="true">
        <ColoredWord word="Happy" startIndex={0} />
        <ColoredWord word="Birthday" startIndex={5} />
      </div>

      <div className="hanging-line hanging-line--name" aria-hidden="true">
        <span className="hanging-word">
          {[...'BLANCA'].map((character, index) => (
            <HangingLetter
              key={`${character}-${index}`}
              character={character}
              color="#fffaf0"
              index={13 + index}
              white
            />
          ))}
        </span>
      </div>
    </div>
  )
}

export default HangingBirthday
