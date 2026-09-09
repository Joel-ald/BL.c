import test from 'node:test'
import assert from 'node:assert/strict'
import { chapterAsset, buildHtmlChapters } from './htmlChapterConfig.js'
import { readFileSync } from 'node:fs'
import { htmlChapters } from './htmlChapters.js'

const chapter = { title: 'Un nuevo cielo', shortText: 'Una luz.', caption: 'La princesa levanto la mirada.',
  paragraphs: ['El cielo guardaba un secreto.'], html: 'chapters/02/index.html', preview: 'chapters/02/preview.jpg' }

test('every imported world ships its HTML and a real JPEG preview', () => {
  for (const entry of Object.values(htmlChapters)) {
    const html = readFileSync(new URL(`../../public/${entry.html}`, import.meta.url), 'utf8')
    assert.match(html, /<!doctype html>/i)
    const image = readFileSync(new URL(`../../public/${entry.preview}`, import.meta.url))
    assert.equal(image.readUInt16BE(0), 0xffd8)
    assert.equal(image.readUInt16BE(image.length - 2), 0xffd9)
    assert.ok(image.length > 1000)
  }
})

test('the supplied scenes belong to the requested book numbers', () => {
  const expected = { 7: 'Tu luz', 8: 'El mapa invisible', 10: 'Una bonita reacción', 11: 'El viaje de papel',
    13: 'La puerta violeta', 17: 'Un poquito de abrigo', 21: 'Entre tinta y flores' }
  for (const [id, title] of Object.entries(expected)) {
    assert.equal(htmlChapters[id].title, title)
    assert.equal(htmlChapters[id].html, `chapters/${id.padStart(2, '0')}/index.html`)
  }
})

test('one HTML entry provides the world, copy, preview and deployment-base paths', () => {
  const result = buildHtmlChapters({ 2: chapter }, '/cumpleanos/')[2]
  assert.equal(result.world,'html')
  assert.equal(result.htmlSrc,'/cumpleanos/chapters/02/index.html')
  assert.equal(result.previewSrc,'/cumpleanos/chapters/02/preview.jpg')
  assert.equal(result.entryLabel,'Entrar a Un nuevo cielo')
  assert.deepEqual(result.paragraphs,chapter.paragraphs)
  assert.equal(chapterAsset('chapters/02/mi foto.jpg'),'/chapters/02/mi%20foto.jpg')
})

test('invalid chapter IDs, incomplete copy and unsafe asset paths are rejected', () => {
  for (const id of ['0','24','02','x']) assert.throws(() => buildHtmlChapters({ [id]: chapter }))
  for (const path of ['https://example.com/x.html','../index.html','chapters/../index.html','chapters/%2e%2e/x.html','/chapters/x.html']) {
    assert.throws(() => chapterAsset(path))
  }
  assert.throws(() => buildHtmlChapters({ 2: { ...chapter, paragraphs: [] } }))
  assert.throws(() => buildHtmlChapters({ 2: { ...chapter, title: '' } }))
  assert.throws(() => buildHtmlChapters({ 2: { ...chapter, html: 'chapters/02/code.js' } }))
})
