# 🚀 Amertak Tools - Production Ready

A complete web application with 7 utility tools, featuring separate cloud deployments for backend (Render) and frontend (Vercel).

## 📁 Project Structure

```
Amertak Tools/
├── backend/             ← Backend API for Render
│   ├── server.js
│   ├── package.json
│   ├── render.yaml
│   ├── .env.example
│   ├── api/
│   └── server/
│
├── public/              ← Frontend for Vercel
│   ├── index.html
│   ├── tools/
│   ├── assets/
│   ├── vercel.json
│   ├── package.json
│   └── .env.example
│
└── Documentation & Config
```

## ✨ Features

✅ User Authentication (JWT + HttpOnly Cookies)
✅ Video/Audio Downloader (13+ platforms)
✅ Audio/Video Transcription (OpenAI Whisper)
✅ QR Code Generator
✅ Text Translator
✅ Text Counter
✅ Color Converter
✅ Image Upload & Sharing (MongoDB)

## 🚀 Deployment

### Backend (Render)
**URL:** https://amertaktoolsapi.onrender.com

```bash
cd backend
npm install
npm start
```

### Frontend (Vercel)
**URL:** https://amertak-tools.vercel.app

Deploy `public/` folder to Vercel directly (static site).

## 🔧 Setup

### 1. Environment (.env)
```env
# Backend
MONGOURL=mongodb+srv://user:pass@cluster.mongodb.net/...
JWT_SECRET=your-secret-key-here
OPENAI_API_KEY=sk-...
NODE_ENV=production
```

### 2. Deploy Backend to Render
- Push to GitHub
- Create Web Service on Render
- Root: `backend/`
- Build: `npm install`
- Start: `npm start`
- Set env vars on Render dashboard

### 3. Deploy Frontend to Vercel
- Push to GitHub
- Create Project on Vercel
- Root directory: `public/`
- Deploy

## 📡 API Endpoints

**Auth:**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

**Tools:**
- GET /api/tools/downloader
- POST /api/tools/downloader
- POST /api/tools/transcribe
- POST /api/tools/qr-code
- POST /api/tools/text-translator
- POST /api/tools/text-counter
- POST /api/tools/color-converter
- POST /api/tools/image-to-url

## 📚 Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Full deployment guide
- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference
- **[SUMMARY_KH.md](SUMMARY_KH.md)** - Khmer summary
- **[VERIFICATION.md](VERIFICATION.md)** - Verification checklist

## 📞 Support

- Telegram: https://t.me/Amertak_Network
- Discord: https://discord.gg/u2e38dsewa

**Version:** 1.0.0 | **License:** MIT
