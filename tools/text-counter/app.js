const inputText = document.getElementById('inputText');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const statusText = document.getElementById('statusText');

const fields = {
    words: document.getElementById('wordCount'),
    chars: document.getElementById('charCount'),
    sentences: document.getElementById('sentenceCount'),
    paragraphs: document.getElementById('paragraphCount'),
    reading: document.getElementById('readingTime'),
    lines: document.getElementById('lineCount')
};

function countText() {
    const text = inputText.value;
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = text.length;
    const sentences = trimmed ? (trimmed.match(/[^.!?។៕]+[.!?។៕]+|[^.!?។៕]+$/g) || []).filter((s) => s.trim()).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length : 0;
    const lines = text ? text.split(/\n/).length : 0;
    const minutes = words ? Math.max(1, Math.ceil(words / 220)) : 0;

    fields.words.textContent = words.toLocaleString();
    fields.chars.textContent = chars.toLocaleString();
    fields.sentences.textContent = sentences.toLocaleString();
    fields.paragraphs.textContent = paragraphs.toLocaleString();
    fields.reading.textContent = `${minutes}m`;
    fields.lines.textContent = lines.toLocaleString();
    copyBtn.disabled = !trimmed;
    statusText.textContent = trimmed ? 'Counting live.' : 'Ready.';
}

inputText.addEventListener('input', countText);
clearBtn.addEventListener('click', () => {
    inputText.value = '';
    countText();
});
copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(inputText.value);
    statusText.textContent = 'Copied.';
});

countText();
