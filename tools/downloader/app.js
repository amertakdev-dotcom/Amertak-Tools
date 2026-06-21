document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.querySelector('.url-input');
    const fetchBtn = document.getElementById('fetchBtn');
    const loader = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const resultsSection = document.getElementById('resultsSection');
    const videoTitle = document.getElementById('videoTitle');
    const videoAuthor = document.getElementById('videoAuthor');
    const videoThumbnail = document.getElementById('videoThumbnail');
    const downloadOptions = document.getElementById('downloadOptions');
    const platformIcons = document.querySelector('.platform-icons');
    const API_URL = '/api/tools/downloader';

    fetchBtn.addEventListener('click', fetchVideoInfo);
    urlInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') fetchVideoInfo();
    });

    loadSupportedPlatforms();

    async function loadSupportedPlatforms() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) return;
            const data = await response.json();
            if (Array.isArray(data.supportedPlatforms)) {
                renderPlatforms(data.supportedPlatforms);
            }
        } catch (error) {
            console.info('Downloader platform list unavailable', error);
        }
    }

    async function fetchVideoInfo() {
        const videoUrl = urlInput.value.trim();

        if (!isValidUrl(videoUrl)) {
            showError('Please enter a valid video URL');
            return;
        }

        hideError();
        hideResults();
        showLoader();
        fetchBtn.disabled = true;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ url: videoUrl })
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.error) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            displayVideoInfo(data);
        } catch (error) {
            console.error('Downloader error:', error);
            showError(error.message || 'Failed to fetch URL');
        } finally {
            hideLoader();
            fetchBtn.disabled = false;
        }
    }

    function displayVideoInfo(data) {
        videoTitle.textContent = data.title || 'Untitled Video';
        videoAuthor.textContent = `By ${data.author || 'Unknown'}`;

        if (data.thumbnail) {
            videoThumbnail.src = data.thumbnail;
            videoThumbnail.alt = data.title || 'Video thumbnail';
            videoThumbnail.hidden = false;
        } else {
            videoThumbnail.removeAttribute('src');
            videoThumbnail.hidden = true;
        }

        downloadOptions.innerHTML = '';

        if (Array.isArray(data.medias) && data.medias.length > 0) {
            data.medias.forEach((media) => {
                downloadOptions.appendChild(createMediaOption(media));
            });
        } else {
            downloadOptions.innerHTML = '<p>No download options available for this URL.</p>';
        }

        if (Array.isArray(data.supportedPlatforms)) {
            renderPlatforms(data.supportedPlatforms);
        }

        showResults();
    }

    function createMediaOption(media) {
        const mediaOption = document.createElement('div');
        mediaOption.className = 'media-option';

        const mediaDetails = document.createElement('div');
        mediaDetails.className = 'media-details';

        const quality = document.createElement('div');
        quality.className = 'media-quality';
        quality.textContent = formatQuality(media.quality);

        const type = document.createElement('div');
        type.className = 'media-type';
        type.textContent = `${formatLabel(media.type)} - ${formatLabel(media.extension)}`;

        const size = document.createElement('div');
        size.className = 'media-size';
        size.textContent = formatFileSize(media.size);

        mediaDetails.append(quality, type, size);

        const downloadLink = document.createElement('a');
        downloadLink.className = 'download-link';
        downloadLink.href = media.url;
        downloadLink.target = '_blank';
        downloadLink.rel = 'noopener noreferrer';
        downloadLink.textContent = 'Download';

        mediaOption.append(mediaDetails, downloadLink);
        return mediaOption;
    }

    function renderPlatforms(platforms) {
        if (!platformIcons) return;
        platformIcons.replaceChildren(...platforms.map((platform) => {
            const item = document.createElement('div');
            item.className = 'platform-icon';
            item.textContent = platform;
            return item;
        }));
    }

    function isValidUrl(value) {
        try {
            const url = new URL(value);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
            return false;
        }
    }

    function formatQuality(quality) {
        return formatLabel(quality || 'Media');
    }

    function formatLabel(value) {
        return String(value || 'file')
            .replace(/[_-]+/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    function formatFileSize(bytes) {
        const value = Number(bytes);
        if (!Number.isFinite(value) || value <= 0) return 'Size unknown';

        const units = ['Bytes', 'KB', 'MB', 'GB'];
        const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
        return `${(value / Math.pow(1024, index)).toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
    }

    function showLoader() {
        loader.style.display = 'block';
    }

    function hideLoader() {
        loader.style.display = 'none';
    }

    function showResults() {
        resultsSection.style.display = 'block';
    }

    function hideResults() {
        resultsSection.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    function hideError() {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    }
});
