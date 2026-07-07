// Main Application Logic - UI Management and Event Handlers

let currentMode = 'chat';
let selectedFiles = [];

// ===== UI STATE MANAGEMENT =====

function setMode(mode) {
    currentMode = mode;
    const modes = ['chat', 'math', 'history', 'contact'];
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
        math: 'សរសេរលំហាត់គណិតវិទ្យា ឬរូបភាពលំហាត់...',
        history: 'មានសំនួរអ្វីពីប្រវត្តិវិទ្យា...',
        contact: 'មានបញ្ហាអ្វីឬ? ទាក់ទងខ្ញុំ...'
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
    messageDiv.style.animation = 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)';

    if (role === 'user') {
        let fileInfo = '';
        if (hasFiles) {
            fileInfo = `<div class="material-symbols-outlined mt-2 text-xs text-gray-500">folder_open ឯកសារភ្ជាប់</div>`;
        }
        messageDiv.innerHTML = `
            <div class="glass-bubble rounded-[2rem] rounded-tr-xl px-6 py-4 max-w-[90%] md:max-w-[80%] sm:px-8 hover:shadow-lg transition-all duration-300">
                <p class="font-body-md text-on-surface">${content}</p>
                ${fileInfo}
            </div>
            <span class="now text-[10px] text-outline mt-2 mr-3 font-bold tracking-widest uppercase opacity-70">ឥឡូវនេះ</span>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-bubble flex items-center justify-center flex-shrink-0 relative overflow-hidden group hover:scale-110 transition-transform duration-300">
                <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-pink-500/5"></div>
                <span class="material-symbols-outlined sparkle-gradient text-[20px] sm:text-[26px] z-10">auto_awesome</span>
            </div>
            <div class="flex-1 max-w-[90%] md:max-w-[80%] ai-message">
                <div class="glass-bubble rounded-[2rem] rounded-tl-xl px-6 py-4 sm:px-8 hover:shadow-lg transition-all duration-300">
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
    loadingDiv.className = 'flex items-start gap-3 message-bubble';
    loadingDiv.style.animation = 'slideIn 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    loadingDiv.innerHTML = `
        <div class="mt-1 w-10 h-10 sm:w-12 sm:h-12 rounded-full glass-bubble flex items-center justify-center flex-shrink-0 relative overflow-hidden group">
            <div class="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-pink-500/5"></div>
            <span class="material-symbols-outlined sparkle-gradient loading-pulse" style="font-size: 20px; position: relative; z-index: 10;">auto_awesome</span>
        </div>
        <div class="flex-1" style="max-width: 90%;">
            <div class="glass-bubble rounded-[2rem] rounded-tl-xl px-6 py-4">
                <div class="loading-container">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
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
    
    // Add success message with animation
    const successMsg = document.createElement('div');
    successMsg.className = 'flex items-center justify-center py-4 message-bubble';
    successMsg.style.animation = 'fadeInScale 0.4s ease';
    successMsg.innerHTML = `
        <div class="glass-bubble rounded-full px-6 py-3 flex items-center gap-2" style="background: var(--card)">
            <span class="material-symbols-outlined text-success text-[20px]">check_circle</span>
            <span class="text-sm font-medium text-on-surface">បានប្តូរទៅ ${config.name}</span>
        </div>
    `;
    
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.appendChild(successMsg);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    setTimeout(() => {
        successMsg.style.opacity = '0';
        successMsg.style.transition = 'opacity 0.5s ease';
        setTimeout(() => successMsg.remove(), 500);
    }, 2000);
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

window.addEventListener('DOMContentLoaded', async () => {
    // Check Gemini API configuration from backend
    // 🔒 API key is NEVER fetched from .env file on frontend
    initializeActiveModel();
    populateModelDropdown();
    setMode('chat');
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Load and display chat history
    const history = chatHistory.get();
    const welcomeContainer = document.querySelector('.welcome-container');
    
    if (history.length > 0) {
        // Hide welcome message if there's chat history
        if (welcomeContainer) {
            welcomeContainer.style.display = 'none';
        }
        
        // Display all messages from history
        history.forEach(msg => {
            if (msg.role === 'user') {
                addMessage(msg.content, 'user');
            } else {
                addMessage(msg.content, 'ai');
            }
        });
        
        // Scroll to bottom
        chatContainer.scrollTop = chatContainer.scrollHeight;
    } else {
        // Show welcome message if no history
        if (welcomeContainer) {
            welcomeContainer.style.display = 'flex';
        }
    }
});


// ==================================
// SHOW & HIDE DESCRIBE MODE SELECTOR
// ==================================

function mode_dropdown() {
    const modedrop = document.querySelector('.drop');
    const suggestionsContainer = document.getElementById('suggestionsContainer');

    suggestionsContainer.classList.toggle('show');
    modedrop.classList.toggle('rotate');
}
