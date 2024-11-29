const loadFromStorage = () => {
    const encrypted = localStorage.getItem('fileSystem')
    if (encrypted) {
        fileStructure = decryptData(encrypted)
        renderFileTree()
    }
}

const saveToStorage = () => {
    const encrypted = encryptData(fileStructure)
    localStorage.setItem('fileSystem', encrypted)
}

setTimeout(() => {
    loadFromStorage()
}, 0);