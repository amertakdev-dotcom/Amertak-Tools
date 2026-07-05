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

    // Hide welcome message if visible
    const welcomeContainer = document.querySelector('.welcome-container');
    if (welcomeContainer) {
        welcomeContainer.style.display = 'none';
    }

    // Add user message to history
    chatHistory.addMessage(message, 'user');
    addMessage(message, 'user', selectedFiles.length > 0);
    
    // Clear input immediately
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
        } else if (currentMode === 'math') {
            await handleMath(message, filesToProcess, loadingId);
        } else if (currentMode === 'history') {
            await handleHistory(message, filesToProcess, loadingId);
        } else if (currentMode === 'contact') {
            await handleMath(message, filesToProcess, loadingId);
        } else {
            removeMessage(loadingId);
            addMessage('ម៉ូដែលនេះមិនអាចប្រើប្រាស់បានទេ។', 'ai');
        }
    } catch (error) {
        removeMessage(loadingId);
        addMessage(`❌ កំហុស: ${error.message}`, 'ai');
    }
}

// ===== SHARED API CALLER =====

async function callGroqAPI(fullMessage, loadingId) {
    const config = API_CONFIG[ACTIVE_MODEL];
    const endpoint = config.endpoint || '/api/groq';

    let rawRes;
    try {
        rawRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: fullMessage })
        });
    } catch (netErr) {
        removeMessage(loadingId);
        addMessage(`❌ សូមពិនិត្យមើលអ៊ីនធឺណិត៖ ${netErr.message}`, 'ai');
        return null;
    }

    const text = await rawRes.text();
    let result;
    try {
        result = JSON.parse(text);
    } catch {
        removeMessage(loadingId);
        addMessage('❌ Server មិន return JSON ត្រឹមត្រូវ។', 'ai');
        return null;
    }

    if (!rawRes.ok || result.error) {
        removeMessage(loadingId);
        addMessage(`❌ កំហុស API៖ ${result.error || result.message || 'Failed to get response'}`, 'ai');
        return null;
    }

    return result;
}

// ===== API HANDLERS =====

async function handleChat(message, files, loadingId) {
    let fullMessage = AI_IDENTITY.getSystemPrompt(false) + '\n\n';

    // Get recent chat history for context
    const recentHistory = chatHistory.getRecentContext(5);
    if (recentHistory && recentHistory.length > 0) {
        recentHistory.forEach(msg => {
            const label = msg.role === 'ai' ? 'Assistant' : 'User';
            fullMessage += `${label}: ${msg.content}\n`;
        });
        fullMessage += '\n';
    }

    fullMessage += `User: ${message}`;

    if (files.length > 0) {
        fullMessage += `\n\n[អ្នកបានភ្ជាប់ ${files.length} ឯកសារ៖ ${files.map(f => f.name).join(', ')}]`;
    }

    const result = await callGroqAPI(fullMessage, loadingId);
    if (!result) return;

    removeMessage(loadingId);
    const aiResponse = result.reply || result.choices?.[0]?.message?.content || '❌ ការឆ្លើយតបទទេ';
    chatHistory.addMessage(aiResponse, 'ai');
    addMessage(aiResponse, 'ai');
}

async function handleMath(prompt, files, loadingId) {
    let fullMessage = AI_IDENTITY.getSystemPrompt(false) + '\n\n';
    fullMessage += `You are an expert mathematics teacher and problem solver. Help the user with their math problem. Provide step-by-step solutions with clear explanations in Khmer language.\n\nProblem: ${prompt}`;

    if (files.length > 0) {
        fullMessage += `\n\n[User has uploaded ${files.length} file(s) (images/documents) containing math problems: ${files.map(f => f.name).join(', ')}]`;
        fullMessage += `\n\nPlease analyze the content from these files and solve the math problems shown. If the files contain images of math equations, describe what you see and solve them step by step.`;
    }

    const result = await callGroqAPI(fullMessage, loadingId);
    if (!result) return;

    removeMessage(loadingId);
    const solution = result.reply || result.choices?.[0]?.message?.content || '❌ បរាជ័យក្នុងការដោះស្រាយលំហាត់គណិតវិទ្យា';
    chatHistory.addMessage(solution, 'ai');
    addMessage(solution, 'ai');
}

async function handleHistory(prompt, files, loadingId) {
    let fullMessage = AI_IDENTITY.getSystemPrompt(false) + '\n\n';
    fullMessage += `You are an expert historian specializing in Cambodian and world history. Provide detailed, accurate, and engaging historical information. Always respond in Khmer language.\n\nUser's question about history: ${prompt}`;

    if (files.length > 0) {
        fullMessage += `\n\n[User has uploaded ${files.length} file(s): ${files.map(f => f.name).join(', ')}]`;
        fullMessage += `\n\nIf the files contain historical documents or images, analyze them and provide historical context.`;
    }

    const result = await callGroqAPI(fullMessage, loadingId);
    if (!result) return;

    removeMessage(loadingId);
    const historicalInfo = result.reply || result.choices?.[0]?.message?.content || '❌ បរាជ័យក្នុងការទាញយកព័ត៌មានប្រវត្តិសាស្ត្រ';
    chatHistory.addMessage(historicalInfo, 'ai');
    addMessage(historicalInfo, 'ai');
}

async function handleCoding(prompt, files, loadingId) {
    let fullMessage = AI_IDENTITY.getSystemPrompt(false) + '\n\n';
    fullMessage += `You are an expert programmer. Provide clean, well-commented code for the following request:\n\n${prompt}`;

    if (files.length > 0) {
        fullMessage += `\n\n[User has attached ${files.length} file(s): ${files.map(f => f.name).join(', ')}]`;
    }

    fullMessage += `\n\nProvide only the code with minimal explanation.`;

    const result = await callGroqAPI(fullMessage, loadingId);
    if (!result) return;

    removeMessage(loadingId);
    const code = result.reply || result.choices?.[0]?.message?.content || '❌ បរាជ័យក្នុងការបង្កើតកូដ';

    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start gap-3 sm:gap-5 message-bubble';
    messageDiv.style.animation = 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    messageDiv.innerHTML = `
        <div class="mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-bubble flex items-center justify-center flex-shrink-0 relative overflow-hidden group hover:scale-110 transition-transform duration-300">
            <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-pink-500/5"></div>
            <span class="material-symbols-outlined sparkle-gradient text-[20px] sm:text-[26px] z-10">code</span>
        </div>
        <div class="flex-1 max-w-[90%] md:max-w-[80%]">
            <div class="glass-bubble rounded-[2rem] rounded-tl-xl px-6 py-4 sm:px-8 hover:shadow-lg transition-all duration-300">
                <pre class="code-block"><code>${escapeHtml(code)}</code></pre>
                <button onclick="copyCode(this)" class="mt-4 px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all duration-300">📋 ចម្លងកូដ</button>
            </div>
        </div>
    `;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    chatHistory.addMessage(code, 'ai');
}

// ===== UTILITY FUNCTIONS =====

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function copyCode(button) {
    const code = button.previousElementSibling.textContent;
    navigator.clipboard.writeText(code).then(() => {
        const originalText = button.textContent;
        button.textContent = '✅ បានចម្លង!';
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        button.style.transform = 'scale(1.05)';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
            button.style.transform = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        button.textContent = '❌ កំហុស';
        setTimeout(() => {
            button.textContent = '📋 ចម្លងកូដ';
        }, 2000);
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
