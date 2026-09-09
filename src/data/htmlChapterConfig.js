export function chapterAsset(path, base = '/') {
  if (typeof path !== 'string' || !/^chapters\/[\w /.-]+$/.test(path)
    || path.split('/').some(part => !part || part === '.' || part === '..' || part.trim() !== part || part.endsWith('.'))) {
    throw new Error('Chapter assets must be local paths inside public/chapters/')
  }
  return `${base.endsWith('/') ? base : `${base}/`}${path.split('/').map(encodeURIComponent).join('/')}`
}

export function buildHtmlChapters(entries, base = '/') {
  return Object.fromEntries(Object.entries(entries).map(([id, chapter]) => {
    if (!/^(?:[1-9]|1\d|2[0-3])$/.test(id)) throw new Error(`Invalid chapter: ${id}`)
    for (const field of ['title', 'shortText', 'caption', 'html', 'preview']) {
      if (typeof chapter[field] !== 'string' || !chapter[field].trim()) throw new Error(`Chapter ${id}: missing ${field}`)
    }
    if (!Array.isArray(chapter.paragraphs) || !chapter.paragraphs.length || chapter.paragraphs.some(p => typeof p !== 'string' || !p.trim())) {
      throw new Error(`Chapter ${id}: missing page paragraphs`)
    }
    if (!/\.html?$/i.test(chapter.html) || !/\.(jpg|jpeg|png|webp)$/i.test(chapter.preview)) throw new Error(`Chapter ${id}: invalid asset types`)
    return [id, { ...chapter, world: 'html', htmlSrc: chapterAsset(chapter.html, base),
      previewSrc: chapterAsset(chapter.preview, base), entryLabel: chapter.entryLabel || `Entrar a ${chapter.title}` }]
  }))
}
