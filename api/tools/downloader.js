const DOWNLOADER_HOST = 'social-download-all-in-one.p.rapidapi.com';
const DOWNLOADER_URL = `https://${DOWNLOADER_HOST}/v1/social/autolink`;

const SUPPORTED_PLATFORMS = [
  'TikTok',
  'Instagram',
  'YouTube',
  'Facebook',
  'X / Twitter',
  'Threads',
  'Snapchat',
  'Pinterest',
  'Reddit',
  'Vimeo',
  'Dailymotion',
  'SoundCloud',
  'Likee',
  'CapCut',
  'Bilibili'
];

function getRapidApiKey() {
  return (
    process.env.SOCIAL_DOWNLOADER_API_KEY ||
    process.env.DOWNLOADER_API_KEY ||
    process.env.RAPIDAPI_KEY ||
    process.env.X_RAPIDAPI_KEY
  );
}

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeMedia(media = {}) {
  const type = media.type || media.format || media.extension || 'media';
  const extension = media.extension || media.ext || String(type).split('/').pop() || 'file';

  return {
    url: media.url || media.link || media.download_url,
    quality: media.quality || media.resolution || media.label || type,
    type,
    extension,
    size: media.data_size || media.size || media.filesize || null
  };
}

function normalizePayload(payload) {
  const sourceMedias = Array.isArray(payload?.medias)
    ? payload.medias
    : Array.isArray(payload?.media)
      ? payload.media
      : Array.isArray(payload?.links)
        ? payload.links
        : [];

  return {
    success: true,
    title: payload?.title || payload?.caption || payload?.description || 'Untitled',
    author: payload?.author || payload?.username || payload?.source || 'Unknown',
    thumbnail: payload?.thumbnail || payload?.thumb || payload?.cover || '',
    source: payload?.source || payload?.platform || '',
    duration: payload?.duration || null,
    medias: sourceMedias.map(normalizeMedia).filter((media) => media.url),
    supportedPlatforms: SUPPORTED_PLATFORMS
  };
}

async function handleDownloader(req, res) {
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      supportedPlatforms: SUPPORTED_PLATFORMS
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const url = String(req.body?.url || '').trim();
  if (!url || !isValidUrl(url)) {
    res.status(400).json({ message: 'Please enter a valid http or https URL.' });
    return;
  }

  const apiKey = getRapidApiKey();
  if (!apiKey) {
    res.status(500).json({
      message: 'Downloader API key is not configured. Set SOCIAL_DOWNLOADER_API_KEY in Vercel.'
    });
    return;
  }

  try {
    const response = await fetch(DOWNLOADER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Host': DOWNLOADER_HOST,
        'X-RapidAPI-Key': apiKey
      },
      body: JSON.stringify({ url })
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok || payload?.error) {
      res.status(response.status || 502).json({
        message: payload?.message || payload?.error || 'Downloader service failed.'
      });
      return;
    }

    const normalized = normalizePayload(payload);
    if (!normalized.medias.length) {
      res.status(404).json({
        message: 'No downloadable media was found for this URL.',
        ...normalized
      });
      return;
    }

    res.status(200).json(normalized);
  } catch (error) {
    console.error('Downloader API error:', error);
    res.status(502).json({ message: 'Unable to reach downloader service.' });
  }
}

module.exports = handleDownloader;
