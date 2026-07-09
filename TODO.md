# TODO - Downloader API (Backend)

## Step 1: Inspect & confirm current downloader API contract
- [x] Read `backend/api/tools/downloader.js`
- [x] Read `backend/server.js` to confirm route mount
- [x] Read `public/tools/downloader/app.js` to confirm expected response (`medias[]` supported)

## Step 2: Update downloader backend for requested platforms
- [ ] Restrict `supportedPlatforms` to exactly: YouTube, TikTok, Spotify, Pinterest, Instagram

## Step 3: Improve yt-dlp extraction per platform
- [ ] Enhance POST `/api/tools/downloader` logic so it returns meaningful `medias[]` for:
  - YouTube (video/audio)
  - TikTok (video OR images/thumbnail when available)
  - Instagram (video OR images/carousel thumbnails when available)
  - Spotify (audio + optional artwork)
  - Pinterest (video OR images when available)

## Step 4: Keep compatibility with frontend
- [ ] Ensure response still includes `medias[]` in normalized format (so `public/tools/downloader/app.js` works unchanged)
- [ ] Optionally populate `downloads.{video,audio,images}` if categorization is straightforward

## Step 5: Test locally
- [ ] Run backend and test:
  - GET `/api/tools/downloader` returns only the 5 platforms
  - POST with sample URLs returns non-empty results or clear errors

