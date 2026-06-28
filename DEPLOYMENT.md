# 🚀 Amertak Tools - Deployment Guide

Complete guide for deploying Amertak Tools to production using Render (Backend) and Vercel (Frontend).

## 📋 Prerequisites

Before starting, ensure you have:

1. **MongoDB Atlas Account** - https://www.mongodb.com/cloud/atlas
   - Create a cluster and get your connection string (MONGOURL)
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/?appName=toolsAmertak`

2. **Render Account** - https://render.com
   - For backend API hosting

3. **Vercel Account** - https://vercel.com
   - For frontend hosting (or use any static host)

4. **GitHub Repository** - Push this code to GitHub
   - Both Render and Vercel will deploy directly from GitHub

5. **OpenAI API Key** (Optional) - https://platform.openai.com
   - Only needed if you want transcription feature
   - Sign up and create an API key

---

## 🔑 Step 1: Set Up Environment Variables

### 1.1 Create `.env` file in root directory

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# MongoDB Connection String (from MongoDB Atlas)
MONGOURL=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/?appName=toolsAmertak

# JWT Secret (use a strong random string)
# Generate one: openssl rand -base64 32
JWT_SECRET=your-super-secret-key-change-this-in-production

# OpenAI API Key (optional, for transcription)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Environment
NODE_ENV=production

# Port (Render will set this automatically)
PORT=3001

# Optional: Path to yt-dlp if not in system PATH
# YTDLP_PATH=/usr/bin/yt-dlp
```

⚠️ **IMPORTANT:** Never commit `.env` to GitHub! It's already in `.gitignore`.

---

## 🔌 Step 2: Deploy Backend to Render

### 2.1 Push code to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2.2 Create Render Service

1. Go to https://render.com
2. Click **"New +"** → **"Web Service"**
3. Select **"Connect a GitHub repository"**
4. Find and connect your repository
5. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `amertak-tools-api` |
| **Region** | Choose closest to your users |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `cd api-backend && npm install` |
| **Start Command** | `cd api-backend && npm start` |

### 2.3 Set Environment Variables in Render

In Render dashboard, go to **Environment** tab and add:

| Key | Value |
|-----|-------|
| `MONGOURL` | Paste from your `.env` |
| `JWT_SECRET` | Paste from your `.env` |
| `OPENAI_API_KEY` | Paste from your `.env` (if using transcription) |
| `NODE_ENV` | `production` |

### 2.4 Deploy

Click **"Deploy"** and wait for the build to complete.

**Your API URL will be:** `https://amertaktoolsapi.onrender.com`

✅ Test it: Visit `https://amertaktoolsapi.onrender.com/health` - should return `{"status":"ok"}`

---

## 🎨 Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Project

1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Select **"Import Git Repository"**
4. Find and import your repository
5. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Other` (static site) |
| **Root Directory** | `public` |
| **Build Command** | Leave empty or `npm install` |
| **Output Directory** | `.` (root of public folder) |

### 3.2 No Environment Variables Needed for Frontend

Frontend doesn't need secrets. It connects to the backend API.

### 3.3 Deploy

Click **"Deploy"** and wait for build to complete.

**Your Frontend URL will be:** `https://amertak-tools.vercel.app` (or custom domain)

---

## 🔗 Step 4: Configure Frontend API Endpoints

The frontend must know the backend API URL. Update these files:

### 4.1 Update `public/tools/downloader/app.js`

Find this line:
```javascript
const API_URL = '/api/tools/downloader';
```

Change to:
```javascript
const API_URL = 'https://amertaktoolsapi.onrender.com/api/tools/downloader';
```

### 4.2 Update `public/tools/video-audio-transcribe/app.js`

Find:
```javascript
const TRANSCRIBE_API_URL = '/api/tools/transcribe';
```

Change to:
```javascript
const TRANSCRIBE_API_URL = 'https://amertaktoolsapi.onrender.com/api/tools/transcribe';
```

### 4.3 Update `public/assets/js/app.js`

Find all `/api/` URLs and replace with:
```
https://amertaktoolsapi.onrender.com/api/
```

### 4.4 Push Changes

```bash
git add .
git commit -m "Update API URLs for production"
git push origin main
```

Both Render and Vercel will auto-redeploy. Give it 2-3 minutes.

---

## ✅ Step 5: Verify Deployment

### 5.1 Test Backend API

Visit these URLs and check responses:

- **Health Check**: `https://amertaktoolsapi.onrender.com/health`
- **Register**: Make POST request to `/api/auth/register`
- **Login**: Make POST request to `/api/auth/login`

### 5.2 Test Frontend

1. Go to `https://amertak-tools.vercel.app`
2. Click **Register** → Create account
3. Click **Login** → Login with your credentials
4. Try different tools (Downloader, QR Code, Translator, etc.)

### 5.3 Monitor Render Logs

In Render dashboard:
1. Go to your service
2. Click **"Logs"** tab
3. Watch for errors

---

## 🐛 Troubleshooting

### API returns 401 Unauthorized
- Ensure JWT_SECRET is the same on Render and in your `.env`
- Check browser cookies - auth cookie should be present
- Clear browser cache and try again

### Downloader not working
- Make sure yt-dlp is installed on Render (it usually is)
- Check Render logs for errors
- Some websites may block automated downloads

### Transcription failing
- Verify OPENAI_API_KEY is set on Render
- Check OpenAI billing and quota
- Ensure file size is < 200MB
- Verify audio/video file format is supported

### MongoDB Connection Error
- Check MONGOURL format
- Verify MongoDB Atlas IP whitelist includes Render IP
- Check database user has proper permissions

### CORS Errors
- Backend already has CORS configured for `amertak-tools.vercel.app`
- If using custom domain, add it to CORS whitelist in `api-backend/server.js`

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Use strong JWT_SECRET (at least 32 characters)
- [ ] Rotate JWT_SECRET every 90 days
- [ ] Use HTTPS for all connections
- [ ] Enable MongoDB IP whitelist (Render IP)
- [ ] Restrict API to only necessary origins
- [ ] Keep dependencies updated (`npm audit fix`)
- [ ] Monitor Render logs for errors
- [ ] Enable Vercel Analytics

---

## 📊 Monitoring & Maintenance

### Check Server Status
- Render: Dashboard → Logs
- Vercel: Dashboard → Deployments

### View Live Logs
```bash
# For backend (if using Render CLI)
render logs --service-id=<service-id>
```

### Update Dependencies
```bash
cd api-backend
npm outdated
npm update
git push origin main
```

---

## 🚀 Next Steps

1. **Custom Domain**: Add custom domain in Render & Vercel settings
2. **SSL Certificate**: Automatic (provided by Render & Vercel)
3. **Database Backups**: Set up MongoDB Atlas automatic backups
4. **Analytics**: Enable Vercel Analytics & Monitoring
5. **CDN**: Vercel includes CDN, Render uses standard hosting
6. **Auto-scaling**: Both platforms auto-scale based on traffic

---

## 📞 Support

Having issues? Check:
- [Render Docs](https://render.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)
- [OpenAI API Docs](https://platform.openai.com/docs)

**Contact Us:**
- Telegram: https://t.me/Amertak_Network
- Discord: https://discord.gg/u2e38dsewa

---

**Last Updated:** 2026-06-23  
**Version:** 1.0.0
