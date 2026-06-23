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

async function countText() {
    const text = inputText.value;
    const trimmed = text.trim();

    try {
        const response = await fetch('/api/tools/text-counter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || 'Count failed.');

        const { words, chars, sentences, paragraphs, readingMinutes, lines } = payload.counts;
        fields.words.textContent = words.toLocaleString();
        fields.chars.textContent = chars.toLocaleString();
        fields.sentences.textContent = sentences.toLocaleString();
        fields.paragraphs.textContent = paragraphs.toLocaleString();
        fields.reading.textContent = `${readingMinutes}m`;
        fields.lines.textContent = lines.toLocaleString();
        copyBtn.disabled = !trimmed;
        statusText.textContent = trimmed ? 'Counting live.' : 'Ready.';
    } catch (error) {
        statusText.textContent = error.message || 'Count failed.';
    }
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
