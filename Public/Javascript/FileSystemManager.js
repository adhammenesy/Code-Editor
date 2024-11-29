const FileSystemManager = {
    icons: {
        php: 'fa-brands fa-php text-purple-400',
        js: 'fa-brands fa-js text-yellow-400',
        html: 'fa-brands fa-html5 text-orange-400',
        css: 'fa-brands fa-css3 text-blue-400',
        json: 'fa-solid fa-code text-gray-400',
        txt: 'fa-solid fa-file-lines text-gray-400',
        md: 'fa-brands fa-markdown text-white',
        py: 'fa-brands fa-python text-blue-500',
        java: 'fa-brands fa-java text-red-500',
        cpp: 'fa-solid fa-code text-blue-600',
        c: 'fa-solid fa-code text-blue-700',
        cs: 'fa-brands fa-microsoft text-purple-600',
        rb: 'fa-brands fa-ruby text-red-600',
        go: 'fa-brands fa-golang text-blue-400',
        rs: 'fa-brands fa-rust text-orange-600',
        swift: 'fa-brands fa-swift text-orange-500',
        kt: 'fa-solid fa-k text-purple-500',
        dart: 'fa-solid fa-bullseye text-blue-400',
        ts: 'fa-solid fa-code text-blue-500',
        sql: 'fa-solid fa-database text-blue-300',
        xml: 'fa-solid fa-code text-orange-300',
        yaml: 'fa-solid fa-file-code text-red-300',
        sh: 'fa-solid fa-terminal text-green-400',
        bat: 'fa-solid fa-terminal text-yellow-300',
        ps1: 'fa-brands fa-windows text-blue-400'
    },

    getFileIcon(extension) {
        return this.icons[extension] || 'fa-solid fa-file text-gray-400'
    },

    createFileSystemNode(name, type) {
        const node = {
            name,
            type,
            metadata: {
                created: Date.now(),
                modified: Date.now(),
                id: Math.random().toString(36).substr(2, 9)
            }
        }

        if (type === 'folder') {
            node.children = []
            node.state = { expanded: false }
        } else {
            node.extension = name.split('.').pop()
            node.content = ''
            node.state = { selected: false }
        }

        return node
    },

    addNode(node, parentNode = null) {
        if (parentNode) {
            parentNode.children.push(node)
        } else {
            fileStructure.push(node)
        }
        this.notifyChange()
    },

    removeNode(node) {
        const removeFromArray = (array) => {
            const index = array.findIndex(item => item.metadata.id === node.metadata.id)
            if (index > -1) {
                array.splice(index, 1)
                return true
            }
            return array.some(item => item.children && removeFromArray(item.children))
        }

        if (removeFromArray(fileStructure)) {
            this.notifyChange()
            
            if (activeFile && activeFile.metadata.id === node.metadata.id) {
                activeFile = null
                const tabElement = document.querySelector(`[data-tab-id="${node.metadata.id}"]`)
                if (tabElement) {
                    tabElement.remove()
                }
                editor.innerHTML = ''
            }
        }
    },

    findParentNode(node, array = fileStructure) {
        for (let item of array) {
            if (item.children) {
                if (item.children.some(child => child.metadata.id === node.metadata.id)) {
                    return item
                }
                const parent = this.findParentNode(node, item.children)
                if (parent) return parent
            }
        }
        return null
    },

    updateNode(node, updates) {
        const findAndUpdate = (array) => {
            const target = array.find(item => item.metadata.id === node.metadata.id)
            if (target) {
                Object.assign(target, updates)
                target.metadata.modified = Date.now()
                return true
            }
            return array.some(item => item.children && findAndUpdate(item.children))
        }

        if (findAndUpdate(fileStructure)) {
            this.notifyChange()
        }
    },

    notifyChange() {
        renderFileTree()
    }
}