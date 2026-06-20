const mediaInput = document.getElementById('mediaInput');
const fileName = document.getElementById('fileName');
const videoPlayer = document.getElementById('videoPlayer');
const audioPlayer = document.getElementById('audioPlayer');
const speechLang = document.getElementById('speechLang');
const captionFormat = document.getElementById('captionFormat');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const transcriptText = document.getElementById('transcriptText');
const captionList = document.getElementById('captionList');
const statusText = document.getElementById('statusText');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let activePlayer = null;
let activeObjectUrl = '';
let recognition = null;
let captions = [];
let captionStart = 0;

function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? '#ff5c7a' : '';
}

function formatSrtTime(seconds) {
    const safeSeconds = Math.max(Number(seconds) || 0, 0);
    const ms = Math.floor((safeSeconds % 1) * 1000);
    const total = Math.floor(safeSeconds);
    const s = total % 60;
    const m = Math.floor(total / 60) % 60;
    const h = Math.floor(total / 3600);

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatVttTime(seconds) {
    return formatSrtTime(seconds).replace(',', '.');
}

function getPlayerTime() {
    return activePlayer ? activePlayer.currentTime : captionStart;
}

function addCaption(text) {
    const cleanText = text.trim();
    if (!cleanText) return;

    const end = Math.max(getPlayerTime(), captionStart + 1);
    captions.push({
        start: captionStart,
        end,
        text: cleanText
    });
    captionStart = end;
    transcriptText.value = `${transcriptText.value}${transcriptText.value ? '\n' : ''}${cleanText}`;
    renderCaptions();
}

function renderCaptions() {
    captionList.innerHTML = '';

    captions.forEach((caption, index) => {
        const row = document.createElement('div');
        row.className = 'caption-row';
        row.innerHTML = `
            <span class="caption-time">${index + 1}. ${formatVttTime(caption.start)} -> ${formatVttTime(caption.end)}</span>
            <span>${caption.text}</span>
        `;
        captionList.appendChild(row);
    });

    const hasText = transcriptText.value.trim().length > 0;
    copyBtn.disabled = !hasText;
    downloadBtn.disabled = !hasText;
}

function loadMediaFile(file) {
    if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);

    activeObjectUrl = URL.createObjectURL(file);
    fileName.textContent = file.name;
    videoPlayer.hidden = true;
    audioPlayer.hidden = true;
    videoPlayer.removeAttribute('src');
    audioPlayer.removeAttribute('src');

    if (file.type.startsWith('video/')) {
        videoPlayer.src = activeObjectUrl;
        videoPlayer.hidden = false;
        activePlayer = videoPlayer;
    } else {
        audioPlayer.src = activeObjectUrl;
        audioPlayer.hidden = false;
        activePlayer = audioPlayer;
    }

    captionStart = 0;
    setStatus('Media loaded.');
}

function startTranscribe() {
    if (!activePlayer) {
        setStatus('Please select a file first.', true);
        return;
    }

    if (!SpeechRecognition) {
        setStatus('Speech recognition is not supported in this browser.', true);
        return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = speechLang.value;
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
            if (event.results[index].isFinal) {
                addCaption(event.results[index][0].transcript);
            }
        }
    };

    recognition.onerror = (event) => {
        setStatus(event.error ? `Speech recognition error: ${event.error}` : 'Speech recognition failed.', true);
    };

    recognition.onend = () => {
        startBtn.disabled = false;
        stopBtn.disabled = true;
        setStatus(transcriptText.value.trim() ? 'Transcription stopped.' : 'Ready.');
    };

    startBtn.disabled = true;
    stopBtn.disabled = false;
    captionStart = getPlayerTime();
    recognition.start();
    activePlayer.play().catch(() => {});
    setStatus('Listening...');
}

function stopTranscribe() {
    recognition?.stop();
    activePlayer?.pause();
    startBtn.disabled = false;
    stopBtn.disabled = true;
}

function syncCaptionsFromText() {
    captions = transcriptText.value.split('\n').filter(Boolean).map((text, index) => ({
        start: index * 3,
        end: index * 3 + 2.5,
        text
    }));
    captionStart = captions.at(-1)?.end || 0;
    renderCaptions();
}

function buildCaptionFile() {
    if (!captions.length) syncCaptionsFromText();

    if (captionFormat.value === 'vtt') {
        const body = captions.map((caption) =>
            `${formatVttTime(caption.start)} --> ${formatVttTime(caption.end)}\n${caption.text}`
        ).join('\n\n');
        return `WEBVTT\n\n${body}\n`;
    }

    return captions.map((caption, index) =>
        `${index + 1}\n${formatSrtTime(caption.start)} --> ${formatSrtTime(caption.end)}\n${caption.text}`
    ).join('\n\n') + '\n';
}

function downloadCaptions() {
    if (!transcriptText.value.trim()) return;

    const blob = new Blob([buildCaptionFile()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `captions.${captionFormat.value}`;
    link.click();
    URL.revokeObjectURL(url);
}

mediaInput.addEventListener('change', () => {
    const file = mediaInput.files?.[0];
    if (file) loadMediaFile(file);
});

startBtn.addEventListener('click', startTranscribe);
stopBtn.addEventListener('click', stopTranscribe);
clearBtn.addEventListener('click', () => {
    stopTranscribe();
    captions = [];
    captionStart = 0;
    transcriptText.value = '';
    renderCaptions();
    setStatus('Cleared.');
});
copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(transcriptText.value);
    setStatus('Copied to clipboard.');
});
downloadBtn.addEventListener('click', downloadCaptions);
transcriptText.addEventListener('input', syncCaptionsFromText);

setStatus('Ready.');
