// Main Application Logic

let currentMode = 'chat';
let selectedFiles = [];

// ===== UI STATE MANAGEMENT =====

function setMode(mode) {
    currentMode = mode;
    const modes = ['chat', 'image', 'code'];
    modes.forEach(m => {
        const badge = document.getElementById(`mode-${m}`);
        if (m === mode) {
            badge.classList.remove('inactive');
            badge.classList.add('active');
        } else {
            badge.classList.remove('active');
            badge.classList.add('inactive');
        }
    });

    const placeholders = {
        chat: 'សួរខ្ញុំអ្វីក៏បាន...',
        image: 'ពណ៌នាអំពីរូបភាពដែលអ្នកចង់បង្កើត...',
        code: 'អ្នកត្រូវកូដអ្វី?'
    };
    document.getElementById('chatInput').placeholder = placeholders[mode];
    updateSuggestions();
}

function updateSuggestions() {
    const container = document.getElementById('suggestionsContainer');
    const prompts = MODE_PROMPTS[currentMode];
    container.innerHTML = prompts.map(prompt => `
        <button onclick="insertPrompt('${prompt.replace(/'/g, "\\'")}')" class="suggestion-pill">
            ${prompt}
        </button>
    `).join('');
}

function insertPrompt(prompt) {
    const input = document.getElementById('chatInput');
    input.value = prompt;
    autoResize(input);
    input.focus();
}

function autoResize(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 192) + 'px';
}

// ===== FILE MANAGEMENT =====

document.getElementById('attachBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const menu = document.getElementById('attachmentMenu');
    menu.classList.toggle('hidden');
});

function openFileImport() {
    document.getElementById('fileInput').click();
    document.getElementById('attachmentMenu').classList.add('hidden');
}

function openGallery() {
    document.getElementById('galleryInput').click();
    document.getElementById('attachmentMenu').classList.add('hidden');
}

document.getElementById('fileInput').addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    updateFilePreview();
});

document.getElementById('galleryInput').addEventListener('change', (e) => {
    selectedFiles = Array.from(e.target.files);
    updateFilePreview();
});

function updateFilePreview() {
    const container = document.getElementById('filePreviewContainer');
    if (selectedFiles.length > 0) {
        container.classList.remove('hidden');
        container.innerHTML = selectedFiles.map((file, idx) => `
            <div class="file-item">
                <span class="material-symbols-outlined text-[14px]">attach_file</span>
                <span>${file.name}</span>
                <button onclick="removeFile(${idx})" title="លុប">
                    <span class="material-symbols-outlined text-[14px]">close</span>
                </button>
            </div>
        `).join('');
    } else {
        container.classList.add('hidden');
    }
}

window.removeFile = (idx) => {
    selectedFiles.splice(idx, 1);
    updateFilePreview();
};

// ===== MESSAGE DISPLAY =====

