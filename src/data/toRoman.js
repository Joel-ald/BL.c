const romanDigits = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]

export function toRoman(value) {
  let remaining = value
  return romanDigits.reduce((result, [number, glyph]) => {
    while (remaining >= number) {
      result += glyph
      remaining -= number
    }
    return result
  }, '')
}
