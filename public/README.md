# Amertak Tools - Frontend for Vercel

Frontend application for Amertak Tools. Deployed on Vercel.

**API:** Fetches from https://amertaktoolsapi.onrender.com

## Features

- 7 Tool UIs:
  - Video/Audio Downloader
  - Audio Transcription
  - QR Code Generator
  - Text Translator
  - Text Counter
  - Color Converter
  - Image to URL (with upload & sharing)

- User Authentication (Login/Register)
- Responsive Design
- Progress Loader UI

## Setup

```bash
# Local development
npm run dev

# Build (static - no build needed)
npm run build
```

## Environment Variables

Create `.env` file:
```env
REACT_APP_API_URL=https://amertaktoolsapi.onrender.com
```

## Deploy to Vercel

1. Push to GitHub
2. Connect Vercel to repository
3. Set root directory to `public/`
4. Deploy

## Notes

- This is a static frontend (no build required)
- All API calls go to the Render backend
- Authentication handled via JWT + HttpOnly cookies
