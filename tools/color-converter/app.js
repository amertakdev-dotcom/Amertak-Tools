const hexInput = document.getElementById('hexInput');
const colorInput = document.getElementById('colorInput');
const copyBtn = document.getElementById('copyBtn');
const randomBtn = document.getElementById('randomBtn');
const statusText = document.getElementById('statusText');
const preview = document.getElementById('colorPreview');
const hexOut = document.getElementById('hexOut');
const rgbOut = document.getElementById('rgbOut');
const hslOut = document.getElementById('hslOut');
const hsvOut = document.getElementById('hsvOut');

function normalizeHex(value) {
    let hex = value.trim().replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map((char) => char + char).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
    return `#${hex.toLowerCase()}`;
}

function hexToRgb(hex) {
    const clean = hex.replace('#', '');
    return {
        r: parseInt(clean.slice(0, 2), 16),
        g: parseInt(clean.slice(2, 4), 16),
        b: parseInt(clean.slice(4, 6), 16)
    };
}

function rgbToHsl({ r, g, b }) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        if (max === g) h = (b - r) / d + 2;
        if (max === b) h = (r - g) / d + 4;
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function rgbToHsv({ r, g, b }) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        if (max === g) h = (b - r) / d + 2;
        if (max === b) h = (r - g) / d + 4;
        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }
    return {
        h,
        s: Math.round((max === 0 ? 0 : d / max) * 100),
        v: Math.round(max * 100)
    };
}

async function updateColor(value) {
    if (!normalizeHex(value)) {
        statusText.textContent = 'Invalid HEX color.';
        statusText.style.color = '#ff5c7a';
        return;
    }

    try {
        const response = await fetch('/api/tools/color-converter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ hex: value })
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.message || 'Color conversion failed.');

        const { hex, rgb, hsl, hsv } = payload;
        statusText.textContent = 'Ready.';
        statusText.style.color = '';
        hexInput.value = hex;
        colorInput.value = hex;
        preview.style.background = hex;
        hexOut.textContent = hex;
        rgbOut.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        hslOut.textContent = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
        hsvOut.textContent = `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`;
    } catch (error) {
        statusText.textContent = error.message || 'Color conversion failed.';
        statusText.style.color = '#ff5c7a';
    }
}

hexInput.addEventListener('input', () => updateColor(hexInput.value));
colorInput.addEventListener('input', () => updateColor(colorInput.value));
copyBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(hexOut.textContent);
    statusText.textContent = 'HEX copied.';
});
randomBtn.addEventListener('click', () => {
    const hex = `#${Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')}`;
    updateColor(hex);
});

updateColor(hexInput.value);
