let encryptData = data => {
    try {
        if (!data) return ''
        const str = JSON.stringify(data)
        return btoa(unescape(encodeURIComponent(str)).split('').map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) + ((i % 3) + 1))
        ).join(''))
    } catch (error) {
        console.error('Failed to encrypt data:', error)
        return ''
    }
}

let decryptData = encrypted => {
    try {
        if (!encrypted) return null
        const decoded = atob(encrypted)
        const str = decodeURIComponent(escape(decoded.split('').map((c, i) =>
            String.fromCharCode(c.charCodeAt(0) - ((i % 3) + 1))
        ).join('')))
        try {
            return JSON.parse(str)
        } catch {
            return ''
        }
    } catch (error) {
        console.error('Failed to decrypt data:', error)
        return null
    }
}