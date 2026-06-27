const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3001'
    : 'https://amertak-tools-f3zb.onrender.com';

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

const TRANSCRIBE_API_URL = `${API_BASE}/api/tools/transcribe`;
let selectedFile = null;
let activePlayer = null;
let activeObjectUrl = '';
let captions = [];
let abortController = null;

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

function renderCaptions() {
    captionList.innerHTML = '';

    captions.forEach((caption, index) => {
        const row = document.createElement('div');
        row.className = 'caption-row';
        row.innerHTML = `
            <span class="caption-time">${index + 1}. ${formatVttTime(caption.start)} --> ${formatVttTime(caption.end)}</span>
            <span>${caption.text}</span>
        `;
        captionList.appendChild(row);
    });

    const hasText = transcriptText.value.trim().length > 0;
    copyBtn.disabled = !hasText;
    downloadBtn.disabled = !hasText;
}

function updateControlState() {
    const hasFile = !!selectedFile;
    startBtn.disabled = !hasFile;
    clearBtn.disabled = !hasFile && !transcriptText.value.trim();
    stopBtn.disabled = true;
    copyBtn.disabled = !transcriptText.value.trim();
    downloadBtn.disabled = !transcriptText.value.trim();
}

function loadMediaFile(file) {
    if (activeObjectUrl) URL.revokeObjectURL(activeObjectUrl);

    selectedFile = file;
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

    captions = [];
    transcriptText.value = '';
    renderCaptions();
    updateControlState();
    setStatus('Media loaded. Ready to transcribe.');
}

async function startTranscribe() {
    if (!selectedFile) {
        setStatus('Please select an audio or video file first.', true);
        return;
    }

    if (abortController) {
        abortController.abort();
    }

    abortController = new AbortController();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    clearBtn.disabled = true;
    setStatus('Uploading and transcribing...');

    const formData = new FormData();
    formData.append('file', selectedFile, selectedFile.name);
    formData.append('language', speechLang.value || 'en-US');

    try {
        const response = await fetch(TRANSCRIBE_API_URL, {
            method: 'POST',
            body: formData,
            signal: abortController.signal
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(data.message || `Transcription failed with status ${response.status}`);
        }

        transcriptText.value = String(data.text || '').trim();
        syncCaptionsFromText();
        setStatus('Transcription completed successfully.');
        activePlayer?.play().catch(() => {});
    } catch (error) {
        if (error.name === 'AbortError') {
            setStatus('Transcription cancelled.', true);
        } else {
            console.error('Transcription error:', error);
            setStatus(error.message || 'Transcription failed.', true);
        }
    } finally {
        abortController = null;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        clearBtn.disabled = false;
        updateControlState();
    }
}

function stopTranscribe() {
    if (abortController) {
        abortController.abort();
        abortController = null;
    }
    activePlayer?.pause();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    setStatus('Transcription stopped.');
}

function syncCaptionsFromText() {
    captions = transcriptText.value
        .split('\n')
        .map((text) => text.trim())
        .filter(Boolean)
        .map((text, index) => ({
            start: index * 4,
            end: index * 4 + 3.75,
            text
        }));
    renderCaptions();
}

function buildCaptionFile() {
    if (!captions.length) {
        syncCaptionsFromText();
    }

    if (captionFormat.value === 'vtt') {
        const body = captions
            .map((caption) => `${formatVttTime(caption.start)} --> ${formatVttTime(caption.end)}\n${caption.text}`)
            .join('\n\n');
        return `WEBVTT\n\n${body}\n`;
    }

    return captions
        .map((caption, index) => `${index + 1}\n${formatSrtTime(caption.start)} --> ${formatSrtTime(caption.end)}\n${caption.text}`)
        .join('\n\n') + '\n';
}

function downloadCaptions() {
    if (!transcriptText.value.trim()) return;

    const fileContent = buildCaptionFile();
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `captions.${captionFormat.value}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
    selectedFile = null;
    captions = [];
    transcriptText.value = '';
    captionList.innerHTML = '';
    if (activeObjectUrl) {
        URL.revokeObjectURL(activeObjectUrl);
        activeObjectUrl = '';
    }
    videoPlayer.hidden = true;
    audioPlayer.hidden = true;
    fileName.textContent = 'MP3, WAV, MP4, WEBM, MOV';
    updateControlState();
    setStatus('Cleared.');
});
copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(transcriptText.value);
    setStatus('Copied to clipboard.');
});
downloadBtn.addEventListener('click', downloadCaptions);
transcriptText.addEventListener('input', () => {
    syncCaptionsFromText();
    updateControlState();
});

updateControlState();
setStatus('Ready.');
