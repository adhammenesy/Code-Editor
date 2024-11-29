const fileExplorer = document.querySelector('.file-explorer')
const editor = document.getElementById('editor')
const tabs = document.getElementById('tabs')
let fileStructure = []
let activeContextMenu = null
let activeFile = null
let draggedItem = null

const languages = new Proxy({
    php: 'php',
    js: 'javascript',
    html: 'html',
    css: 'css',
    json: 'json',
    txt: 'txt',
    md: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'c++',
    c: 'c',
    cs: 'c#',
    rb: 'ruby',
    go: 'golang',
    rs: 'rust',
    swift: 'swift',
    kt: 'kotlin',
    dart: 'dart',
    ts: 'typescript',
    sql: 'sql',
    xml: 'xml',
    yaml: 'yaml',
    sh: 'sh',
    bat: 'bat',
    ps1: 'ps1'
}, {
    get: (target, prop) => Reflect.get(target, prop) || 'plaintext'
})

const UIManager = new Proxy({
    _contextMenuState: new Proxy({
        active: null,
        position: new Proxy({x: 0, y: 0}, {
            set(target, prop, value) {
                target[prop] = Math.max(0, value)
                return true
            }
        })
    }, {
        get(target, prop) {
            return target[prop]
        }
    }),

    _fileSystemState: new Proxy({
        structure: [],
        activeFile: null,
        get currentFileContent() {
            return this.activeFile?.content || ''
        }
    }, {
        get(target, prop) {
            if (prop === 'currentFileContent') {
                return target.activeFile?.content || ''
            }
            return target[prop]
        }
    }),

    handleDragStart(e, item) {
        draggedItem = item
        e.dataTransfer.setData('text/plain', '')
        e.target.classList.add('opacity-50')
    },

    handleDragOver(e) {
        e.preventDefault()
        e.target.classList.add('bg-gray-600')
    },

    handleDragLeave(e) {
        e.target.classList.remove('bg-gray-600')
    },

    handleDrop(e, targetItem) {
        e.preventDefault()
        e.target.classList.remove('bg-gray-600')

        if (!draggedItem || draggedItem === targetItem) return

        if (targetItem.type === 'folder') {
            const sourceParent = FileSystemManager.findParentNode(draggedItem)
            FileSystemManager.removeNode(draggedItem)
            FileSystemManager.addNode(draggedItem, targetItem)
            
            const moveData = {
                file: draggedItem.name,
                from: sourceParent ? sourceParent.name : 'root',
                to: targetItem.name,
                timestamp: new Date().toISOString()
            }
            
            const moves = JSON.parse(localStorage.getItem('fileMoves') || '[]')
            moves.push(moveData)
            localStorage.setItem('fileMoves', JSON.stringify(moves))
            
            this.saveAllData()
            
            const folderElement = e.target.closest('.folder-container')
            if(folderElement) {
                const contentDiv = folderElement.querySelector('.folder-content')
                if(contentDiv) {
                    contentDiv.classList.remove('hidden')
                    const folderIcon = folderElement.querySelector('.folder-icon')
                    if(folderIcon) {
                        folderIcon.classList.remove('fa-folder')
                        folderIcon.classList.add('fa-folder-open')
                    }
                    localStorage.setItem(`folder_${targetItem.name}_state`, true)
                }
            }
            
            renderFileTree()
        }

        draggedItem = null
    },

    _createContextMenuElement({ x, y, items }) {
        const contextMenu = document.createElement('div')
        const styles = new Proxy({
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            zIndex: 9999
        }, {
            set(target, prop, value) {
                target[prop] = value
                return true
            }
        })
        Object.assign(contextMenu.style, styles)
        contextMenu.className = 'absolute bg-gray-700 text-white rounded shadow-lg py-2 z-50'

        items.forEach(({ text, handler }) => {
            const menuItem = document.createElement('div')
            menuItem.className = 'px-4 py-2 hover:bg-gray-600 cursor-pointer'
            menuItem.textContent = text
            menuItem.addEventListener('click', () => {
                handler()
                this.clearActiveContextMenu()
            })
            contextMenu.appendChild(menuItem)
        })

        return contextMenu
    },

    showContextMenu(e, item) {
        e.preventDefault()
        this.clearActiveContextMenu()

        const generateMenuItems = (item) => {
            const baseItems = [
                { text: `Delete ${item?.type || ''}`, handler: () => this.handleDelete(item) },
                { text: 'Rename', handler: () => this.handleRename(item) }
            ]

            const folderItems = [
                { text: 'New File', handler: () => this.handleNewFile(item) },
                { text: 'New Folder', handler: () => this.handleNewFolder(item) }
            ]

            return item
                ? [...baseItems, ...(item.type === 'folder' ? folderItems : [])]
                : folderItems
        }

        const contextMenu = this._createContextMenuElement({
            x: e.pageX,
            y: e.pageY,
            items: generateMenuItems(item)
        })

        const handleOutsideClick = ({ target }) => {
            if (!contextMenu.contains(target)) {
                this.clearActiveContextMenu()
                document.removeEventListener('click', handleOutsideClick)
            }
        }

        document.addEventListener('click', handleOutsideClick)
        document.body.appendChild(contextMenu)
        this._contextMenuState.active = contextMenu
    },

    clearActiveContextMenu() {
        if (this._contextMenuState.active) {
            this._contextMenuState.active.remove()
            this._contextMenuState.active = null
        }
    },

    checkNameExists(name, type, parentNode = null) {
        const nodes = parentNode ? parentNode.children : fileStructure
        return nodes.some(node => node.name === name && node.type === type)
    },

    handleNewFile(parentNode = null) {
        const createFile = name => {
            if (!this.checkNameExists(name, 'file', parentNode)) {
                const newFile = FileSystemManager.createFileSystemNode(name, 'file')
                FileSystemManager.addNode(newFile, parentNode)
                this.saveAllData()
                renderFileTree()
            } else {
                alert('A file with this name already exists')
            }
        }

        const name = prompt('Enter file name:')
        name && createFile(name)
    },

    handleNewFolder(parentNode = null) {
        const createFolder = name => {
            if (!this.checkNameExists(name, 'folder', parentNode)) {
                const newFolder = FileSystemManager.createFileSystemNode(name, 'folder')
                FileSystemManager.addNode(newFolder, parentNode)
                this.saveAllData()
                renderFileTree()
            } else {
                alert('A folder with this name already exists')
            }
        }

        const name = prompt('Enter folder name:')
        name && createFolder(name)
    },

    handleDelete(item) {
        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
            FileSystemManager?.removeNode(item)
            this.saveAllData()
            renderFileTree()
        }
    },

    handleRename(item) {
        const newName = prompt('Enter new name:', item.name)
        if (!newName || newName === item.name) return

        if (this.checkNameExists(newName, item.type)) {
            alert(`A ${item.type} with this name already exists`)
            return
        }

        FileSystemManager?.updateNode(item, {
            name: newName,
            ...(item.type === 'file' && {
                extension: newName.split('.').pop()
            })
        })

        this.saveAllData()
        renderFileTree()
    },

    toggleFolder(element) {
        const content = element.nextElementSibling
        const icon = element.querySelector('.folder-icon')
        const folderData = JSON.parse(decodeURIComponent(element.getAttribute('data-folder')))

        if(content) {
            content.classList.toggle('hidden')
            if(icon) {
                icon.classList.toggle('fa-folder')
                icon.classList.toggle('fa-folder-open')
            }
            
            if(folderData && folderData.children) {
                const state = !content.classList.contains('hidden')
                localStorage.setItem(`folder_${folderData.name}_state`, state)

                if(state) {
                    const moves = JSON.parse(localStorage.getItem('fileMoves') || '[]')
                    const folderMoves = moves.filter(move => move.to === folderData.name)
                    
                    if(folderMoves.length > 0) {
                        const movesList = document.createElement('div')
                        movesList.className = 'text-gray-400 text-sm p-2'
                        movesList.innerHTML = ''
                        movesList.innerHTML = folderMoves.map(move => 
                            `<div>Moved "${move.file}" from ${move.from} on ${new Date(move.timestamp).toLocaleString()}</div>`
                        ).join('')
                        
                        content.insertBefore(movesList, content.firstChild)
                    }
                }
            }
        }
    },

    async openFile(item) {
        const createEditorElements = () => {
            const container = document.createElement('div')
            container.className = 'flex h-full relative'
            container.style.cssText = 'width:100%;height:100%;overflow-y:auto'

            const textArea = document.createElement('textarea')
            textArea.className = 'h-full w-full flex-1 bg-gray-900 text-white p-4 focus:outline-none'
            textArea.value = item.content
            textArea.style.cssText = 'width:100%;height:100%;position:absolute;z-index:1;background:transparent;color:transparent;caret-color:white;left:50px'

            const pre = document.createElement('pre')
            pre.style.cssText = 'width:100%;height:100%;margin:0;position:absolute;z-index:0;pointer-events:none;left:50px'

            const code = document.createElement('code')
            const languages = { js: 'javascript', py: 'python', rs: 'rust', cpp: 'c++', c: 'c', cs: 'c#', ts: 'typescript', java: 'java', php: 'php', css: 'css', html: 'html' }
            code.classList.add('language-' + languages[item.extension], languages[item.extension])
            code.style.padding = '1rem'
            code.textContent = item.content

            return { container, textArea, pre, code }
        }

        const { container: editorContainer, textArea, pre, code } = createEditorElements()

        const handleKeydown = e => {
            const pos = textArea.selectionStart
            const value = textArea.value

            if (e.key === 'Enter') {
                e.preventDefault()
                const currentLine = value.substring(0, pos).split('\n').pop()
                const indent = currentLine.match(/^\s*/)[0]
                const newIndent = currentLine.trim().endsWith('{') ? indent + '    ' : indent
                textArea.setRangeText('\n' + newIndent, pos, pos, 'end')
                updateLineNumbers()
            }

            const pairs = { '(': ')', '{': '}', '[': ']', '"': '"', "'": "'", '`': '`', '/*': '*/', '<!--': '-->', '<': '>', '<?': '?>' }
            if (pairs[e.key]) {
                e.preventDefault()
                textArea.setRangeText(e.key + pairs[e.key], pos, pos, 'end')
                textArea.setSelectionRange(pos + 1, pos + 1)
            }
        }

        const handleInput = e => {
            code.textContent = e.target.value
            hljs.highlightElement(code)
            this.saveFileContent(e.target.value)
            this.saveAllData()
            updateLineNumbers()
        }

        const setupEventListeners = () => {
            textArea.addEventListener('keydown', handleKeydown)
            textArea.addEventListener('input', handleInput)
            textArea.addEventListener('scroll', () => {
                pre.scrollTop = textArea.scrollTop
                pre.scrollLeft = textArea.scrollLeft
                lineNumbers.scrollTop = textArea.scrollTop
            })
        }

        if (editor instanceof Node) {
            editor.innerHTML = ''
            editor.className = 'h-full w-full'
            editor.style.overflowY = 'auto'

            pre.appendChild(code)
            editorContainer.appendChild(pre)
            editorContainer.appendChild(textArea)
            editor.appendChild(editorContainer)

            await hljs.highlightElement(code)
        }

        textArea.focus()
        activeFile = item

        const lineNumbers = document.createElement('div')
        lineNumbers.className = 'line-numbers'
        lineNumbers.style.cssText = 'position:absolute;left:0;top:0;padding:4px;color:gray;text-align:right;user-select:none;pointer-events:none;z-index:2;width:30px'
        editorContainer.appendChild(lineNumbers)

        const updateLineNumbers = () => {
            const lines = textArea.value.split('\n').length
            lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join('<br>')
        }

        setupEventListeners()
        updateLineNumbers()
        hljs.highlightElement(code)
    },

    saveFileContent(content) {
        if (activeFile && FileSystemManager) {
            FileSystemManager.updateNode(activeFile, { content })
            this.saveAllData()
        }
    },

    saveAllData() {
        localStorage.setItem('fileSystem', encryptData(fileStructure))
    }
}, {
    get(target, prop) {
        return target[prop]
    }
})

