# Cloud Tools - Vercel Deployment Guide

## Overview
This guide covers deploying the CloudShare file upload/download tool to Vercel with MongoDB Atlas integration.

## Architecture
- **Frontend**: Static HTML/CSS/JS hosted on Vercel
- **API Routes**: Serverless functions (`/api/upload`, `/api/download`, `/api/file`, `/api/share/:id`)
- **Database**: MongoDB Atlas for file metadata and share links storage
- **File Storage**: Base64 encoded files stored directly in MongoDB (100MB limit per file)

## Prerequisites
1. Vercel account
2. MongoDB Atlas account (free tier available)
3. Git repository connected to Vercel

## Step 1: MongoDB Atlas Setup

### Create a Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create a new project
3. Build a cluster (choose M0 Sandbox - Free tier)
4. Select your preferred cloud provider and region

### Configure Database Access
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Create a strong password (save this!)
5. Grant permissions: **Read and write to any database**
6. Click **Add User**

### Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. For Vercel deployment, choose **Allow Access from Anywhere** (0.0.0.0/0)
   - Note: For production, you can restrict to Vercel's IP ranges
4. Click **Confirm**

### Get Connection String
1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** as driver
5. Copy the connection string (it looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your database user credentials
7. Add database name: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/amertak_tools?retryWrites=true&w=majority`

## Step 2: Vercel Configuration

### Environment Variables
Set the following environment variables in your Vercel project:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `MONGO_URL` | Your MongoDB connection string | Primary MongoDB connection URI |
| `MONGO_DB` | `amertak_tools` | Database name (optional, defaults to this) |

**Example:**
```
MONGO_URL=mongodb+srv://amertak_user:SecurePass123@cluster0.abc123.mongodb.net/amertak_tools?retryWrites=true&w=majority
MONGO_DB=amertak_tools
```

### Deploy to Vercel
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will auto-detect the configuration from `vercel.json`
4. Click **Deploy**

## Step 3: Verify Deployment

### Test API Endpoints
After deployment, test these endpoints:

1. **Upload endpoint**: `POST https://your-domain.vercel.app/api/upload`
   - Send a test file with base64 encoding
   - Should return a share URL

2. **File info endpoint**: `GET https://your-domain.vercel.app/api/file?id=<share-id>`
   - Should return file metadata

3. **Download endpoint**: `GET https://your-domain.vercel.app/api/download?id=<share-id>`
   - Should download the file

4. **Share page**: Visit `https://your-domain.vercel.app/tools/cloude/share/<share-id>`
   - Should display file details and download button

### Test File Upload
1. Visit `https://your-domain.vercel.app/tools/cloude/`
2. Upload a test file (under 100MB)
3. Copy the generated share link
4. Open the link in an incognito window
5. Verify the file downloads correctly

## File Structure

```
├── api/
│   ├── upload.js          # Upload endpoint
│   ├── download.js        # Download endpoint
│   ├── file.js            # File metadata endpoint
│   ├── gemini.js          # Gemini AI endpoint
│   ├── share/
│   │   └── [id].js        # Share info endpoint
│   └── _lib/
│       └── cloud-share.js # MongoDB operations
├── public/
│   ├── tools/
│   │   └── cloude/
│   │       ├── index.html # Upload page
│   │       ├── app.js     # Upload logic
│   │       ├── share.html # Download page
│   │       └── share.js   # Download logic
│   └── vercel.json        # Vercel config
├── vercel.json            # Root Vercel config
└── .env                   # Environment variables (DO NOT COMMIT)
```

## API Routes

### POST /api/upload
Upload files and generate share links.

**Request Body:**
```json
{
  "fileName": "example.pdf",
  "mimeType": "application/pdf",
  "size": 1024000,
  "description": "Optional description",
  "fileData": "base64-encoded-content"
}
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "files": [
    {
      "success": true,
      "shareId": "share-1234567890-abc123",
      "shareUrl": "https://your-domain.vercel.app/tools/cloude/share/share-1234567890-abc123",
      "file": {
        "id": "share-1234567890-abc123",
        "fileName": "example.pdf",
        "mimeType": "application/pdf",
        "size": 1024000,
        "category": "pdf",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "expiresAt": "2024-01-02T00:00:00.000Z",
        "downloads": 0,
        "shareUrl": "https://your-domain.vercel.app/tools/cloude/share/share-1234567890-abc123"
      }
    }
  ]
}
```

### GET /api/download?id=<share-id>
Download a file by ID.

**Response:** Binary file data with appropriate headers

### GET /api/file?id=<share-id>
Get file metadata by ID.

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "share-1234567890-abc123",
    "fileName": "example.pdf",
    "name": "example.pdf",
    "description": "Optional description",
    "mimeType": "application/pdf",
    "size": 1024000,
    "category": "pdf",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-02T00:00:00.000Z",
    "downloads": 0,
    "shareUrl": "/tools/cloude/share/share-1234567890-abc123"
  }
}
```

### GET /api/share/:id
Get share information by ID.

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "share-1234567890-abc123",
    "fileName": "example.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "category": "pdf",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-02T00:00:00.000Z",
    "downloads": 0,
    "shareUrl": "/tools/cloude/share/share-1234567890-abc123"
  }
}
```

## Important Notes

### File Size Limits
- Maximum file size: **100MB**
- Files are stored as base64 in MongoDB
- Large files will increase MongoDB document size significantly

### File Expiry
- Files expire after **24 hours** (configurable in `api/_lib/cloud-share.js`)
- Expired files are automatically deleted on next API call

### Security Considerations
1. **Environment Variables**: Never commit `.env` file to version control
2. **MongoDB Access**: Use strong passwords and restrict network access when possible
3. **File Validation**: The API validates file types and blocks potentially dangerous files (JavaScript, HTML, SVG, XML)
4. **CORS**: API endpoints allow all origins (`*`) - restrict this in production if needed

### Vercel Limitations
- **Serverless Function Timeout**: 10 seconds (Hobby) / 60 seconds (Pro)
- **Payload Size**: 4.5MB for serverless functions
- **Solution**: For files > 4.5MB, consider using Vercel Blob Storage or AWS S3

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGO_URL` is correctly set in Vercel environment variables
- Check MongoDB Atlas network access allows Vercel IPs
- Ensure database user has correct permissions

### Upload Failures
- Check file size is under 100MB
- Verify file type is not blocked (no .js, .html, .svg, .xml)
- Check Vercel function logs for errors

### Download Not Working
- Verify share ID exists and hasn't expired
- Check file data is properly stored in MongoDB
- Review Vercel function logs

## Local Development

### Setup
```bash
# Install dependencies
npm install

# Create .env file with MongoDB connection
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run local server
npm run dev
```

### Test Locally
```bash
# Upload a file
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "test.txt",
    "mimeType": "text/plain",
    "size": 12,
    "fileData": "dGVzdCBjb250ZW50"
  }'

# Get file info
curl "http://localhost:3000/api/file?id=<share-id>"

# Download file
curl "http://localhost:3000/api/download?id=<share-id>" --output downloaded.txt
```

## Production Checklist
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with strong password
- [ ] Network access configured (0.0.0.0/0 or Vercel IPs)
- [ ] `MONGO_URL` set in Vercel environment variables
- [ ] `MONGO_DB` set in Vercel environment variables (optional)
- [ ] Code deployed to Vercel
- [ ] Upload endpoint tested successfully
- [ ] Download endpoint tested successfully
- [ ] Share links working correctly
- [ ] File expiry working (wait 24h or modify `EXPIRY_HOURS` for testing)

## Support
For issues or questions, contact the Amertak Network team.