function addMessage(content, role, hasFiles = false) {
    const chatContainer = document.getElementById('chatContainer');
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${role === 'user' ? 'flex-col items-end' : 'items-start gap-3 sm:gap-5'} message-bubble`;

    if (role === 'user') {
        let fileInfo = '';
        if (hasFiles) {
            fileInfo = `<div class="mt-2 text-xs text-gray-500">📎 ឯកសារភ្ជាប់</div>`;
        }
        messageDiv.innerHTML = `
            <div class="glass-bubble rounded-[2rem] rounded-tr-xl px-6 py-4 max-w-[90%] md:max-w-[80%] sm:px-8">
                <p class="font-body-md text-on-surface">${content}</p>
                ${fileInfo}
            </div>
            <span class="text-[10px] text-outline mt-2 mr-3 font-bold tracking-widest uppercase opacity-70">ឥឡូវនេះ</span>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-bubble flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
                <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-pink-500/5"></div>
                <span class="material-symbols-outlined sparkle-gradient text-[20px] sm:text-[26px] z-10">auto_awesome</span>
            </div>
            <div class="flex-1 max-w-[90%] md:max-w-[80%]">
                <div class="glass-bubble rounded-[2rem] rounded-tl-xl px-6 py-4 sm:px-8">
                    <p class="font-body-md text-on-surface leading-relaxed">${content}</p>
                </div>
            </div>
        `;
    }

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    const id = 'msg-' + Date.now();
    messageDiv.id = id;
    return id;
}

function addLoadingMessage() {
    const chatContainer = document.getElementById('chatContainer');
    const loadingDiv = document.createElement('div');
    const id = 'loading-' + Date.now();
    loadingDiv.id = id;
    loadingDiv.className = 'flex items-start gap-3 sm:gap-5';
    loadingDiv.innerHTML = `
        <div class="mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-bubble flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-pink-500/5"></div>
            <span class="material-symbols-outlined sparkle-gradient text-[20px] sm:text-[26px] z-10 loading-pulse">auto_awesome</span>
        </div>
        <div class="flex-1 max-w-[90%] md:max-w-[80%]">
            <div class="glass-bubble rounded-[2rem] rounded-tl-xl px-6 py-4 sm:px-8">
                <div class="flex gap-2 items-center">
                    <div class="w-2 h-2 rounded-full bg-blue-400 animate-bounce"></div>
                    <div class="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style="animation-delay: 0.2s"></div>
                    <div class="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style="animation-delay: 0.4s"></div>
                </div>
            </div>
        </div>
    `;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return id;
}

function removeMessage(id) {
    const msg = document.getElementById(id);
    if (msg) msg.remove();
}

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

document.getElementById('sendBtn').addEventListener('click', sendMessage);
document.getElementById('chatInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

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
        button.textContent = '✅ បានចម្លង!';
        setTimeout(() => button.textContent = '📋 ចម្លងកូដ', 2000);
    });
}

// ===== MODEL SELECTOR =====

function populateModelDropdown() {
    const available = getAvailableModels();
    const dropdown = document.getElementById('modelDropdown');
    const btn = document.getElementById('modelSelectorBtn');

    if (available.length === 0) {
        dropdown.innerHTML = `
            <div class="add-key-option">
                <span class="material-symbols-outlined">lock</span>
                <div>បន្ថែម API Key ជាមុនសិន</div>
                <div style="font-size: 0.7rem; margin-top: 0.25rem; opacity: 0.8;">ពិនិត្យក្នុង script ក្នុង head</div>
            </div>
        `;
        btn.classList.add('disabled');
        btn.disabled = true;
        document.getElementById('currentModelName').textContent = 'គ្មាន API Key';
        document.getElementById('modelIcon').textContent = 'lock';
    } else {
        dropdown.innerHTML = available.map(model => `
            <button onclick="switchModel('${model.key}')" class="model-option ${model.key === ACTIVE_MODEL ? 'selected' : ''}" data-model="${model.key}">
                <span class="material-symbols-outlined">${model.icon}</span>
                <span>${model.name}</span>
            </button>
        `).join('');
        btn.classList.remove('disabled');
        btn.disabled = false;

        if (ACTIVE_MODEL) {
            const activeConfig = API_CONFIG[ACTIVE_MODEL];
            document.getElementById('currentModelName').textContent = activeConfig.name.split(' ')[0];
            document.getElementById('modelIcon').textContent = activeConfig.icon;
        }
    }
}

function toggleModelDropdown() {
    const available = getAvailableModels();
    if (available.length === 0) return;

    const dropdown = document.getElementById('modelDropdown');
    dropdown.classList.toggle('active');
}

function switchModel(model) {
    ACTIVE_MODEL = model;
    const config = API_CONFIG[model];
    document.getElementById('currentModelName').textContent = config.name.split(' ')[0];
    document.getElementById('modelIcon').textContent = config.icon;

    document.querySelectorAll('.model-option').forEach(btn => {
        btn.classList.remove('selected');
    });
    const selectedBtn = document.querySelector(`[data-model="${model}"]`);
    if (selectedBtn) selectedBtn.classList.add('selected');

    document.getElementById('modelDropdown').classList.remove('active');
    addMessage(`✅ បានប្តូរទៅ ${config.name}`, 'ai');
}

// ===== DROPDOWN HANDLERS =====

document.addEventListener('click', (e) => {
    const modelDropdown = document.getElementById('modelDropdown');
    const modelBtn = document.querySelector('.model-selector-btn');
    const attachmentMenu = document.getElementById('attachmentMenu');
    const attachBtn = document.getElementById('attachBtn');

    if (modelDropdown && modelBtn && !modelDropdown.contains(e.target) && !modelBtn.contains(e.target)) {
        modelDropdown.classList.remove('active');
    }
    if (attachmentMenu && attachBtn && !attachmentMenu.contains(e.target) && !attachBtn.contains(e.target)) {
        attachmentMenu.classList.add('hidden');
    }
});

// ===== INITIALIZATION =====

window.addEventListener('DOMContentLoaded', () => {
    initializeActiveModel();
    populateModelDropdown();
    setMode('chat');
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Load and display chat history
    const history = chatHistory.getHistory();
    history.forEach(msg => {
        if (msg.role === 'user') {
            addMessage(msg.content, 'user');
        } else {
            addMessage(msg.content, 'ai');
        }
    });
});
