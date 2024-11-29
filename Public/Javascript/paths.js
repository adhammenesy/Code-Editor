document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search)
    const filePath = urlParams.get('file')

    if (filePath) {
        const findFileByPath = path => {
            const searchInNodes = nodes => {
                for (const node of nodes) {
                    if (node.type === 'file' && node.name === path) {
                        return node
                    }
                    if (node.type === 'folder' && node.children) {
                        const found = searchInNodes(node.children)
                        if (found) return found
                    }
                }
                return null
            }
            return searchInNodes(fileStructure)
        }

        const fileNode = findFileByPath(filePath)
        if (fileNode) {
            const itemData = encodeURIComponent(JSON.stringify(fileNode))
            const fileElement = document.querySelector(`[data-file='${itemData}']`)
            if (fileElement) {
                fileElement.click()
            }
        }
    }
})
