const qrText = document.getElementById('qrText');
const qrSize = document.getElementById('qrSize');
const qrMargin = document.getElementById('qrMargin');
const qrPreviewImage = document.getElementById('qrPreviewImage');
const qrStatus = document.getElementById('qrStatus');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const dropZone = document.getElementById('dropZone');
const qrImage = document.getElementById('qrImage');
const scanResult = document.getElementById('scanResult');
const scanStatus = document.getElementById('scanStatus');
const scanPreview = document.getElementById('scanPreview');
const copyScanBtn = document.getElementById('copyScanBtn');
const openResultBtn = document.getElementById('openResultBtn');

const defaultText = '';
const apiBaseUrl = 'https://api.qrserver.com/v1';
let generatedBlob = null;
let generatedObjectUrl = '';

function setStatus(node, message, type = '') {
    node.textContent = message;
    node.classList.toggle('is-error', type === 'error');
    node.classList.toggle('is-success', type === 'success');
}

function clampNumber(value, min, max, fallback) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return fallback;
    return Math.min(Math.max(parsed, min), max);
}

function isLikelyUrl(value) {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

function revokeGeneratedUrl() {
    if (generatedObjectUrl) {
        URL.revokeObjectURL(generatedObjectUrl);
        generatedObjectUrl = '';
    }
}

async function generateQrCode() {
    const text = qrText.value.trim();
    if (!text) {
        setStatus(qrStatus, 'Enter text or URL first', 'error');
        qrText.focus();
        return;
    }

    const width = clampNumber(qrSize.value, 160, 800, 280);
    const margin = clampNumber(qrMargin.value, 0, 8, 2);
    qrSize.value = width;
    qrMargin.value = margin;

    try {
        setStatus(qrStatus, 'Fetching QR image...');
        const response = await fetch('/api/tools/qr-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ text, size: width, margin })
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || 'QR API request failed');
        }

        const payload = await response.json();
        generatedBlob = await (await fetch(payload.dataUrl)).blob();
        revokeGeneratedUrl();
        generatedObjectUrl = URL.createObjectURL(generatedBlob);
        qrPreviewImage.src = generatedObjectUrl;
        downloadBtn.disabled = false;
        copyBtn.disabled = false;
        setStatus(qrStatus, 'Generated QR image', 'success');
    } catch (error) {
        generatedBlob = null;
        downloadBtn.disabled = true;
        copyBtn.disabled = true;
        setStatus(qrStatus, 'Could not generrate QR image', 'error');
        console.error(error);
    }
}

function clearGenerator() {
    qrText.value = '';
    qrPreviewImage.removeAttribute('src');
    generatedBlob = null;
    revokeGeneratedUrl();
    downloadBtn.disabled = true;
    copyBtn.disabled = true;
    setStatus(qrStatus, 'Ready');
    qrText.focus();
}

function downloadQrCode() {
    if (!generatedBlob) return;

    const link = document.createElement('a');
    link.download = 'amertak-qr-code.png';
    link.href = URL.createObjectURL(generatedBlob);
    link.click();
    URL.revokeObjectURL(link.href);
}

async function copyQrCode() {
    if (!generatedBlob) return;

    if (!navigator.clipboard || !window.ClipboardItem) {
        setStatus(qrStatus, 'Clipboard image copy is not supported', 'error');
        return;
    }

    try {
        await navigator.clipboard.write([
            new ClipboardItem({ [generatedBlob.type]: generatedBlob })
        ]);
        setStatus(qrStatus, 'Copied PNG', 'success');
    } catch (error) {
        setStatus(qrStatus, 'Could not copy PNG', 'error');
        console.error(error);
    }
}

function validateScanFile(file) {
    const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!file) {
        throw new Error('Please choose an image file');
    }

    if (!validTypes.includes(file.type)) {
        throw new Error('Use PNG, JPG, or GIF image');
    }

    if (file.size > 1048576) {
        throw new Error('Image must be under 1.0 MB');
    }
}

function previewScanFile(file) {
    const objectUrl = URL.createObjectURL(file);
    scanPreview.classList.remove('hidden');
    scanPreview.style.backgroundImage = `url("${objectUrl}")`;

    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

async function scanFile(file) {
    try {
        validateScanFile(file);
        previewScanFile(file);
        setStatus(scanStatus, 'Uploading...');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('outputformat', 'json');

        const response = await fetch(`${apiBaseUrl}/read-qr-code/`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('QR scan failed. Check your network');
        }

        const payload = await response.json();
        const symbol = payload?.[0]?.symbol?.[0];

        if (!symbol || symbol.error) {
            throw new Error(symbol?.error || 'No QR code found');
        }

        scanResult.value = symbol.data;
        copyScanBtn.disabled = false;
        openResultBtn.disabled = !isLikelyUrl(symbol.data);
        setStatus(scanStatus, 'DecodedI', 'success');
    } catch (error) {
        scanResult.value = '';
        copyScanBtn.disabled = true;
        openResultBtn.disabled = true;
        setStatus(scanStatus, error.message, 'error');
        console.error(error);
    }
}

async function copyScanResult() {
    if (!scanResult.value.trim()) return;
    await navigator.clipboard.writeText(scanResult.value.trim());
    setStatus(scanStatus, 'Copied result', 'success');
}

function openScanResult() {
    const value = scanResult.value.trim();
    if (isLikelyUrl(value)) {
        window.open(value, '_blank', 'noopener,noreferrer');
    }
}

function initQrTool() {
    qrText.value = defaultText;
    generateBtn.addEventListener('click', generateQrCode);
    clearBtn.addEventListener('click', clearGenerator);
    downloadBtn.addEventListener('click', downloadQrCode);
    copyBtn.addEventListener('click', copyQrCode);
    copyScanBtn.addEventListener('click', copyScanResult);
    openResultBtn.addEventListener('click', openScanResult);

    qrText.addEventListener('keydown', (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            generateQrCode();
        }
    });

    qrImage.addEventListener('change', (event) => {
        scanFile(event.target.files[0]);
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.add('is-dragging');
        });
    });

    ['dragleave', 'drop'].forEach((eventName) => {
        dropZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            dropZone.classList.remove('is-dragging');
        });
    });

    dropZone.addEventListener('drop', (event) => {
        scanFile(event.dataTransfer.files[0]);
    });

    generateQrCode();
}

document.addEventListener('DOMContentLoaded', initQrTool);

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