const FileTreeRenderer = new Proxy({
    createActionButton(icon, action, color) {
        return `
            <button onclick="event.stopPropagation(); UIManager.${action}">
                <i class="fas ${icon} text-${color}-400 cursor-pointer"></i>
            </button>
        `
    },

    renderNode(item) {
        if (!item?.type) return ''

        const itemData = encodeURIComponent(JSON.stringify(item))
        const actions = `
            ${this.createActionButton('fa-edit', `handleRename(JSON.parse(decodeURIComponent('${itemData}')))`, 'blue')}
            ${this.createActionButton('fa-trash', `handleDelete(JSON.parse(decodeURIComponent('${itemData}')))`, 'red')}
        `

        const folderState = item.type === 'folder' ? localStorage.getItem(`folder_${item.name}_state`) === 'true' : false
        
        const commonHtml = `
            <div class="folder-container">
                <div class="flex items-center p-2 hover:bg-gray-700 cursor-pointer group" 
                    ${item.type === 'folder' ? `onclick="UIManager.toggleFolder(this)" data-folder="${itemData}"` : `onclick="UIManager.openFile(JSON.parse(decodeURIComponent('${itemData}')))"` } 
                    oncontextmenu="UIManager.showContextMenu(event, JSON.parse(decodeURIComponent('${itemData}')))"
                    draggable="true"
                    ondragstart="UIManager.handleDragStart(event, JSON.parse(decodeURIComponent('${itemData}')))"
                    ondragover="UIManager.handleDragOver(event)"
                    ondragleave="UIManager.handleDragLeave(event)"
                    ondrop="UIManager.handleDrop(event, JSON.parse(decodeURIComponent('${itemData}')))">
                    <i class="${item.type === 'folder' ? `fas ${folderState ? 'fa-folder-open' : 'fa-folder'} folder-icon text-yellow-400` : FileSystemManager?.getFileIcon(item.extension) || 'fas fa-file'} mr-2"></i>
                    <span>${item.name}</span>
                    <div class="ml-auto hidden group-hover:flex">${actions}</div>
                </div>
                ${item.type === 'folder' && Array.isArray(item.children) ?
                    `<div class="ml-4 folder-content ${folderState ? '' : 'hidden'}">${item.children.map(child => this.renderNode(child)).join('')}</div>` : ''}
            </div>`

        return commonHtml
    }
}, {
    get(target, prop) {
        return target[prop]
    }
})

const renderFileTree = () => {
    if (!Array.isArray(fileStructure) || !fileExplorer) return

    const renderTree = () => fileStructure
        .map(item => {
            const element = document.createElement('div')
            element.innerHTML = FileTreeRenderer.renderNode(item)
            return element.innerHTML
        })
        .join('')

    fileExplorer.innerHTML = renderTree()
}

hljs.highlightAll()