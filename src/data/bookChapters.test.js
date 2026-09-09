import test from 'node:test'
import assert from 'node:assert/strict'
import books from './books.js'
import { bookChapters } from './bookChapters.js'
import { toRoman } from './toRoman.js'
import { htmlChapters } from './htmlChapters.js'

test('every configured portal belongs to a real book with complete page content', () => {
  for (const [id, chapter] of Object.entries(bookChapters)) {
    assert.ok(books.some((book) => book.id === Number(id)))
    assert.ok(chapter.world && chapter.entryLabel && chapter.caption)
    assert.ok(chapter.paragraphs.length > 0)
    assert.ok(chapter.paragraphs.every((text) => typeof text === 'string' && text.trim()))
  }
})

test('unfinished books do not advertise a world that has not been created', () => {
  const active = [...new Set(['1', '6', ...Object.keys(htmlChapters)])].sort((a,b) => Number(a)-Number(b))
  assert.deepEqual(Object.keys(bookChapters), active)
  if (!htmlChapters[1]) assert.equal(bookChapters[1].world, 'galaxy')
  if (!htmlChapters[6]) assert.equal(bookChapters[6].world, 'rain')
  if (!htmlChapters[23]) assert.equal(bookChapters[23], undefined)
})

test('all 23 chapters use the same Roman numerals as the spines', () => {
  const expected = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI', 'XXII', 'XXIII']
  assert.deepEqual(books.map((book) => toRoman(book.id)), expected)
})
