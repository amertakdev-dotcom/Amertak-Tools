const { execFile } = require('child_process');
const { promisify } = require('util');
const youtubedl = require('youtube-dl-exec');
const { requireUser } = require('../_lib/require-user');

const execFileAsync = promisify(execFile);
const YTDLP_BINARY = process.env.YTDLP_PATH || 'yt-dlp';

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
  'Bilibili'
];

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function formatBytes(value) {
  const size = Number(value);
  return Number.isFinite(size) && size > 0 ? size : null;
}

function normalizeFormat(format = {}) {
  const url = format.url || format.fragment_base_url;
  if (!url) return null;

  const hasVideo = format.vcodec && format.vcodec !== 'none';
  const hasAudio = format.acodec && format.acodec !== 'none';
  const extension = format.ext || 'media';
  const height = format.height ? `${format.height}p` : '';
  const fps = format.fps ? `${format.fps}fps` : '';
  const quality = [height, fps, format.format_note || format.resolution].filter(Boolean).join(' ') || format.format_id || extension;

  return {
    url,
    quality,
    type: hasVideo && hasAudio ? 'video' : hasVideo ? 'video only' : hasAudio ? 'audio' : 'media',
    extension,
    size: formatBytes(format.filesize || format.filesize_approx)
  };
}

function normalizePayload(payload) {
  const formats = Array.isArray(payload.formats) ? payload.formats : [];
  const medias = formats
    .map(normalizeFormat)
    .filter(Boolean)
    .filter((media, index, list) => list.findIndex((item) => item.url === media.url) === index)
    .slice(0, 24);

  if (!medias.length && payload.url) {
    medias.push({
      url: payload.url,
      quality: payload.format || payload.ext || 'media',
      type: payload.vcodec && payload.vcodec !== 'none' ? 'video' : 'media',
      extension: payload.ext || 'media',
      size: formatBytes(payload.filesize || payload.filesize_approx)
    });
  }

  return {
    success: true,
    title: payload.title || payload.fulltitle || 'Untitled',
    author: payload.uploader || payload.channel || payload.creator || 'Unknown',
    thumbnail: payload.thumbnail || '',
    source: payload.extractor_key || payload.extractor || '',
    duration: payload.duration || null,
    medias,
    supportedPlatforms: SUPPORTED_PLATFORMS
  };
}

async function handleDownloader(req, res) {
  const user = await requireUser(req, res);
  if (!user) return;

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

  try {
    let payload = null;
    const ytdlpArgs = [
      '--dump-single-json',
      '--no-warnings',
      '--no-call-home',
      '--no-check-certificate',
      '--skip-download',
      '--prefer-free-formats',
      '--add-header', 'referer:youtube.com',
      '--add-header', 'user-agent:Mozilla/5.0',
      url
    ];

    try {
      const { stdout } = await execFileAsync(YTDLP_BINARY, ytdlpArgs, { maxBuffer: 20 * 1024 * 1024 });
      payload = JSON.parse(stdout);
    } catch (primaryError) {
      console.warn('yt-dlp failed, falling back to youtube-dl-exec:', primaryError.message || primaryError);
      try {
        payload = await youtubedl(url, {
          dumpSingleJson: true,
          noWarnings: true,
          noCallHome: true,
          noCheckCertificates: true,
          skipDownload: true,
          preferFreeFormats: true,
          addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0']
        });
      } catch (fallbackError) {
        console.error('yt-dlp primary error:', primaryError);
        console.error('youtube-dl-exec fallback error:', fallbackError);
        throw fallbackError;
      }
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
    console.error('downloader error:', error);
    res.status(502).json({
      message: 'Unable to fetch media from the provided URL. The site may block downloads or require login.'
    });
  }
}

module.exports = handleDownloader;
