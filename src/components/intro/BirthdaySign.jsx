import birthdayColors from './birthdayColors.js'

function SignLetter({ character, color, index, white = false }) {
  if (character === ' ') {
    return <span className="library-sign__space" aria-hidden="true" />
  }

  return (
    <span
      className={'library-sign__rig' + (white ? ' library-sign__rig--white' : '')}
      style={{
        '--sign-color': color,
        '--sign-string': 18 + ((index * 7) % 16) + 'px',
      }}
    >
      <i aria-hidden="true" />
      <b>{character}</b>
    </span>
  )
}

function BirthdaySign() {
  const title = [...'Happy Birthday']
  const name = [...'BLANCA']

  return (
    <div className="birthday-sign" role="img" aria-label="Happy Birthday Blanca">
      <div className="library-sign__line library-sign__line--birthday" aria-hidden="true">
        {title.map((character, index) => (
          <SignLetter
            key={character + '-' + index}
            character={character}
            color={birthdayColors[index % birthdayColors.length]}
            index={index}
          />
        ))}
      </div>
      <div className="library-sign__line library-sign__line--name" aria-hidden="true">
        {name.map((character, index) => (
          <SignLetter
            key={character + '-' + index}
            character={character}
            color="#fffaf0"
            index={index + title.length}
            white
          />
        ))}
      </div>
    </div>
  )
}

export default BirthdaySign
