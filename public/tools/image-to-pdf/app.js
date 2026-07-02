const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const previewList = document.getElementById('previewList');
const fileCount = document.getElementById('fileCount');
const pageSize = document.getElementById('pageSize');
const orientation = document.getElementById('orientation');
const imageFit = document.getElementById('imageFit');
const pageMargin = document.getElementById('pageMargin');
const createPdfBtn = document.getElementById('createPdfBtn');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');

let images = [];

function setStatus(message, type = '') {
    statusText.textContent = message;
    statusText.classList.toggle('is-error', type === 'error');
    statusText.classList.toggle('is-success', type === 'success');
}

function formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB'];
    let value = bytes;
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit += 1;
    }

    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
}

function getId() {
    if (window.crypto?.randomUUID) return crypto.randomUUID();
    return `image-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readImage(file) {
    return new Promise((resolve, reject) => {
        if (!file.type.startsWith('image/')) {
            reject(new Error(`${file.name} is not an image`));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve({
            id: getId(),
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: reader.result
        });
        reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
        reader.readAsDataURL(file);
    });
}

function loadImage(dataUrl) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Could not load image'));
        image.src = dataUrl;
    });
}

function imageToJpegData(image) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.92);
}

async function addFiles(fileList) {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    try {
        setStatus('Loading images...');
        const loaded = await Promise.all(files.map(readImage));
        images = images.concat(loaded);
        renderImages();
        setStatus('Images ready', 'success');
    } catch (error) {
        setStatus(error.message, 'error');
    }
}

function renderImages() {
    previewList.innerHTML = '';
    fileCount.textContent = images.length ? `${images.length} image${images.length === 1 ? '' : 's'} selected` : 'No images selected';
    createPdfBtn.disabled = images.length === 0;
    clearBtn.disabled = images.length === 0;

    if (!images.length) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Your images will appear here';
        previewList.appendChild(empty);
        return;
    }

    images.forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'image-item';
        item.innerHTML = `
            <img src="${image.dataUrl}" alt="${image.name}">
            <footer>
                <span>${index + 1}. ${formatFileSize(image.size)}</span>
                <span class="item-actions">
                    <button class="icon-btn" type="button" data-action="up" data-id="${image.id}" aria-label="Move image up">↑</button>
                    <button class="icon-btn" type="button" data-action="down" data-id="${image.id}" aria-label="Move image down">↓</button>
                    <button class="icon-btn" type="button" data-action="remove" data-id="${image.id}" aria-label="Remove image">×</button>
                </span>
            </footer>
        `;
        previewList.appendChild(item);
    });
}

function moveImage(id, direction) {
    const index = images.findIndex((image) => image.id === id);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= images.length) return;

    const [image] = images.splice(index, 1);
    images.splice(nextIndex, 0, image);
    renderImages();
}

function removeImage(id) {
    images = images.filter((image) => image.id !== id);
    renderImages();
    setStatus(images.length ? 'Image removed' : 'Waiting for images');
}

function getImagePlacement(image, pdfWidth, pdfHeight, margin, mode) {
    const availableWidth = Math.max(pdfWidth - margin * 2, 10);
    const availableHeight = Math.max(pdfHeight - margin * 2, 10);
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const pageRatio = availableWidth / availableHeight;
    const shouldFitWidth = mode === 'contain' ? imageRatio > pageRatio : imageRatio < pageRatio;

    let width;
    let height;

    if (shouldFitWidth) {
        width = availableWidth;
        height = width / imageRatio;
    } else {
        height = availableHeight;
        width = height * imageRatio;
    }

    return {
        x: (pdfWidth - width) / 2,
        y: (pdfHeight - height) / 2,
        width,
        height
    };
}

async function createPdf() {
    if (!images.length) return;

    if (!window.jspdf?.jsPDF) {
        setStatus('PDF library failed to load', 'error');
        return;
    }

    try {
        createPdfBtn.disabled = true;
        setStatus('Creating PDF...');

        const pdf = new window.jspdf.jsPDF({
            orientation: orientation.value,
            unit: 'mm',
            format: pageSize.value
        });

        const pdfid = Math.random().toString(16).substring(9);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const margin = Math.min(Math.max(Number(pageMargin.value) || 0, 0), 40);
        pageMargin.value = margin;

        for (let index = 0; index < images.length; index += 1) {
            if (index > 0) pdf.addPage(pageSize.value, orientation.value);

            const imageElement = await loadImage(images[index].dataUrl);
            const placement = getImagePlacement(imageElement, pdfWidth, pdfHeight, margin, imageFit.value);
            pdf.addImage(imageToJpegData(imageElement), 'JPEG', placement.x, placement.y, placement.width, placement.height);
        }

        pdf.save('amertak_' + pdfid + '.pdf');
        setStatus('PDF downloaded', 'success');
    } catch (error) {
        setStatus('Could not create PDF', 'error');
        console.error(error);
    } finally {
        createPdfBtn.disabled = images.length === 0;
    }
}

function clearImages() {
    images = [];
    imageInput.value = '';
    renderImages();
    setStatus('Waiting for images');
}

function initImageToPdf() {
    renderImages();

    imageInput.addEventListener('change', (event) => addFiles(event.target.files));
    createPdfBtn.addEventListener('click', createPdf);
    clearBtn.addEventListener('click', clearImages);

    previewList.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const { action, id } = button.dataset;
        if (action === 'up') moveImage(id, -1);
        if (action === 'down') moveImage(id, 1);
        if (action === 'remove') removeImage(id);
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
        addFiles(event.dataTransfer.files);
    });
}

document.addEventListener('DOMContentLoaded', initImageToPdf);

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
