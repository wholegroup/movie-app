export function convertToEmpty (inHtml) {
  const a = '<noscript>begin:6ae9d088-96e0-4f9c-a709-d1a283163e57</noscript>'
  const b = '<noscript>end:6ae9d088-96e0-4f9c-a709-d1a283163e57</noscript>'
  return inHtml
    .replace(new RegExp(`${a}.*${b}`), `${a}${b}`)
    .replace(/<span data-clear="0">\d+<\/span>/g, '<span data-clear="0">0</span>')
    .replace('"cardListStore"', '"cardListStore_del"')
}
