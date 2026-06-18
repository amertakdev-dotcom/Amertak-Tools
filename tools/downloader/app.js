document.addEventListener('DOMContentLoaded', function() {
            const urlInput = document.querySelector('.url-input');
            const fetchBtn = document.getElementById('fetchBtn');
            const loader = document.getElementById('loading');
            const errorMessage = document.getElementById('errorMessage');
            const errorPg = document.getElementById('error-pg');
            const resultsSection = document.getElementById('resultsSection');
            const videoTitle = document.getElementById('videoTitle');
            const videoAuthor = document.getElementById('videoAuthor');
            const videoThumbnail = document.getElementById('videoThumbnail');
            const downloadOptions = document.getElementById('downloadOptions');
            
            function errorpg(errorpg) {
                errorPg.addEventListener('animationend', () => {
                    errorMessage.classList.toggle("show-error")
                    errorPg.classList.toggle("showpg")
                });
            };
            // API configuration
            const API_URL = 'https://social-download-all-in-one.p.rapidapi.com/v1/social/autolink';
            const API_KEY = '29f8c3b79amshc7b9755d426320dp1b94fajsn62b1821d47db';
            
            fetchBtn.addEventListener('click', fetchVideoInfo);
            
            // Allow Enter key to trigger the download
            urlInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    fetchVideoInfo();
                }
            });
            
            async function fetchVideoInfo() {
                const videoUrl = urlInput.value.trim();
                
                if (!videoUrl) {
                    showError('Please enter a valid video URL');
                    return;
                }
                
                // Reset UI
                hideError();
                hideResults();
                showLoader();
                fetchBtn.disabled = true;
                
                try {
                    const response = await fetch(API_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-RapidAPI-Host': 'social-download-all-in-one.p.rapidapi.com',
                            'X-RapidAPI-Key': API_KEY
                        },
                        body: JSON.stringify({ url: videoUrl })
                    });
                    
                    if (!response.ok) {
                        throw new Error(`API request failed with status ${response.status}`);
                    }
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        throw new Error(data.message || 'Failed to fetch url information');
                    }
                    
                    displayVideoInfo(data);
                    
                } catch (error) {
                    console.error('Error:', error);
                    showError(`Failed to fetch url: ${error.message}`);
                } finally {
                    hideLoader();
                    fetchBtn.disabled = false;
                }
            }
            
            function displayVideoInfo(data) {
                // Set video information
                videoTitle.textContent = data.title || 'Untitled Video';
                videoAuthor.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg> By ${data.author || 'Unknown'}`;
                
                if (data.thumbnail) {
                    videoThumbnail.src = data.thumbnail;
                    videoThumbnail.alt = data.title || 'Video Thumbnail';
                }
                
                // Clear previous download options
                downloadOptions.innerHTML = '';
                
                // Create download options for each media
                if (data.medias && data.medias.length > 0) {
                    data.medias.forEach((media, index) => {
                        const mediaOption = document.createElement('div');
                        mediaOption.className = 'media-option';
                        
                        const mediaDetails = document.createElement('div');
                        mediaDetails.className = 'media-details';
                        
                        const quality = document.createElement('div');
                        quality.className = 'media-quality';
                        quality.textContent = formatQuality(media.quality);
                        
                        const type = document.createElement('div');
                        type.className = 'media-type';
                        type.textContent = `${media.type.toUpperCase()} • ${media.extension.toUpperCase()}`;
                        
                        const size = document.createElement('div');
                        size.className = 'media-size';
                        size.textContent = formatFileSize(media.data_size);
                        
                        mediaDetails.appendChild(quality);
                        mediaDetails.appendChild(type);
                        mediaDetails.appendChild(size);
                        
                        const downloadLink = document.createElement('a');
                        downloadLink.className = 'download-link';
                        downloadLink.href = media.url;
                        downloadLink.target = '_blank';
                        downloadLink.textContent = 'Download';
                        
                        mediaOption.appendChild(mediaDetails);
                        mediaOption.appendChild(downloadLink);
                        
                        downloadOptions.appendChild(mediaOption);
                    });
                } else {
                    downloadOptions.innerHTML = '<p>No download options available for this video.</p>';
                }
                
                showResults();
            }
            
            function formatQuality(quality) {
                // Convert quality string to a more readable format
                return quality
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
            }
            
            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
                errorMessage.style.display = 'none';
            }
        });