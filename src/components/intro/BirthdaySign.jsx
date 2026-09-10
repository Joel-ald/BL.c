import birthdayColors from './birthdayColors.js'

function SignLetter({ character, color, index, white = false, onPick, lit, disabled }) {
  if (character === ' ') {
    return <span className="library-sign__space" aria-hidden="true" />
  }

  const Tag = onPick ? 'button' : 'span'
  return (
    <Tag
      type={onPick ? 'button' : undefined}
      onClick={onPick}
      disabled={onPick ? disabled : undefined}
      aria-label={onPick ? `Letra ${character}, posición ${index - 13}` : undefined}
      data-key-lit={lit || undefined}
      className={'library-sign__rig' + (white ? ' library-sign__rig--white' : '')}
      style={{
        '--sign-color': color,
        '--sign-string': 18 + ((index * 7) % 16) + 'px',
      }}
    >
      <i aria-hidden="true" />
      <b>{character}</b>
    </Tag>
  )
}

function BirthdaySign({ onFairyLetter, fairyProgress = 0, ready = true }) {
  const title = [...'Happy Birthday']
  const name = [...'BLANCA']

  return (
    <div className="birthday-sign" role={onFairyLetter ? 'group' : 'img'} aria-label="Happy Birthday Blanca">
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
      <div className="library-sign__line library-sign__line--name" aria-hidden={onFairyLetter ? undefined : true}>
        {name.map((character, index) => (
          <SignLetter
            key={character + '-' + index}
            character={character}
            color="#fffaf0"
            index={index + title.length}
            white
            onPick={onFairyLetter ? event => onFairyLetter(index, event.currentTarget) : undefined}
            lit={index < fairyProgress}
            disabled={!ready}
          />
        ))}
      </div>
    </div>
  )
}

export default BirthdaySign
