const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const imageDesc = document.getElementById('imageDesc');
const descCount = document.getElementById('descCount');
const createUrlBtn = document.getElementById('createUrlBtn');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');
const loader = document.getElementById('loader');
const urlResult = document.getElementById('urlResult');
const urlOutput = document.getElementById('urlOutput');
const copyUrlBtn = document.getElementById('copyUrlBtn');
const previewImage = document.getElementById('previewImage');
const previewStatus = document.getElementById('previewStatus');

let selectedImage = null;
let imageBase64 = null;

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
            data: reader.result
        });
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function updateUI() {
    const hasImage = !!selectedImage;
    createUrlBtn.disabled = !hasImage;
    clearBtn.disabled = !hasImage;

    if (hasImage) {
        previewImage.innerHTML = `<img src="${selectedImage.data}" alt="Preview">`;
        previewStatus.textContent = `${selectedImage.name} (${formatFileSize(selectedImage.size)})`;
        setStatus(`Image selected: ${selectedImage.name}`, 'success');
    } else {
        previewImage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 18.5C7 18.5 2.73 15.39 1 11C2.73 6.61 7 3.5 12 3.5C17 3.5 21.27 6.61 23 11C21.27 15.39 17 18.5 12 18.5ZM12 16.5C15.73 16.5 19.02 14.43 20.57 11C19.02 7.57 15.73 5.5 12 5.5C8.27 5.5 4.98 7.57 3.43 11C4.98 14.43 8.27 16.5 12 16.5ZM12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14Z"></path></svg>';
        previewStatus.textContent = 'No image selected';
        urlResult.style.display = 'none';
        setStatus('Waiting for image');
    }
}

// Drop zone events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        try {
            selectedImage = await readImage(files[0]);
            imageBase64 = selectedImage.data;
            updateUI();
        } catch (error) {
            setStatus(error.message, 'error');
        }
    }
});

imageInput.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
        try {
            selectedImage = await readImage(files[0]);
            imageBase64 = selectedImage.data;
            updateUI();
        } catch (error) {
            setStatus(error.message, 'error');
        }
    }
});

// Description counter
imageDesc.addEventListener('input', () => {
    descCount.textContent = imageDesc.value.length;
});

// Create URL
createUrlBtn.addEventListener('click', async () => {
    if (!selectedImage) {
        setStatus('Please select an image', 'error');
        return;
    }

    try {
        createUrlBtn.disabled = true;
        loader.style.display = 'flex';
        setStatus('Creating shareable URL...', '');

        const response = await fetch('/api/tools/image-to-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
                image: imageBase64,
                fileName: selectedImage.name,
                description: imageDesc.value || selectedImage.name,
                imageSize: selectedImage.size
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to create URL');
        }

        const data = await response.json();
        
        // Update OG tags for social media preview
        updateOGTags(data.shareUrl, imageDesc.value || selectedImage.name, selectedImage.data);
        
        // Display result
        urlOutput.value = data.shareUrl;
        urlResult.style.display = 'flex';
        setStatus('URL created successfully!', 'success');

    } catch (error) {
        setStatus(error.message || 'Failed to create URL', 'error');
        console.error('Error:', error);
    } finally {
        createUrlBtn.disabled = false;
        loader.style.display = 'none';
    }
});

// Copy URL
copyUrlBtn.addEventListener('click', () => {
    urlOutput.select();
    document.execCommand('copy');
    
    const originalText = copyUrlBtn.textContent;
    copyUrlBtn.textContent = 'Copied!';
    setTimeout(() => {
        copyUrlBtn.textContent = originalText;
    }, 2000);
});

// Share buttons
document.getElementById('shareTwitter').addEventListener('click', () => {
    const url = urlOutput.value;
    const text = `Check out this image: ${imageDesc.value || 'Shared via Amertak Tools'}`;
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
});

document.getElementById('shareFacebook').addEventListener('click', () => {
    const url = urlOutput.value;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
});

document.getElementById('shareLinkedin').addEventListener('click', () => {
    const url = urlOutput.value;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
});

// Clear
clearBtn.addEventListener('click', () => {
    selectedImage = null;
    imageBase64 = null;
    imageInput.value = '';
    imageDesc.value = '';
    descCount.textContent = '0';
    updateUI();
});

function updateOGTags(url, description, imageData) {
    // Update page title
    document.getElementById('pageTitle').textContent = `${selectedImage.name} - Amertak Tools`;
    
    // Update OG tags
    document.getElementById('ogTitle').content = `${selectedImage.name} - Amertak Tools`;
    document.getElementById('ogDesc').content = description;
    document.getElementById('ogUrl').content = url;
    document.getElementById('ogImage').content = imageData;
    
    // Update Twitter tags
    document.getElementById('twitterTitle').content = `${selectedImage.name} - Amertak Tools`;
    document.getElementById('twitterDesc').content = description;
    document.getElementById('twitterImage').content = imageData;
}

// Initialize UI
updateUI();
