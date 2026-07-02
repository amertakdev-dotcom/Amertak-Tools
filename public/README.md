# Amertak Tools - Frontend for Vercel

Frontend application for Amertak Tools. Deployed on Vercel with integrated cloud share functionality.

**API:** Serverless functions deployed on Vercel with MongoDB Atlas

## Features

- 7 Tool UIs:
  - Video/Audio Downloader
  - Audio Transcription
  - QR Code Generator
  - Text Translator
  - Text Counter
  - Color Converter
  - Cloud Share (with upload & sharing)

- User Authentication (Login/Register)
- Responsive Design
- Progress Loader UI
- File sharing with shareable links

## Setup

```bash
# Install dependencies
npm install

# Local development
npm run dev
```

## Environment Variables

Create `.env` file (or set in Vercel dashboard):
```env
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database
MONGO_DB=amertak_tools
```

## Deploy to Vercel

1. Push to GitHub.
2. Connect the repository in Vercel.
3. Set the root directory to `public/`.
4. Add the environment variable `MONGO_URL` in the Vercel dashboard.
5. Deploy.

## CloudShare architecture

### Routes

- Upload: `/api/upload`
- Metadata lookup: `/api/file?id=xxx`
- Download: `/api/download?id=xxx`
- Share page: `/tools/cloude/share/[id]`

### Technical details

- Files are stored as base64 in MongoDB.
- Maximum file size: 100MB.
- Files expire after 24 hours.
- Uploads are validated for size and unsafe content types.
