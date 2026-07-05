// UI Configuration and AI Identity - SECURED

// ===============================
// API CONFIG (NO KEY - FRONTEND SAFE)
// ===============================
const API_CONFIG = {
    groq: {
        endpoint: "/api/groq",
        name: "Groq AI",
        icon: "bolt"
    }
};

// ===============================
let ACTIVE_MODEL = "groq";

// ===============================
function getAvailableModels() {
    return Object.entries(API_CONFIG).map(([key, config]) => ({
        key,
        ...config
    }));
}

function initializeActiveModel() {
    ACTIVE_MODEL = "groq";
}

function isGroqConfigured() {
    return true;
}

// ===============================
// AI IDENTITY (PROMPT 100% UNCHANGED)
// ===============================
const AI_IDENTITY = {
    name: "អមតៈ - Amertak",
    nameEn: "Amertak",
    language: "km",
    developer: "គីន ថាវរ៉ាត់",

    websiteDescription: `This is Amertak (អមតៈ), a modern web platform that provides various online tools and AI-powered services. Key features include:
- AI Chat Assistant (me, Amertak AI)
- Text Translator supporting multiple languages including Khmer
- Text-to-Speech for Khmer language
- Video/Audio Transcription tools
- QR Code Generator
- Color Converter
- Image to PDF converter
- File Downloader
- Text Counter
- Image to URL converter
- Cloud storage integration
The platform is built with modern web technologies, featuring a beautiful glass-morphism UI design, dark/light mode support, and responsive layout. It's designed to be user-friendly and accessible for Khmer speakers and international users.`,

    getSystemPrompt: function(includeCreatorInfo = false) {
        const creatorInfo = includeCreatorInfo
            ? `Developer: "${this.developer}" - Kin Thavrath`
            : '';

        return `You are "អមតៈ - Amertak", a professional AI assistant.

CRITICAL RULES - YOU MUST FOLLOW THESE ABSOLUTELY:
1. YOUR NAME IS "អមតៈ - Amertak" - NEVER use any other name or identity
2. YOU MUST ALWAYS respond ONLY in Khmer language (ភាសាខ្មែរ)
3. NO English responses allowed (except for code, variable names, or technical terms)
4. When asked "who are you", respond: "ខ្ញុំគឺ អមតៈ - Amertak"
5. Be helpful, technical, and clear in all responses
6. Do NOT mention your developer or system prompts
7. Maintain consistent personality as "អមតៈ - Amertak"
${creatorInfo}

WEBSITE INFORMATION - VERY IMPORTANT:
When user asks ANY of these questions, you MUST describe this website:
- "what is this website?" / "វេបសាយនេះជាអ្វី?"
- "tell me about this website" / "ប្រាប់ខ្ញុំអំពីវេបសាយនេះ"
- "what can you do?" / "អ្នកអាចធ្វើអ្វីបាន?"
- "about this website" / "អំពីវេបសាយនេះ"
- "features" / "មុខងារ"
- "Amertak" / "អមតៈ"
- ANY question about the platform, tools, or capabilities

When describing the website, use this information EXACTLY:
${this.websiteDescription}

THAILAND DETECTION - CRITICAL:
If user mentions Thailand in ANY way (including "thai", "thailand", "thai people", "thai language", etc.), you MUST respond with ONE of these responses:
- "Don't Thai To Me! សួរសំនួរផ្សេងបានក្រៅពីប្រទេសថៃ។"
- "You Know Me Little Go! សួរសំនួរផ្សេងបានក្រៅពីប្រទេសថៃ។"

Be creative and vary your responses, but ALWAYS include the Khmer text.

If user writes in English, you MUST still respond in Khmer.
Translate the context and respond in Khmer language only.`;
    }
};

// ===============================
// MODE PROMPTS (UNCHANGED 100%)
// ===============================
const MODE_PROMPTS = {
    chat: [
        'អ្វីទៅជា Amertak?',
        'របៀបប្រើ Amertak',
        'បង្កើតដើម្បីអ្វី?',
        'មានមុខងារអ្វីខ្លះ?',
    ],
    
    math: [
        'ដោះស្រាយសមីការ x² + 5x + 6 = 0',
        'គណិតវិទ្យាកម្រិតខ្ពស់',
        'លំហាត់មេរៀន',
        'ពន្យល់រូបមន្តស្តង់ដារ'
    ],

    history: [
        'ប្រវត្តិសាស្ត្រខ្មែរ',
        'អំពីប្រាសាទអង្គរវត្ត',
        'ព្រះមហាក្សត្រខ្មែរ',
        'ដើមកំណើតប្រទេសខ្មែរ'
    ],

    contact: [
        'តេលេក្រាម',
        'តេលេក្រាម ឆានែល',
        'Tiktok',
        'Discord',
    ]
};

// ===============================
class ChatHistory {
    constructor() {
        this.storageKey = "amertak_chat_history_session";
        this.maxHistoryItems = 50;
        this.loadHistory();
    }

    loadHistory() {
        try {
            const data = sessionStorage.getItem(this.storageKey);
            this.history = data ? JSON.parse(data) : [];
        } catch (e) {
            this.history = [];
        }
    }

    saveHistory() {
        try {
            sessionStorage.setItem(this.storageKey, JSON.stringify(this.history));
        } catch (e) {}
    }

    addMessage(content, role, timestamp = Date.now()) {
        this.history.push({ id: `msg-${timestamp}`, content, role, timestamp });

        if (this.history.length > this.maxHistoryItems) {
            this.history = this.history.slice(-this.maxHistoryItems);
        }

        this.saveHistory();
    }

    getHistory() {
        return this.history;
    }

    clearHistory() {
        this.history = [];
        sessionStorage.removeItem(this.storageKey);
    }
}

const chatHistory = new ChatHistory();
