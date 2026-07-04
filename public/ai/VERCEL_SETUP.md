# Vercel Deployment Setup for Gemini API
# ការដំឡើងសម្រាប់ Vercel និង Gemini API

## Quick Setup Guide / មគ្គុជ្ឈានរហ័ស

### Step 1: Get Your Gemini API Key
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with your Google account
3. Click "Get API Key" or "Create API Key"
4. Copy the generated API key

### Step 2: Add API Key to Vercel

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to your Vercel project dashboard
2. Click on your project
3. Navigate to **Settings** → **Environment Variables**
4. Add a new environment variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Paste your API key here
   - **Environment**: Select both "Production" and "Preview"
5. Click **Save**
6. **Redeploy** your project for changes to take effect

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Add environment variable
vercel env add GEMINI_API_KEY production

# Redeploy
vercel --prod
```

### Step 3: Verify Configuration

Test your API endpoint:
```bash
# Check API status
curl -X POST https://your-domain.com/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"action": "status"}'

# Expected response:
# {
#   "success": true,
#   "configured": true,
#   "message": "Gemini API is configured"
# }
```

## API Endpoint Documentation

### POST /api/gemini

The endpoint supports three actions:

#### 1. Validate API Key
```bash
POST /api/gemini
Content-Type: application/json

{
  "action": "validate",
  "apiKey": "your-api-key-here"
}
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "message": "Gemini API key is valid and working!",
  "configured": true
}
```

#### 2. Check Status
```bash
POST /api/gemini
Content-Type: application/json

{
  "action": "status"
}
```

**Response:**
```json
{
  "success": true,
  "configured": true,
  "hasKey": true,
  "message": "Gemini API is configured",
  "setupInstructions": {
    "vercel": [...],
    "getApiKey": "https://aistudio.google.com/app/apikey"
  }
}
```

#### 3. Get Configuration
```bash
POST /api/gemini
Content-Type: application/json

{
  "action": "config"
}
```

**Response:**
```json
{
  "success": true,
  "configured": true,
  "model": "gemini-2.0-flash-exp",
  "baseUrl": "https://generativelanguage.googleapis.com/v1beta",
  "features": {
    "chat": true,
    "coding": true,
    "translation": true
  }
}
```

## Frontend Integration

The frontend automatically detects the API configuration:

```javascript
// Check if Gemini API is configured
const response = await fetch('/api/gemini', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'status' })
});

const data = await response.json();
if (data.configured) {
  console.log('Gemini API is ready!');
}
```

## Troubleshooting

### Issue: "Gemini API key not configured"
**Solution**: Make sure you've added the `GEMINI_API_KEY` environment variable in Vercel and redeployed your project.

### Issue: "Invalid API key"
**Solution**: 
1. Verify your API key at https://aistudio.google.com/app/apikey
2. Make sure the key is correctly copied without extra spaces
3. Check if the key has been revoked or expired

### Issue: API works locally but not on Vercel
**Solution**:
1. Ensure environment variables are set for "Production" environment
2. Redeploy after adding environment variables
3. Check Vercel deployment logs for errors

## Security Notes

- ⚠️ **Never commit API keys to version control**
- ✅ Use Vercel environment variables for production
- ✅ The `.env` file is already in `.gitignore`
- ✅ API keys are never exposed in frontend code
- ✅ The `/api/gemini` endpoint only returns configuration status, not the actual key

## File Structure

```
public/
├── api/
│   └── gemini.js          # Gemini API configuration endpoint
├── ai/
│   ├── .env               # Local development (gitignored)
│   ├── .env.example       # Example configuration
│   └── js/
│       └── config.js      # Frontend configuration loader
└── vercel.json            # Vercel routing configuration
```

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables in Vercel dashboard
3. Test the API endpoint directly
4. Review browser console for frontend errors

---

**Created for**: Amertak Platform  
**Developer**: Kin Thavrath  
**Website**: https://amertak.com