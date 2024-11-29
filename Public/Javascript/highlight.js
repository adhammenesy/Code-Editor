async function highlightText(code, language) {
    let h = hljs.highlight(code, { language: language || 'plaintext' })
    return h.value
}
