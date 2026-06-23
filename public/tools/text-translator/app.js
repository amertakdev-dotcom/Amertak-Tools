// Use public Google Translate web endpoint (no API key required)
// NOTE: This uses the unofficial `translate.googleapis.com` endpoint.

const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const statusText = document.getElementById('statusText');
const detectedLangText = document.getElementById('detectedLang');
const fileInput = document.getElementById('fileInput');
const fileName = document.getElementById('fileName');
const pasteBtn = document.getElementById('pasteBtn');
const toggleTyping = document.getElementById('toggleTyping');
const srcLang = document.getElementById('srcLang');
const tgtLang = document.getElementById('tgtLang');
const swapBtn = document.getElementById('swapBtn');

let translateTimeout;
let lastDetectedLang = null;
let currentText = '';

function setStatus(message, isError = false) {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.style.color = isError ? '#ff5c7a' : '';
}

function setDetectedLang(langCode) {
    if (!detectedLangText) return;
    if (!langCode) {
        detectedLangText.textContent = '';
        return;
    }
    const langNames = {
        'auto': 'Auto-detect',
        'km': 'Khmer',
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese (Simplified)',
        'zh-TW': 'Chinese (Traditional)',
        'ar': 'Arabic',
        'hi': 'Hindi',
        'vi': 'Vietnamese',
        'id': 'Indonesian',
        'my': 'Burmese',
        'tl': 'Tagalog'
    };
    lastDetectedLang = langCode;
    detectedLangText.textContent = `Detected language: ${langNames[langCode] || langCode}`;
}

function setOutput(text) {
    if (!outputText) return;
    outputText.value = text;
    copyBtn.disabled = !text.trim();
}

function getCurrentText() {
    if (inputText) return inputText.value;
    return currentText;
}

function setCurrentText(t) {
    currentText = t;
    if (inputText) inputText.value = t;
}

async function translateText(text, source, target) {
    if (!text.trim()) {
        setOutput('');
        if (detectedLangText) {
            detectedLangText.textContent = '';
        }
        return;
    }

    if (source === target && source !== 'auto') {
        setOutput('');
        return;
    }

    try {
        const response = await fetch('/api/tools/text-translator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                text,
                source: source === 'auto' ? 'auto' : source,
                target
            })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            setStatus(error.message || `Translation failed: ${response.status}`, true);
            return;
        }

        const json = await response.json();
        setOutput(json.translatedText || '');
        setStatus('Translation complete.');
    } catch (error) {
        setStatus('Unable to connect to translation API.', true);
        console.error('Translation error:', error);
    }
}

// Handle .txt file uploads by reading file contents and translating
if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        if (!f) return;
        // allow files with no type or text/plain
        const isText = !f.type || f.type === 'text/plain';
        if (!isText && !f.name.endsWith('.txt')) {
            setStatus('Please upload a .txt file.', true);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(ev) {
            const contents = ev.target.result;
            setCurrentText(contents);
            if (fileName) {
                fileName.textContent = f.name;
            }
            // trigger translate
            handleTextInput();
        };
        reader.onerror = function() {
            setStatus('Failed to read file.', true);
        };
        reader.readAsText(f, 'UTF-8');
    });
}

// Paste button: read clipboard and insert into typing area
if (pasteBtn) {
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (!text) {
                setStatus('Clipboard empty or not accessible.', true);
                return;
            }
            setCurrentText(text);
            handleTextInput();
            setStatus('Pasted from clipboard.');
        } catch (err) {
            setStatus('Unable to read clipboard.', true);
        }
    });
}

// Toggle typing box collapse
if (toggleTyping) {
    toggleTyping.addEventListener('click', () => {
        const box = document.getElementById('typingBox');
        if (!box) return;
        box.classList.toggle('collapsed');
        toggleTyping.textContent = box.classList.contains('collapsed') ? 'Show' : 'Hide';
    });
}

function handleTextInput() {
    // Clear timeout to avoid excessive API calls
    clearTimeout(translateTimeout);
    
    const text = getCurrentText().trim();
    const source = srcLang.value;
    const target = tgtLang.value;

    // Auto-translate with debounce (wait 500ms after user stops typing)
    translateTimeout = setTimeout(() => {
        if (text) {
            translateText(text, source, target);
        }
    }, 500);
}

function clearForm() {
    setCurrentText('');
    outputText.value = '';
    if (detectedLangText) {
        detectedLangText.textContent = '';
    }
    if (fileName) {
        fileName.textContent = 'No file selected';
    }
    if (fileInput) {
        fileInput.value = '';
    }
    setStatus('Ready. Upload a .txt file to translate.');
    copyBtn.disabled = true;
    clearTimeout(translateTimeout);
}

function copyOutput() {
    if (!outputText.value.trim()) return;
    navigator.clipboard.writeText(outputText.value.trim()).then(() => {
        setStatus('Translated text copied to clipboard.');
    }).catch(() => {
        setStatus('Unable to copy text. Please try manually.', true);
    });
}

function swapLanguages() {
    const sourceValue = srcLang.value;
    srcLang.value = tgtLang.value;
    tgtLang.value = sourceValue;
    
    // Re-translate with swapped languages
    const text = getCurrentText().trim();
    if (text) {
        clearTimeout(translateTimeout);
        translateText(text, srcLang.value, tgtLang.value);
    }
}

// Event listeners
if (inputText) {
    inputText.addEventListener('input', handleTextInput);
}

if (clearBtn) {
    clearBtn.addEventListener('click', clearForm);
}

if (copyBtn) {
    copyBtn.addEventListener('click', copyOutput);
}

if (swapBtn) {
    swapBtn.addEventListener('click', swapLanguages);
}

if (srcLang) {
    srcLang.addEventListener('change', () => {
        const text = getCurrentText().trim();
        if (text) {
            handleTextInput();
        }
    });
}

if (tgtLang) {
    tgtLang.addEventListener('change', () => {
        const text = getCurrentText().trim();
        if (text) {
            handleTextInput();
        }
    });
}

// Initialize
setStatus('Ready. Upload a .txt file to translate.');

// កូដស្វ័យប្រវត្តិកត់ត្រាការចូលមើលទំព័រ
window.addEventListener('DOMContentLoaded', () => {
    // ចាប់យកឈ្មោះផ្លូវទំព័រនាពេលបច្ចុប្បន្ន (ឧទាហរណ៍៖ /tools/downloader/index.html)
    const currentPage = window.location.pathname; 

    fetch('https://tools-amertak.vercel.app/api/track-page', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ pageName: currentPage })
    })
    .then(res => res.json())
    .then(data => console.log('Page view tracked:', data))
    .catch(err => console.error('Analytics Error:', err));
});

