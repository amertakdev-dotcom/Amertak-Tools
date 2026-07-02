// Chat functionality and message handling

// ===== MESSAGE SENDING =====

async function sendMessage() {
    if (!ACTIVE_MODEL) {
        addMessage('⚠️ សូមបន្ថែម API Key ជាមុនសិន។', 'ai');
        return;
    }

    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message && selectedFiles.length === 0) return;

    // Add user message to history
    chatHistory.addMessage(message, 'user');
    addMessage(message, 'user', selectedFiles.length > 0);
    
    input.value = '';
    input.style.height = 'auto';
    const filesToProcess = [...selectedFiles];
    selectedFiles = [];
    updateFilePreview();

    // Show loading
    const loadingId = addLoadingMessage();

    try {
        if (currentMode === 'chat') {
            await handleChat(message, filesToProcess, loadingId);
        } else if (currentMode === 'code') {
            await handleCoding(message, filesToProcess, loadingId);
        } else {
            removeMessage(loadingId);
            addMessage('រូបភាពមិនអាចប្រើប្រាស់បានជាមួយម៉ូដែលនេះទេ។', 'ai');
        }
    } catch (error) {
        removeMessage(loadingId);
        addMessage(`❌ កំហុស: ${error.message}`, 'ai');
    }
}

// ===== API HANDLERS =====

async function handleChat(message, files, loadingId) {
    let fullMessage = message;

    if (files.length > 0) {
        fullMessage += `\n\n[អ្នកបានភ្ជាប់ ${files.length} ឯកសារ៖ ${files.map(f => f.name).join(', ')}]`;
    }

    // Get recent chat history for context
    const recentHistory = chatHistory.getRecentContext(5);
    const contextMessages = recentHistory.map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    // Add current message
    contextMessages.push({ role: 'user', content: fullMessage });

    const config = API_CONFIG[ACTIVE_MODEL];

    try {
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.chatModel,
                messages: [
                    { role: 'system', content: AI_IDENTITY.getSystemPrompt(false) },
                    ...contextMessages
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        removeMessage(loadingId);

        if (data.error) {
            addMessage(`❌ កំហុស API៖ ${data.error.message || JSON.stringify(data.error)}`, 'ai');
        } else if (data.choices && data.choices[0]) {
            const aiResponse = data.choices[0].message.content;
            // Save to history
            chatHistory.addMessage(aiResponse, 'ai');
            addMessage(aiResponse, 'ai');
        } else {
            addMessage('❌ ការឆ្លើយតបមិនប្រនិទ្ធពី API', 'ai');
        }
    } catch (error) {
        removeMessage(loadingId);
        addMessage(`❌ កំហុសបណ្ដាញ៖ ${error.message}`, 'ai');
    }
}

async function handleCoding(prompt, files, loadingId) {
    let fullPrompt = `You are an expert programmer. Provide clean, well-commented code for the following request:\n\n${prompt}`;

    if (files.length > 0) {
        fullPrompt += `\n\n[User has attached ${files.length} file(s): ${files.map(f => f.name).join(', ')}]`;
    }

    fullPrompt += `\n\nProvide only the code with minimal explanation.`;

    const config = API_CONFIG[ACTIVE_MODEL];

    try {
        const response = await fetch(`${config.baseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                model: config.codingModel,
                messages: [
                    { role: 'system', content: AI_IDENTITY.getSystemPrompt(false) },
                    { role: 'user', content: fullPrompt }
                ],
                temperature: 0.2,
                max_tokens: 3000
            })
        });

        const data = await response.json();
        removeMessage(loadingId);

        if (data.error) {
            addMessage(`❌ កំហុស API៖ ${data.error.message || JSON.stringify(data.error)}`, 'ai');
        } else if (data.choices && data.choices[0]) {
            const code = data.choices[0].message.content;
            const chatContainer = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = 'flex items-start gap-3 sm:gap-5 message-bubble';
            messageDiv.innerHTML = `
                <div class="mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-bubble flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
                    <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-pink-500/5"></div>
                    <span class="material-symbols-outlined sparkle-gradient text-[20px] sm:text-[26px] z-10">code</span>
                </div>
                <div class="flex-1 max-w-[90%] md:max-w-[80%]">
                    <div class="glass-bubble rounded-[2rem] rounded-tl-xl px-6 py-4 sm:px-8">
                        <pre class="code-block"><code>${escapeHtml(code)}</code></pre>
                        <button onclick="copyCode(this)" class="mt-3 px-4 py-2 bg-primary text-white rounded-full text-sm font-semibold hover:opacity-90 transition-all">📋 ចម្លងកូដ</button>
                    </div>
                </div>
            `;
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            // Save to history
            chatHistory.addMessage(code, 'ai');
        } else {
            addMessage('❌ បរាជ័យក្នុងការបង្កើតកូដ', 'ai');
        }
    } catch (error) {
        removeMessage(loadingId);
        addMessage(`❌ កំហុសបណ្ដាញ៖ ${error.message}`, 'ai');
    }
}

// ===== UTILITY FUNCTIONS =====

function escapeHtml(text) {
    const map = {
        '&': '&',
        '<': '<',
        '>': '>',
        '"': '"',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function copyCode(button) {
    const code = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        button.textContent = '✅ បានចម្លង!';
        setTimeout(() => button.textContent = '📋 ចម្លងកូដ', 2000);
    });
}

// ===== EVENT LISTENERS =====

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});