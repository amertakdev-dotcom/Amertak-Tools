const DEFAULT_API_BASE = 'https://amertak-tools-f3zb.onrender.com';

function getApiBase() {
    const configuredBase = window.__AUTH_API_BASE__ || '';
    if (configuredBase) {
        return configuredBase.replace(/\/$/, '');
    }

    return DEFAULT_API_BASE;
}

const API_BASE = getApiBase();

function getApiUrl(path) {
    return `${API_BASE}${path}`;
}

function getStoredAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
}

function buildAuthHeaders(extra = {}) {
    const headers = { ...extra };
    const token = getStoredAuthToken();
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    return headers;
}

function getShareUrl(data) {
    return data?.shareUrl || data?.url || data?.link || data?.data?.shareUrl || data?.data?.url || data?.data?.link || '';
}

function createFallbackShareRecord() {
    const shareId = `local-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const record = {
        id: shareId,
        name: selectedImage?.name || 'Shared image',
        description: imageDesc?.value || selectedImage?.name || 'Shared via Amertak Tools',
        size: selectedImage?.size || 0,
        category: 'image',
        uploadedAt: new Date().toISOString(),
        downloadUrl: imageBase64 || selectedImage?.data || '',
        type: selectedImage?.type || 'image/png',
        source: 'fallback'
    };

    try {
        localStorage.setItem(`amertak-share:${shareId}`, JSON.stringify(record));
    } catch (error) {
        console.warn('Unable to store fallback share record', error);
    }

    return `${window.location.origin}/share/${shareId}`;
}

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
    if (!statusText) return;
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
        const isImage = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name);
        if (!isImage) {
            reject(new Error(`${file.name} is not an image`));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => resolve({
            id: getId(),
            name: file.name,
            size: file.size,
            type: file.type || 'image/png',
            data: reader.result,
            file
        });
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

function updateUI() {
    const hasImage = !!selectedImage;
    if (createUrlBtn) createUrlBtn.disabled = !hasImage;
    if (clearBtn) clearBtn.disabled = !hasImage;

    if (hasImage && previewImage) {
        previewImage.innerHTML = '';
        const previewImg = document.createElement('img');
        previewImg.src = selectedImage.data;
        previewImg.alt = selectedImage.name;
        previewImg.style.maxWidth = '100%';
        previewImg.style.maxHeight = '100%';
        previewImg.style.objectFit = 'contain';
        previewImage.appendChild(previewImg);
        if (previewStatus) {
            previewStatus.textContent = `${selectedImage.name} (${formatFileSize(selectedImage.size)})`;
        }
        setStatus(`Image selected: ${selectedImage.name}`, 'success');
    } else {
        if (previewImage) {
            previewImage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 18.5C7 18.5 2.73 15.39 1 11C2.73 6.61 7 3.5 12 3.5C17 3.5 21.27 6.61 23 11C21.27 15.39 17 18.5 12 18.5ZM12 16.5C15.73 16.5 19.02 14.43 20.57 11C19.02 7.57 15.73 5.5 12 5.5C8.27 5.5 4.98 7.57 3.43 11C4.98 14.43 8.27 16.5 12 16.5ZM12 14C10.34 14 9 12.66 9 11C9 9.34 10.34 8 12 8C13.66 8 15 9.34 15 11C15 12.66 13.66 14 12 14Z"></path></svg>';
        }
        if (previewStatus) {
            previewStatus.textContent = 'No image selected';
        }
        if (urlResult) {
            urlResult.style.display = 'none';
        }
        setStatus('Waiting for image');
    }
}

async function handleImageSelection(file) {
    if (!file) return;

    try {
        selectedImage = await readImage(file);
        imageBase64 = selectedImage.data;
        updateUI();
    } catch (error) {
        setStatus(error.message, 'error');
    }
}

function updateOGTags(url, description, imageData) {
    const name = selectedImage?.name || 'Image';

    const pageTitle = document.getElementById('pageTitle');
    const ogTitle = document.getElementById('ogTitle');
    const ogDesc = document.getElementById('ogDesc');
    const ogUrl = document.getElementById('ogUrl');
    const ogImage = document.getElementById('ogImage');
    const twitterTitle = document.getElementById('twitterTitle');
    const twitterDesc = document.getElementById('twitterDesc');
    const twitterImage = document.getElementById('twitterImage');

    if (pageTitle) pageTitle.textContent = `${name} - Amertak Tools`;
    if (ogTitle) ogTitle.content = `${name} - Amertak Tools`;
    if (ogDesc) ogDesc.content = description;
    if (ogUrl) ogUrl.content = url;
    if (ogImage) ogImage.content = imageData;
    if (twitterTitle) twitterTitle.content = `${name} - Amertak Tools`;
    if (twitterDesc) twitterDesc.content = description;
    if (twitterImage) twitterImage.content = imageData;
}

function initImageTool() {
    const elements = {
        dropZone: document.getElementById('dropZone'),
        imageInput: document.getElementById('imageInput'),
        imageDesc: document.getElementById('imageDesc'),
        descCount: document.getElementById('descCount'),
        createUrlBtn: document.getElementById('createUrlBtn'),
        clearBtn: document.getElementById('clearBtn'),
        statusText: document.getElementById('statusText'),
        loader: document.getElementById('loader'),
        urlResult: document.getElementById('urlResult'),
        urlOutput: document.getElementById('urlOutput'),
        copyUrlBtn: document.getElementById('copyUrlBtn'),
        previewImage: document.getElementById('previewImage'),
        previewStatus: document.getElementById('previewStatus')
    };

    const currentDropZone = elements.dropZone;
    const currentImageInput = elements.imageInput;
    const currentImageDesc = elements.imageDesc;
    const currentCreateUrlBtn = elements.createUrlBtn;
    const currentClearBtn = elements.clearBtn;
    const currentPreviewImage = elements.previewImage;
    const currentPreviewStatus = elements.previewStatus;

    if (!currentDropZone || !currentImageInput || !currentImageDesc || !currentCreateUrlBtn || !currentClearBtn || !currentPreviewImage || !currentPreviewStatus) {
        return;
    }

    if (currentDropZone.dataset.initialized === 'true') {
        return;
    }

    currentDropZone.dataset.initialized = 'true';

    Object.assign(this, elements);

    currentDropZone.addEventListener('click', () => {
        currentImageInput.click();
    });

    currentDropZone.addEventListener('dragover', (event) => {
        event.preventDefault();
        currentDropZone.classList.add('drag-over');
    });

    currentDropZone.addEventListener('dragleave', () => {
        currentDropZone.classList.remove('drag-over');
    });

    currentDropZone.addEventListener('drop', async (event) => {
        event.preventDefault();
        currentDropZone.classList.remove('drag-over');

        const files = event.dataTransfer?.files || [];
        if (files.length > 0) {
            await handleImageSelection(files[0]);
        }
    });

    currentImageInput.addEventListener('change', async (event) => {
        const files = event.target.files || [];
        if (files.length > 0) {
            await handleImageSelection(files[0]);
        }
    });

    currentImageDesc.addEventListener('input', () => {
        if (descCount) {
            descCount.textContent = currentImageDesc.value.length;
        }
    });

    currentCreateUrlBtn.addEventListener('click', async () => {
        if (!selectedImage) {
            setStatus('Please select an image', 'error');
            return;
        }

        try {
            currentCreateUrlBtn.disabled = true;
            if (loader) loader.style.display = 'flex';
            setStatus('Creating shareable URL...', '');

            const response = await fetch(getApiUrl('/api/tools/image-to-url'), {
                method: 'POST',
                headers: buildAuthHeaders({
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                }),
                credentials: 'include',
                body: JSON.stringify({
                    image: selectedImage.data,
                    fileName: selectedImage.name,
                    description: imageDesc.value.trim() || selectedImage.name,
                    imageSize: selectedImage.size
                })
            });

            let data = {};
            try {
                data = await response.json();
            } catch {
                data = {};
            }

            if (!response.ok) {
                const message = data?.message || data?.error || 'Unable to create a shareable link.';
                if (response.status === 401 || data?.loginRequired) {
                    setStatus('Please log in to create a share link.', 'error');
                } else {
                    throw new Error(message);
                }
                return;
            }

            const shareUrl = getShareUrl(data);
            if (!shareUrl) {
                throw new Error('The server did not return a valid share link.');
            }

            updateOGTags(shareUrl, currentImageDesc.value.trim() || selectedImage.name, selectedImage.data);
            if (urlOutput) {
                urlOutput.value = shareUrl;
            }
            if (urlResult) {
                urlResult.style.display = 'flex';
            }
            setStatus('URL created successfully!', 'success');
        } catch (error) {
            const fallbackUrl = createFallbackShareRecord();
            updateOGTags(fallbackUrl, currentImageDesc.value.trim() || selectedImage.name, selectedImage.data);
            if (urlOutput) {
                urlOutput.value = fallbackUrl;
            }
            if (urlResult) {
                urlResult.style.display = 'flex';
            }
            setStatus(error.message || 'Failed to create URL. A local fallback link was created instead.', 'error');
            console.error('Image to URL error:', error);
        } finally {
            currentCreateUrlBtn.disabled = false;
            if (loader) loader.style.display = 'none';
        }
    });

    if (copyUrlBtn && urlOutput) {
        copyUrlBtn.addEventListener('click', () => {
            urlOutput.select();
            document.execCommand('copy');

            const originalText = copyUrlBtn.textContent;
            copyUrlBtn.textContent = 'Copied!';
            setTimeout(() => {
                copyUrlBtn.textContent = originalText;
            }, 2000);
        });
    }

    const shareTwitter = document.getElementById('shareTwitter');
    const shareFacebook = document.getElementById('shareFacebook');
    const shareLinkedin = document.getElementById('shareLinkedin');

    if (shareTwitter) {
        shareTwitter.addEventListener('click', () => {
            const url = urlOutput?.value || '';
            const text = `Check out this image: ${imageDesc?.value || 'Shared via Amertak Tools'}`;
            window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank', 'width=600,height=400');
        });
    }

    if (shareFacebook) {
        shareFacebook.addEventListener('click', () => {
            const url = urlOutput?.value || '';
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        });
    }

    if (shareLinkedin) {
        shareLinkedin.addEventListener('click', () => {
            const url = urlOutput?.value || '';
            window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'width=600,height=400');
        });
    }

    currentClearBtn.addEventListener('click', () => {
        selectedImage = null;
        imageBase64 = null;
        if (currentImageInput) currentImageInput.value = '';
        if (currentImageDesc) currentImageDesc.value = '';
        if (descCount) descCount.textContent = '0';
        updateUI();
    });

    updateUI();
}

window.addEventListener('DOMContentLoaded', initImageTool);
initImageTool();
