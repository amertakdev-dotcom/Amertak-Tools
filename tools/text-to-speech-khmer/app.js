const inputText = document.getElementById('inputText');
const speakBtn = document.getElementById('speakBtn');
const clearBtn = document.getElementById('clearBtn');
const audioPlayer = document.getElementById('audioPlayer');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('statusText');

let lastFileId = null;

function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? '#ff8080' : '';
}

async function generateSpeech() {
    const text = inputText.value.trim();

    if (!text) {
        setStatus("សូមវាយអត្ថបទជាមុនសិន", true);
        return;
    }

    try {
        setStatus("កំពុងបង្កើតសំឡេង...");

        const res = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                voice: "en-US-JennyNeural"
            })
        });

        const data = await res.json();

        if (!data.file_id) {
            throw new Error("No file_id returned");
        }

        lastFileId = data.file_id;

        const audioUrl = `/api/audio/${lastFileId}`;

        audioPlayer.src = audioUrl;
        audioPlayer.hidden = false;
        downloadBtn.hidden = false;

        setStatus("រួចរាល់ ✔");

        audioPlayer.play();

    } catch (err) {
        console.error(err);

        setStatus("API error → fallback to browser TTS", true);

        fallbackTTS();
    }
}

function fallbackTTS() {
    const text = inputText.value.trim();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "km-KH";
    utterance.rate = 0.95;

    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
}

function clearForm() {
    inputText.value = "";
    audioPlayer.src = "";
    audioPlayer.hidden = true;
    downloadBtn.hidden = true;
    speechSynthesis.cancel();
    setStatus("Ready.");
}

function downloadAudio() {
    if (!lastFileId) return;

    const link = document.createElement("a");
    link.href = `/api/audio/${lastFileId}`;
    link.download = "speech.mp3";
    link.click();
}

speakBtn.addEventListener("click", generateSpeech);
clearBtn.addEventListener("click", clearForm);
downloadBtn.addEventListener("click", downloadAudio);

setStatus("Ready.");