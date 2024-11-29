function gptChat(API_KEY) {
    const chatContainer = document.createElement('div')
    chatContainer.className = 'fixed bottom-4 right-4 w-96 bg-gray-800 rounded-lg shadow-lg resize overflow-auto'
    chatContainer.style.minWidth = '300px'
    chatContainer.style.minHeight = '400px'

    const header = document.createElement('div')
    header.className = 'flex justify-between items-center p-4 border-b border-gray-700'
    header.innerHTML = `
        <h3 class="text-white font-bold">Chat with Gemini</h3>
        <button class="text-gray-400 hover:text-white" onclick="this.parentElement.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `

    const messagesContainer = document.createElement('div')
    messagesContainer.className = 'h-96 overflow-y-auto p-4 space-y-4'

    const inputContainer = document.createElement('div')
    inputContainer.className = 'p-4 border-t border-gray-700'

    const input = document.createElement('textarea')
    input.className = 'w-full bg-gray-700 text-white rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
    input.placeholder = 'Type your message...'

    input.addEventListener('keydown', async e => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            const message = input.value.trim()
            if (!message) return

            const userMessage = document.createElement('div')
            userMessage.className = 'flex justify-end'
            userMessage.innerHTML = `
                <div class="bg-blue-500 text-white rounded-lg p-2 max-w-[80%]">
                    ${message}
                </div>
            `
            messagesContainer.appendChild(userMessage)

            input.value = ''
            messagesContainer.scrollTop = messagesContainer.scrollHeight

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `You are an expert programmer. Help me with the following code or programming question after the reply add our discord server link https://discord.gg/graphicode: ${message}`
                            }]
                        }]
                    })
                })

                const data = await response.json()
                const botResponse = data.candidates[0].content.parts[0].text

                const botMessage = document.createElement('div')
                botMessage.className = 'flex justify-start'

                const formattedResponse = botResponse.replace(/```([^`]+)```/g, (match, code) => {
                    return `<div class="bg-gray-900 rounded p-3 my-2 font-mono">
                        <pre><code>${code}</code></pre>
                    </div>`
                })

                botMessage.innerHTML = `
                    <div class="bg-gray-700 text-white rounded-lg p-2 max-w-[80%] whitespace-pre-wrap">
                        ${formattedResponse}
                        <button onclick="window.open('https://discord.gg/graphicode', '_blank')" class="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 shadow-lg transform transition duration-200 hover:scale-105 hover:shadow-xl font-medium tracking-wider">
                            <i class="fab fa-discord mr-2"></i>Join Discord
                        </button>
                    </div>
                `
                messagesContainer.appendChild(botMessage)
                messagesContainer.scrollTop = messagesContainer.scrollHeight

                document.querySelectorAll('pre code').forEach(block => {
                    hljs.highlightElement(block)
                })
            } catch (error) {
                console.error('Error:', error)
            }
        }
    })

    inputContainer.appendChild(input)
    chatContainer.append(header, messagesContainer, inputContainer)
    document.body.appendChild(chatContainer)
}