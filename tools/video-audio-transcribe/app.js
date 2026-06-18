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

let activePlayer = null;
let captions = [];
let captionStart = 0;

/* ================= STATUS ================= */
function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? '#ff5c7a' : '';
}

/* ================= TIME FORMAT ================= */
function formatSrtTime(seconds) {
    const ms = Math.floor((seconds % 1) * 1000);
    const total = Math.floor(seconds);
    const s = total % 60;
    const m = Math.floor(total / 60) % 60;
    const h = Math.floor(total / 3600);

    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatVttTime(seconds) {
    return formatSrtTime(seconds).replace(',', '.');
}

/* ================= MEDIA LOAD ================= */
mediaInput.addEventListener('change', () => {
    const file = mediaInput.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    fileName.textContent = file.name;

    videoPlayer.hidden = true;
    audioPlayer.hidden = true;

    videoPlayer.removeAttribute('src');
    audioPlayer.removeAttribute('src');

    if (file.type.startsWith('video/')) {
        videoPlayer.src = url;
        videoPlayer.hidden = false;
        activePlayer = videoPlayer;
    } else {
        audioPlayer.src = url;
        audioPlayer.hidden = false;
        activePlayer = audioPlayer;
    }

    setStatus('Media loaded.');
});

/* ================= API CALL ================= */
async function transcribeFile(file) {
    const formData = new FormData();
    formData.append("file", file);

    const API_URL = "http://localhost:3000/api/transcribe";

async function transcribeFile(file) {

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(API_URL, {
        method: "POST",
        body: formData
    });

    if (!res.ok) {
        throw new Error("API failed");
    }

    return await res.json();
}

    if (!res.ok) {
        throw new Error("API error");
    }

    return await res.json();
}

/* ================= MAIN TRANSCRIBE ================= */
startBtn.addEventListener("click", async () => {

    const file = mediaInput.files?.[0];

    if (!file) {
        setStatus("Please select a file first", true);
        return;
    }

    try {

        startBtn.disabled = true;
        setStatus("Transcribing... please wait");

        const result = await transcribeFile(file);

        captions = [];
        transcriptText.value = "";

        if (!result.segments || !Array.isArray(result.segments)) {
            throw new Error("Invalid API response");
        }

        result.segments.forEach(seg => {
            captions.push({
                start: seg.start,
                end: seg.end,
                text: seg.text
            });

            transcriptText.value += seg.text + "\n";
        });

        renderCaptions();
        setStatus("Transcription completed ✅");

    } catch (err) {
        console.error(err);
        setStatus("Transcription failed ❌", true);
    } finally {
        startBtn.disabled = false;
    }
});

/* ================= CAPTIONS UI ================= */
function renderCaptions() {
    captionList.innerHTML = '';

    captions.forEach((c, i) => {
        const row = document.createElement('div');
        row.className = 'caption-row';

        row.innerHTML = `
            <span class="caption-time">
                ${i + 1}. ${formatVttTime(c.start)} → ${formatVttTime(c.end)}
            </span>
            <span>${c.text}</span>
        `;

        captionList.appendChild(row);
    });

    const hasText = transcriptText.value.trim().length > 0;
    copyBtn.disabled = !hasText;
    downloadBtn.disabled = !hasText;
}

/* ================= DOWNLOAD CAPTIONS ================= */
function buildCaptionFile() {
    if (captionFormat.value === 'vtt') {
        const body = captions.map(c =>
            `${formatVttTime(c.start)} --> ${formatVttTime(c.end)}\n${c.text}`
        ).join('\n\n');

        return `WEBVTT\n\n${body}\n`;
    }

    return captions.map((c, i) =>
        `${i + 1}\n${formatSrtTime(c.start)} --> ${formatSrtTime(c.end)}\n${c.text}`
    ).join('\n\n') + '\n';
}

function downloadCaptions() {
    if (!transcriptText.value.trim()) return;

    if (!captions.length) {
        captions = transcriptText.value.split('\n').filter(Boolean).map((t, i) => ({
            start: i * 3,
            end: i * 3 + 2.5,
            text: t
        }));
    }

    const blob = new Blob([buildCaptionFile()], {
        type: 'text/plain;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `captions.${captionFormat.value}`;
    a.click();

    URL.revokeObjectURL(url);
}

/* ================= ACTIONS ================= */
clearBtn.addEventListener('click', () => {
    captions = [];
    transcriptText.value = '';
    captionStart = 0;
    renderCaptions();
    setStatus('Cleared');
});

copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(transcriptText.value);
    setStatus('Copied to clipboard');
});

downloadBtn.addEventListener('click', downloadCaptions);

transcriptText.addEventListener('input', renderCaptions);

/* ================= INIT ================= */
setStatus('Ready');