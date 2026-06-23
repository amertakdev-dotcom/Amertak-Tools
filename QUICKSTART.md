# 🚀 Amertak Tools - Quick Start Guide

## Project Structure

```
┌─ Amertak Tools (Root)
│
├─ 📂 api-backend/           👈 Backend for Render
│  ├─ server.js              
│  ├─ package.json           
│  ├─ render.yaml            
│  ├─ .env.example           
│  ├─ 📂 api/
│  │  ├─ 📂 _lib/            (db, auth, require-user)
│  │  ├─ 📂 tools/           (7 tool endpoints)
│  │  └─ 📂 auth/            (login, register, logout, me)
│  └─ 📂 server/             (authRoutes, authService)
│
├─ 📂 public/                👈 Frontend for Vercel
│  ├─ *.html                 (index, login, register, etc)
│  ├─ vercel.json            
│  ├─ .env.example           
│  ├─ package.json           
│  ├─ 📂 tools/              (7 tool UIs)
│  ├─ 📂 assets/             (CSS, JS)
│  ├─ 📂 svg/                (Images)
│  └─ 📂 progress-loader/    (UI components)
│
├─ 📄 DEPLOYMENT.md          👈 Read this first!
├─ 📄 README.md              
├─ 📄 SUMMARY_KH.md          (Khmer summary)
├─ 📄 .gitignore             
├─ 📄 vercel.json            
└─ 📄 .env                    (Keep secret!)
```

---

## 5-Minute Setup

### Step 1: Environment Setup

```bash
cd api-backend
cp .env.example .env
# Edit .env with:
# - MONGOURL from MongoDB Atlas
# - JWT_SECRET (strong random string)
# - OPENAI_API_KEY (if needed)
```

### Step 2: Test Locally

```bash
cd api-backend
npm install
npm start
# Should see: "Server running on http://localhost:3001"
# Test: http://localhost:3001/health
```

### Step 3: Push to GitHub

```bash
git add .
git commit -m "Deploy ready"
git push origin main
```

### Step 4: Deploy Backend (Render)

1. https://render.com → New Web Service
2. Connect GitHub repo
3. **Build Command:** `cd api-backend && npm install`
4. **Start Command:** `cd api-backend && npm start`
5. Add environment variables (same as .env)
6. Deploy

**Get your API URL:** e.g., `https://amertaktoolsapi.onrender.com`

### Step 5: Deploy Frontend (Vercel)

1. https://vercel.com → Add Project
2. Connect GitHub repo
3. **Root Directory:** `public`
4. **Framework:** Other (static)
5. Deploy

**Get your Frontend URL:** e.g., `https://amertak-tools.vercel.app`

---

## ⚡ Quick Commands

### Backend

```bash
# Development
cd api-backend
npm install
npm start

# Production (Docker/Render will use this)
npm start
```

### Test API Locally

```bash
# Health check
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

---

## 🔧 Environment Variables

### Backend (api-backend/.env)

```env
# Database
MONGOURL=mongodb+srv://user:pass@cluster.mongodb.net/...

# Auth
JWT_SECRET=your-super-secret-key-32-chars-min

# API Keys (optional)
OPENAI_API_KEY=sk-...

# Environment
NODE_ENV=production
PORT=3001
```

### Frontend (public/.env)

```env
VITE_API_BASE_URL=https://amertaktoolsapi.onrender.com
```

---

## 📋 Deployment Checklist

- [ ] Create MongoDB Atlas cluster
- [ ] Create `.env` file in `api-backend/`
- [ ] Test locally: `npm start` works
- [ ] Push to GitHub
- [ ] Create Render Web Service
- [ ] Set Render environment variables
- [ ] Deploy to Render (test `/health`)
- [ ] Create Vercel project (root: `public/`)
- [ ] Deploy to Vercel
- [ ] Test frontend → backend connection
- [ ] Add custom domain (optional)

---

## 🔗 API Endpoints

All require authentication (JWT token or HttpOnly cookie):

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Tools
- `GET /api/tools/downloader` - Get platforms
- `POST /api/tools/downloader` - Fetch video info
- `POST /api/tools/transcribe` - Transcribe audio/video
- `POST /api/tools/qr-code` - Generate QR code
- `POST /api/tools/text-translator` - Translate text
- `POST /api/tools/text-counter` - Count text stats
- `POST /api/tools/color-converter` - Convert colors
- `POST /api/tools/image-to-url` - Upload & share images

---

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
```

### MongoDB Connection Failed
- Check MONGOURL is correct
- Check IP whitelist in MongoDB Atlas
- Ensure user has proper permissions

### CORS Error in Frontend
- Check backend CORS config
- Verify frontend URL is in whitelist
- Clear browser cache

### Build Fails on Render
- Check build command is correct
- Verify Node version >= 18
- Check package.json exists in `api-backend/`

---

## 📚 More Info

- Full guide: See `DEPLOYMENT.md`
- Khmer summary: See `SUMMARY_KH.md`
- Project info: See `README.md`

---

**Version:** 1.0.0  
**Status:** Production Ready  
**Last Updated:** 2024-12-23
